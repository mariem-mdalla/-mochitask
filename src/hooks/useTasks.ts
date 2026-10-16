// ─── useTasks.ts ──────────────────────────────────────────────────────────────
// Custom hook that owns ALL task state and logic.
// App.tsx just calls this and uses what it returns — no business logic in the UI layer.
//
// Key patterns used here:
//   • Optimistic updates  — UI changes immediately; rolls back silently if the API fails.
//   • Functional updaters — setTasks(prev => ...) instead of setTasks([...tasks]) avoids
//     stale closure bugs when multiple state updates queue up in the same render cycle.
//   • useCallback         — memoises handlers so passing them as props doesn't force
//     child components to re-render on every parent render.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react'
import { getTasks, addTask, editTask, deleteTask, moveTask } from '../api'
import type { Task, TaskStatus, TaskPriority, TaskUpdate } from '../types'

// Declare the full shape of what this hook returns so consumers get autocomplete.
type UseTasksReturn = {
  tasks: Task[]
  filteredTasks: Task[]
  loading: boolean
  loadError: string | null
  actionError: string | null
  clearActionError: () => void
  search: string
  setSearch: (v: string) => void
  handleAdd:    (title: string, description: string, priority: TaskPriority, category: string, dueDate: string) => Promise<void>
  handleEdit:   (_id: string, updates: TaskUpdate) => Promise<void>
  handleDelete: (_id: string) => Promise<void>
  handleMove:   (_id: string, newStatus: TaskStatus) => Promise<void>
  progress: number
  done: number
  total: number
}

export function useTasks(): UseTasksReturn {
  // ─── State ─────────────────────────────────────────────────────────────────
  const [tasks,       setTasks]       = useState<Task[]>([])
  const [loading,     setLoading]     = useState(true)
  const [loadError,   setLoadError]   = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [search,      setSearch]      = useState('')

  // ─── Auto-dismiss action error toast after 4 s ────────────────────────────
  // The cleanup return cancels the old timer before starting a new one,
  // so rapid errors don't stack up and dismiss each other too early.
  useEffect(() => {
    if (!actionError) return
    const timer = setTimeout(() => setActionError(null), 4000)
    return () => clearTimeout(timer)
  }, [actionError])

  // ─── Initial data fetch ───────────────────────────────────────────────────
  // Runs once when the component mounts (empty dependency array).
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoadError(null)
        const data = await getTasks()
        setTasks(data)
      } catch (err) {
        // Keep the loadError separate from actionError — a failed initial load
        // is fatal (we have nothing to show), so it gets a full-screen treatment.
        setLoadError(err instanceof Error ? err.message : 'Failed to load tasks')
      } finally {
        setLoading(false)
      }
    }
    loadTasks()
  }, [])

  // ─── handleAdd ────────────────────────────────────────────────────────────
  // No optimistic update here — we need the server-generated _id before we can
  // add the task to local state. The modal's "Adding..." spinner covers the wait.
  const handleAdd = useCallback(async (
    title: string,
    description: string,
    priority: TaskPriority,
    category: string,
    dueDate: string
  ) => {
    try {
      const newTask = await addTask(title, description, priority, category, dueDate)
      setTasks(prev => [...prev, newTask])
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to add task')
      throw err // re-throw so the modal knows to stay open and re-enable its button
    }
  }, [])

  // ─── handleEdit (optimistic) ─────────────────────────────────────────────
  // Apply the edits locally first, then confirm with the server.
  // If the server rejects them (e.g. validation error), we roll back.
  const handleEdit = useCallback(async (_id: string, updates: TaskUpdate) => {
    let previousTask: Task | undefined

    // Capture the current task and apply updates in the same functional updater.
    // We use a functional updater so `prev` is always the latest state.
    setTasks(prev => {
      previousTask = prev.find(t => t._id === _id)
      return prev.map(t => t._id === _id ? { ...t, ...updates } : t)
    })

    try {
      // Sync with the actual server response — the server may have trimmed the title, etc.
      const updated = await editTask(_id, updates)
      setTasks(prev => prev.map(t => t._id === _id ? updated : t))
    } catch (err) {
      // Rollback: restore the task to what it was before the edit
      if (previousTask) {
        setTasks(prev => prev.map(t => t._id === _id ? previousTask! : t))
      }
      setActionError(err instanceof Error ? err.message : 'Failed to update task')
      throw err
    }
  }, [])

  // ─── handleDelete (optimistic) ───────────────────────────────────────────
  // Remove the card immediately — it feels instant. Re-add it if the server fails.
  const handleDelete = useCallback(async (_id: string) => {
    let removedTask: Task | undefined

    setTasks(prev => {
      removedTask = prev.find(t => t._id === _id)
      return prev.filter(t => t._id !== _id)
    })

    try {
      await deleteTask(_id)
    } catch (err) {
      // Rollback: put the task back where it was
      if (removedTask) setTasks(prev => [...prev, removedTask!])
      setActionError(err instanceof Error ? err.message : 'Failed to delete task')
    }
  }, [])

  // ─── handleMove (optimistic) ─────────────────────────────────────────────
  // Move the card to its new column immediately, revert if the server disagrees.
  const handleMove = useCallback(async (_id: string, newStatus: TaskStatus) => {
    let previousStatus: TaskStatus | undefined

    setTasks(prev => {
      previousStatus = prev.find(t => t._id === _id)?.status
      return prev.map(t => t._id === _id ? { ...t, status: newStatus } : t)
    })

    try {
      await moveTask(_id, newStatus)
    } catch (err) {
      // Rollback: move the card back to where it was
      if (previousStatus !== undefined) {
        setTasks(prev => prev.map(t => t._id === _id ? { ...t, status: previousStatus! } : t))
      }
      setActionError(err instanceof Error ? err.message : 'Failed to move task')
    }
  }, [])

  const clearActionError = useCallback(() => setActionError(null), [])

  // ─── Derived values ───────────────────────────────────────────────────────
  // Computed fresh from `tasks` every render — never stored in state.
  // Storing derived values in state is a common source of sync bugs.

  // Search filters on title only — fast enough for typical task counts.
  // toLowerCase() on both sides makes the match case-insensitive.
  const filteredTasks = tasks.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase())
  )

  const done  = tasks.filter(t => t.status === 'done').length
  const total = tasks.length
  const progress = total > 0 ? Math.round((done / total) * 100) : 0

  return {
    tasks, filteredTasks, loading, loadError,
    actionError, clearActionError,
    search, setSearch,
    handleAdd, handleEdit, handleDelete, handleMove,
    progress, done, total,
  }
}
