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
let onXpChange = null

export async function initXP(userId, onChange) {
    onXpChange = onChange
    cachedTotalXp = Number(localStorage.getItem('xp_total') || 0)
    notify()
}

export async function awardFocusMinuteXP() {
    const prevLevel = getLevelFromXP(cachedTotalXp)
    cachedTotalXp += XP_PER_FOCUS_MINUTE
    localStorage.setItem('xp_total', cachedTotalXp)
    const newLevel = getLevelFromXP(cachedTotalXp)
    notify()
    return newLevel > prevLevel ? newLevel : null
}

export function getCurrentXP() {
    return cachedTotalXp
}

function notify() {
    if (onXpChange) onXpChange(getXpProgress(cachedTotalXp))
}