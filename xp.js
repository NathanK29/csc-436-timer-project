import { supabase } from './supabase.js'

function xpForLevel(level) {
    if (level <= 1) return 0
    return Math.floor(100 * Math.pow(level - 1, 1.5))
}

export function getLevelFromXP(totalXp) {
    let level = 1
    while (xpForLevel(level + 1) <= totalXp) {
        level++
    }
    return level
}

export function getXpProgress(totalXp) {
    const level = getLevelFromXP(totalXp)
    const currentLevelXp = xpForLevel(level)
    const nextLevelXp = xpForLevel(level + 1)
    const xpIntoLevel = totalXp - currentLevelXp
    const xpNeeded = nextLevelXp - currentLevelXp
    return { level, totalXp, xpIntoLevel, xpNeeded, progressPct: (xpIntoLevel / xpNeeded) * 100 }
}

export function getLevelTitle(level) {
    if (level <= 2)  return 'Newbie'
    if (level <= 5)  return 'Apprentice'
    if (level <= 10) return 'Scholar'
    if (level <= 15) return 'Focused Mind'
    if (level <= 20) return 'Deep Thinker'
    if (level <= 30) return 'Knowledge Seeker'
    if (level <= 40) return 'Zen Master'
    if (level <= 50) return 'Enlightened'
    return 'Legendary'
}

const XP_PER_FOCUS_MINUTE = 10

let cachedTotalXp = 0
let cachedUserId = null
let onXpChange = null

function xpStorageKey(userId) {
    return `xp_total_${userId}`
}

export async function initXP(userId, onChange) {
    onXpChange = onChange
    cachedUserId = userId

    const cached = Number(localStorage.getItem(xpStorageKey(userId)) || 0)
    cachedTotalXp = cached
    notify()

    const { data, error } = await supabase
        .from('Users')
        .select('total_xp')
        .eq('user_id', userId)
        .maybeSingle()

    if (error) {
        console.error('Failed to load XP:', error)
        return
    }

    const dbXp = data?.total_xp ?? 0
    if (dbXp !== cachedTotalXp) {
        cachedTotalXp = dbXp
        localStorage.setItem(xpStorageKey(userId), cachedTotalXp)
        notify()
    }
}

export async function awardFocusMinuteXP() {
    if (!cachedUserId) return null

    const prevLevel = getLevelFromXP(cachedTotalXp)
    cachedTotalXp += XP_PER_FOCUS_MINUTE
    const newLevel = getLevelFromXP(cachedTotalXp)
    localStorage.setItem(xpStorageKey(cachedUserId), cachedTotalXp)
    notify()

    const { error } = await supabase
        .from('Users')
        .update({ total_xp: cachedTotalXp })
        .eq('user_id', cachedUserId)

    if (error) console.error('Failed to save XP:', error)

    return newLevel > prevLevel ? newLevel : null
}

export function getCurrentXP() {
    return cachedTotalXp
}

function notify() {
    if (onXpChange) onXpChange(getXpProgress(cachedTotalXp))
}