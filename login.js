import { supabase } from './supabase.js'

// If already logged in, skip the login page
const { data: { session } } = await supabase.auth.getSession()
if (session) {
    window.location.replace('index.html')
}

// --- Form toggles ---

document.getElementById('show-create').addEventListener('click', (e) => {
    e.preventDefault()
    document.getElementById('login-section').style.display = 'none'
    document.getElementById('create-section').style.display = 'block'
    document.getElementById('create-error').textContent = ''
})

document.getElementById('show-login').addEventListener('click', (e) => {
    e.preventDefault()
    document.getElementById('create-section').style.display = 'none'
    document.getElementById('login-section').style.display = 'block'
    document.getElementById('login-error').textContent = ''
})

// --- Login ---

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = document.getElementById('login-email').value.trim()
    const password = document.getElementById('login-password').value
    const errorEl = document.getElementById('login-error')
    errorEl.textContent = ''

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
        errorEl.textContent = error.message
        return
    }

    window.location.href = 'index.html'
})

// --- Create Account ---

document.getElementById('create-form').addEventListener('submit', async (e) => {
    e.preventDefault()
	const username = document.getElementById('create-username').value.trim()
    const email = document.getElementById('create-email').value.trim()
    const password = document.getElementById('create-password').value
    const confirm = document.getElementById('create-confirm').value
    const errorEl = document.getElementById('create-error')
    errorEl.textContent = ''

    if (password !== confirm) {
        errorEl.textContent = 'Passwords do not match.'
        return
    }
	
	const { data: existing } = await supabase
        .from('Users')
        .select('username')
        .eq('username', username)
        .maybeSingle()
		
	if (existing) {
        errorEl.textContent = 'That username is already taken.'
        return
    }

    const { data: signUpData, error } = await supabase.auth.signUp({ email, password })

    if (error) {
        errorEl.textContent = error.message
        return
    }
	
	if (signUpData.user) {
    const { error: insertErr } = await supabase.from('Users').insert({
        user_id: signUpData.user.id,
        username: username,
        email: email
    })
		console.log('Users insert result:', insertErr || 'success')
	}
	
    // Supabase sends a confirmation email by default.
    // Show a message instead of redirecting immediately.
    document.getElementById('create-section').innerHTML = `
        <h2>Check your email</h2>
        <p style="text-align:center; color:#444;">
            We sent a confirmation link to <strong>${email}</strong>.<br>
            Click it to activate your account, then log in.
        </p>
        <p class="auth-switch"><a href="#" id="back-to-login">Back to login</a></p>
    `
    document.getElementById('back-to-login').addEventListener('click', (ev) => {
        ev.preventDefault()
        document.getElementById('create-section').style.display = 'none'
        document.getElementById('login-section').style.display = 'block'
    })
})
