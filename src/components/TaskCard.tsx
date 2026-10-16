// ─── TaskCard.tsx ─────────────────────────────────────────────────────────────
// Renders a single task as a card inside a Kanban column.
// Receives task data and action callbacks via props.
// Clean, professional layout with SVG iconography (no emojis).
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import type { Task, TaskStatus } from '../types'

type TaskCardProps = {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (_id: string) => void
  onMove: (_id: string, newStatus: TaskStatus) => void
}

// ─── Priority badge styles ───────────────────────────────────────────────────
const priorityStyles: Record<string, string> = {
  high:   'bg-red-50 text-red-600 border border-red-200/60',
  medium: 'bg-amber-50 text-amber-700 border border-amber-200/60',
  low:    'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
}

// ─── Date formatter ───────────────────────────────────────────────────────────
const formatDate = (dateStr: string): string | null => {
  if (!dateStr) return null
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function TaskCard({ task, onEdit, onDelete, onMove }: TaskCardProps) {
  const [hovered, setHovered] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const isDone = task.status === 'done'

  // Overdue check for uncompleted tasks with past due dates
  const isOverdue = Boolean(
    task.dueDate &&
    !isDone &&
    new Date(task.dueDate + 'T23:59:59') < new Date()
  )

  return (
    <div
      className={`bg-white rounded-2xl p-4 shadow-xs mb-3 relative transition-all duration-200 border border-pink-100/40 ${
        hovered ? 'shadow-md -translate-y-0.5 border-pink-200/70' : ''
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false)
        setConfirmDelete(false)
      }}
    >
      {/* ─── Inline Delete Confirmation ─────────────────────────────────────── */}
      {confirmDelete ? (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 mb-3 text-xs text-rose-800">
          <p className="font-semibold mb-2">Delete this task permanently?</p>
          <div className="flex gap-2">
            <button
              onClick={() => onDelete(task._id)}
              className="bg-rose-500 hover:bg-rose-600 text-white font-semibold px-3 py-1 rounded-lg transition"
            >
              Delete
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="bg-white hover:bg-gray-100 text-gray-700 px-3 py-1 rounded-lg border border-gray-200 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {/* ─── Card Actions (Edit + Delete) ──────────────────────────────────── */}
      {hovered && !confirmDelete && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {/* Edit button */}
          <button
            onClick={() => onEdit(task)}
            className="w-6 h-6 bg-pink-50 hover:bg-pink-100 text-pink-600 rounded-full flex items-center justify-center transition"
            title="Edit task"
            aria-label="Edit task"
          >
            <svg className="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>

          {/* Delete button */}
          <button
            onClick={() => setConfirmDelete(true)}
            className="w-6 h-6 bg-pink-50 hover:bg-rose-100 text-pink-400 hover:text-rose-600 rounded-full text-base leading-none font-bold flex items-center justify-center transition"
            title="Delete task"
            aria-label="Delete task"
          >
            ×
          </button>
        </div>
      )}

      {/* ─── Metadata Header ───────────────────────────────────────────────── */}
      <div className="flex justify-between items-center mb-2.5 pr-14">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${priorityStyles[task.priority]}`}>
          {task.priority}
        </span>

        <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
          {task.category}
        </span>
      </div>

      {/* ─── Task Title ────────────────────────────────────────────────────── */}
      <h3 className={`font-semibold text-sm mb-1 leading-snug ${isDone ? 'line-through text-gray-400' : 'text-gray-800'}`}>
        {task.title}
      </h3>

      {/* ─── Task Description ──────────────────────────────────────────────── */}
      {task.description ? (
        <p className={`text-xs mb-2 leading-relaxed line-clamp-3 ${isDone ? 'line-through text-gray-300' : 'text-gray-500'}`}>
          {task.description}
        </p>
      ) : null}

      {/* ─── Due Date ──────────────────────────────────────────────────────── */}
      {task.dueDate ? (
        <div className="mb-2">
          {isOverdue ? (
            <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              Overdue · {formatDate(task.dueDate)}
            </span>
          ) : (
            <span className="text-xs text-gray-400 inline-flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-gray-400 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>
      ) : null}

      {/* ─── Divider ────────────────────────────────────────────────────────── */}
      <div className="border-t border-gray-100 pt-2 mt-2" />

      {/* ─── Column Transition Controls ─────────────────────────────────────── */}
      <div className="flex justify-between items-center text-xs">
        <button
          onClick={() => onMove(task._id, 'todo')}
          disabled={task.status === 'todo'}
          className={`transition font-medium ${
            task.status === 'todo'
              ? 'text-pink-500 font-semibold cursor-default'
              : 'text-gray-300 hover:text-pink-400'
          }`}
        >
          To Do
        </button>

        <button
          onClick={() => onMove(task._id, 'inprogress')}
          disabled={task.status === 'inprogress'}
          className={`transition font-medium ${
            task.status === 'inprogress'
              ? 'text-purple-600 font-semibold cursor-default'
              : 'text-gray-300 hover:text-purple-500'
          }`}
        >
          In Progress
        </button>

        <button
          onClick={() => onMove(task._id, 'done')}
          disabled={task.status === 'done'}
          className={`transition font-medium ${
            task.status === 'done'
              ? 'text-emerald-600 font-semibold cursor-default'
              : 'text-gray-300 hover:text-emerald-500'
          }`}
        >
          Done
        </button>
      </div>
    </div>
  )
}

export default TaskCard