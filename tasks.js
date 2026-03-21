import { supabase } from './supabase.js'

let currentUserId = null
let editingTaskId = null

export function initTasks(userId) {
    currentUserId = userId
    loadTasks()

    document.getElementById('add-task-btn').addEventListener('click', () => openModal())
    document.getElementById('task-form').addEventListener('submit', handleSubmit)
    document.getElementById('modal-cancel').addEventListener('click', closeModal)
    document.getElementById('task-modal-overlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeModal()
    })
}

async function loadTasks() {
    const { data, error } = await supabase
        .from('user_tasks')
        .select('*')
        .eq('user_id', currentUserId)
        .order('date_created', { ascending: false })

    if (error) { console.error('Failed to load tasks:', error); return }
    renderTasks(data)
}

function renderTasks(tasks) {
    const list = document.getElementById('task-list')

    if (!tasks || tasks.length === 0) {
        list.innerHTML = '<p class="task-empty">No tasks yet. Add one to get started!</p>'
        return
    }

    list.innerHTML = tasks.map(task => {
        const completed = !!task.date_completed
        const created = new Date(task.date_created).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        })
        const completedDate = task.date_completed
            ? new Date(task.date_completed).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : null

        return `
            <div class="task-card ${completed ? 'task-completed' : ''}">
                <div class="task-check">
                    <input type="checkbox" ${completed ? 'checked' : ''}
                        onchange="window.toggleTaskComplete(${task.task_id}, this.checked)">
                </div>
                <div class="task-content">
                    <div class="task-title">${escapeHtml(task.title)}</div>
                    ${task.body ? `<div class="task-body">${escapeHtml(task.body)}</div>` : ''}
                    <div class="task-meta">
                        Created ${created}${completedDate ? ` · Completed ${completedDate}` : ''}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="task-btn task-edit" onclick="window.openEditTask(${task.task_id})">✏️</button>
                    <button class="task-btn task-delete" onclick="window.deleteTask(${task.task_id})">🗑️</button>
                </div>
            </div>
        `
    }).join('')
}

function openModal(task = null) {
    editingTaskId = task ? task.task_id : null
    document.getElementById('modal-title').textContent = task ? 'Edit Task' : 'New Task'
    document.getElementById('task-title-input').value = task ? task.title : ''
    document.getElementById('task-body-input').value = task ? (task.body ?? '') : ''
    document.getElementById('task-modal-overlay').classList.remove('hidden')
    document.getElementById('task-title-input').focus()
}

function closeModal() {
    document.getElementById('task-modal-overlay').classList.add('hidden')
    editingTaskId = null
}

async function handleSubmit(e) {
    e.preventDefault()
    const title = document.getElementById('task-title-input').value.trim()
    const body = document.getElementById('task-body-input').value.trim()
    if (!title) return

    if (editingTaskId) {
        const { error } = await supabase
            .from('user_tasks')
            .update({ title, body: body || null })
            .eq('task_id', editingTaskId)

        if (error) { console.error('Failed to update task:', error); return }
    } else {
        const { error } = await supabase
            .from('user_tasks')
            .insert({ title, body: body || null, user_id: currentUserId, date_created: new Date().toISOString() })

        if (error) { console.error('Failed to create task:', error); return }
    }

    closeModal()
    loadTasks()
}

window.openEditTask = async (taskId) => {
    const { data, error } = await supabase
        .from('user_tasks')
        .select('*')
        .eq('task_id', taskId)
        .single()

    if (error) { console.error('Failed to fetch task:', error); return }
    openModal(data)
}

function confirmDelete() {
    return new Promise((resolve) => {
        const overlay = document.getElementById('confirm-overlay')
        overlay.classList.remove('hidden')

        const onConfirm = () => { cleanup(); resolve(true) }
        const onCancel = () => { cleanup(); resolve(false) }

        function cleanup() {
            overlay.classList.add('hidden')
            document.getElementById('confirm-delete').removeEventListener('click', onConfirm)
            document.getElementById('confirm-cancel').removeEventListener('click', onCancel)
            overlay.removeEventListener('click', onOverlayClick)
        }

        function onOverlayClick(e) {
            if (e.target === overlay) onCancel()
        }

        document.getElementById('confirm-delete').addEventListener('click', onConfirm)
        document.getElementById('confirm-cancel').addEventListener('click', onCancel)
        overlay.addEventListener('click', onOverlayClick)
    })
}

window.deleteTask = async (taskId) => {
    const confirmed = await confirmDelete()
    if (!confirmed) return
    const { error } = await supabase.from('user_tasks').delete().eq('task_id', taskId)
    if (error) { console.error('Failed to delete task:', error); return }
    loadTasks()
}

window.toggleTaskComplete = async (taskId, completed) => {
    const { error } = await supabase
        .from('user_tasks')
        .update({ date_completed: completed ? new Date().toISOString() : null })
        .eq('task_id', taskId)

    if (error) { console.error('Failed to update task:', error); return }
    loadTasks()
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
