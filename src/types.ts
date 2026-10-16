// ─── types.ts ─────────────────────────────────────────────────────────────────
// Single source of truth for all shared TypeScript types in MochiTask.
// Adding or changing a field here automatically propagates to every file that imports it.
// ─────────────────────────────────────────────────────────────────────────────

// The shape of a Task object — mirrors exactly what MongoDB/the backend returns.
export type Task = {
  _id: string                             // MongoDB auto-generated unique identifier
  title: string                           // the task description (required)
  description: string                     // optional extra detail — empty string when not set
  priority: 'high' | 'medium' | 'low'   // union type — TypeScript rejects any other string
  category: string                        // Work, Personal, Shopping, Learning
  status: 'todo' | 'inprogress' | 'done' // which Kanban column this task lives in
  dueDate: string                         // ISO date string "YYYY-MM-DD", or "" if not set
}

// TaskStatus / TaskPriority "pull out" their types directly from Task.
// This way, if we ever rename a status value, these types update automatically.
export type TaskStatus   = Task['status']
export type TaskPriority = Task['priority']

// The fields a user can edit on an existing task (excludes _id, status, and userId).
// Used by EditTaskModal → useTasks.handleEdit → api.editTask.
export type TaskUpdate = {
  title: string
  description: string
  priority: TaskPriority
  category: string
  dueDate: string
}
