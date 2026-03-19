import { supabase } from './supabase.js'

let sessionId = null
let focusMinutesCompleted = 0
let cachedAccessToken = null

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export async function startSession(userId, accessToken) {
    cachedAccessToken = accessToken
    focusMinutesCompleted = 0

    const { data, error } = await supabase
        .from('user_sessions')
        .insert({
            user_id: userId,
            session_start: new Date().toISOString(),
            session_length: 0
        })
        .select('session_id')
        .single()

    if (error) {
        console.error('Failed to start session:', error)
        return
    }
    sessionId = data.session_id
}

export function addFocusMinute() {
    focusMinutesCompleted++
}

export async function endSession() {
    if (!sessionId) return
    const id = sessionId
    sessionId = null

    if (focusMinutesCompleted === 0) {
        await supabase.from('user_sessions').delete().eq('session_id', id)
    } else {
        await supabase
            .from('user_sessions')
            .update({
                session_end: new Date().toISOString(),
                session_length: focusMinutesCompleted
            })
            .eq('session_id', id)
    }
}

export function endSessionSync() {
    if (!sessionId || !cachedAccessToken) return
    const id = sessionId
    sessionId = null

    const url = `${SUPABASE_URL}/rest/v1/user_sessions?session_id=eq.${id}`
    const headers = {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${cachedAccessToken}`
    }

    if (focusMinutesCompleted === 0) {
        fetch(url, { method: 'DELETE', headers, keepalive: true })
    } else {
        fetch(url, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({
                session_end: new Date().toISOString(),
                session_length: focusMinutesCompleted
            }),
            keepalive: true
        })
    }
}
