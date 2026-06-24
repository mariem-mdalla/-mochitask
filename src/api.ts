// Uses local backend in development, deployed backend in production
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const getTasks = async () => {
  const response = await fetch(`${BASE_URL}/tasks`)
  return response.json()
}

export const addTask = async (
  title: string,
  priority: string,
  category: string,
  dueDate: string
) => {
  const response = await fetch(`${BASE_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, priority, category, dueDate })
  })
  return response.json()
}

export const deleteTask = async (id: string) => {
  await fetch(`${BASE_URL}/tasks/${id}`, { method: 'DELETE' })
}

export const moveTask = async (id: string, status: string) => {
  const response = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  })
  return response.json()
}