// ─── api.ts ───────────────────────────────────────────────────────────────────
// All HTTP communication with the backend lives here.
// Components never call fetch() directly — they call these typed functions instead,
// which means URL, header, and error-handling logic only exists in one place.
// ─────────────────────────────────────────────────────────────────────────────

import type { Task, TaskUpdate } from './types'

// import.meta.env reads from the .env file at build time (Vite's convention).
// In production, set VITE_API_URL to the deployed backend URL.
const rawUrl = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:3000'
export const BASE_URL = rawUrl.replace(/\/+$/, '')

// ─── User Identity ────────────────────────────────────────────────────────────
// Each browser gets a persistent random UUID stored in localStorage.
// This gives every user a private task list without requiring a login system.
// Clearing localStorage or using a different browser creates a new identity.
const getUserId = (): string => {
  let userId = localStorage.getItem('mochiUserId')
  if (!userId) {
    // crypto.randomUUID() is a modern browser built-in — no library needed.
    // It produces a UUID v4 like "550e8400-e29b-41d4-a716-446655440000".
    userId = crypto.randomUUID()
    localStorage.setItem('mochiUserId', userId)
  }
  return userId
}

// Every request carries these headers.
// X-User-ID is our custom header — the backend reads it to scope queries to the right user.
const getHeaders = (): Record<string, string> => ({
  'Content-Type': 'application/json',
  'X-User-ID': getUserId(),
})

// ─── API Functions ─────────────────────────────────────────────────────────────

// GET /tasks — returns all tasks belonging to this user
export const getTasks = async (): Promise<Task[]> => {
  const response = await fetch(`${BASE_URL}/tasks`, { headers: getHeaders() })
  if (!response.ok) throw new Error(`Failed to fetch tasks (HTTP ${response.status})`)
  return response.json() as Promise<Task[]>
}

// POST /tasks — creates a new task and returns it with its MongoDB _id
export const addTask = async (
  title: string,
  description: string,
  priority: string,
  category: string,
  dueDate: string
): Promise<Task> => {
  const response = await fetch(`${BASE_URL}/tasks`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ title, description, priority, category, dueDate }),
  })
  if (!response.ok) {
    // Try to surface the server's validation message (e.g. "Title is required")
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error || `Failed to add task (HTTP ${response.status})`)
  }
  return response.json() as Promise<Task>
}

// PUT /tasks/:id — replaces editable fields on an existing task
// We use PUT (not PATCH) because we're sending the full set of editable fields.
export const editTask = async (id: string, updates: TaskUpdate): Promise<Task> => {
  const response = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(updates),
  })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error || `Failed to update task (HTTP ${response.status})`)
  }
  return response.json() as Promise<Task>
}

// DELETE /tasks/:id — permanently removes a task
export const deleteTask = async (id: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  })
  if (!response.ok) throw new Error(`Failed to delete task (HTTP ${response.status})`)
}

// PATCH /tasks/:id — updates only the status field (move between Kanban columns)
export const moveTask = async (id: string, status: string): Promise<Task> => {
  const response = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ status }),
  })
  if (!response.ok) throw new Error(`Failed to move task (HTTP ${response.status})`)
  return response.json() as Promise<Task>
}