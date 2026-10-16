// ─── TaskCard.tsx ─────────────────────────────────────────────────────────────
// Renders a single task as a card inside a Kanban column.
// Receives task data and action callbacks via props.
//
// UX Improvements included:
//   • Confirm-before-delete inline dialog to prevent accidental deletion
//   • Edit button (✏️) to edit title, description, priority, category, dueDate
//   • Overdue indicator with rose badge when due date is past and task is not done
//   • Optional task description display with clean typography
//   • Context-aware column move buttons (disabled for current column)
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
  high:   'bg-red-100 text-red-600',
  medium: 'bg-amber-100 text-amber-700',
  low:    'bg-emerald-100 text-emerald-700',
}

// ─── Category emoji lookup ───────────────────────────────────────────────────
const categoryEmojis: Record<string, string> = {
  Work:     '💼',
  Personal: '🌷',
  Shopping: '🛍️',
  Learning: '📚',
}

// ─── Date formatter ───────────────────────────────────────────────────────────
// Formats "2026-06-24" into "Jun 24" in the user's local timezone.
const formatDate = (dateStr: string): string | null => {
  if (!dateStr) return null
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function TaskCard({ task, onEdit, onDelete, onMove }: TaskCardProps) {
  const [hovered, setHovered] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const isDone = task.status === 'done'

  // Calculate if due date is in the past for uncompleted tasks
  const isOverdue = Boolean(
    task.dueDate &&
    !isDone &&
    new Date(task.dueDate + 'T23:59:59') < new Date()
  )

  return (
    <div
      className={`bg-white rounded-2xl p-4 shadow-sm mb-3 relative transition-all duration-200 border border-pink-50/50 ${
        hovered ? 'shadow-md -translate-y-0.5' : ''
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false)
        setConfirmDelete(false) // cancel pending delete confirmation when mouse leaves
      }}
    >
      {/* ─── Inline Delete Confirmation Overlay ─────────────────────────────── */}
      {confirmDelete ? (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 mb-3 text-xs text-rose-700">
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

      {/* ─── Card Action Buttons (Edit + Delete) ─────────────────────────────── */}
      {/* Visible on hover or when confirmation is active */}
      {hovered && !confirmDelete && (
        <div className="absolute top-3 right-3 flex items-center gap-1">
          {/* Edit button */}
          <button
            onClick={() => onEdit(task)}
            className="w-6 h-6 bg-pink-50 hover:bg-pink-100 text-pink-500 rounded-full text-xs flex items-center justify-center transition"
            title="Edit task"
            aria-label="Edit task"
          >
            ✏️
          </button>

          {/* Delete prompt button */}
          <button
            onClick={() => setConfirmDelete(true)}
            className="w-6 h-6 bg-pink-50 hover:bg-rose-100 text-pink-400 hover:text-rose-600 rounded-full text-sm font-bold flex items-center justify-center transition"
            title="Delete task"
            aria-label="Delete task"
          >
            ×
          </button>
        </div>
      )}

      {/* ─── Metadata Header: Priority + Category ──────────────────────────── */}
      <div className="flex justify-between items-center mb-2 pr-14">
        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${priorityStyles[task.priority]}`}>
          {task.priority}
        </span>

        <span className="text-xs text-gray-500 flex items-center gap-1 font-medium">
          <span>{categoryEmojis[task.category] || '📌'}</span>
          <span>{task.category}</span>
        </span>
      </div>

      {/* ─── Task Title ────────────────────────────────────────────────────── */}
      <h3 className={`font-semibold text-sm mb-1 leading-snug ${isDone ? 'line-through text-gray-400' : 'text-gray-800'}`}>
        {task.title}
      </h3>

      {/* ─── Task Description (optional) ────────────────────────────────────── */}
      {task.description ? (
        <p className={`text-xs mb-2 leading-relaxed line-clamp-3 ${isDone ? 'line-through text-gray-300' : 'text-gray-500'}`}>
          {task.description}
        </p>
      ) : null}

      {/* ─── Due Date & Overdue Badge ───────────────────────────────────────── */}
      {task.dueDate ? (
        <div className="mb-2">
          {isOverdue ? (
            <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
              ⚠️ Overdue · {formatDate(task.dueDate)}
            </span>
          ) : (
            <span className="text-xs text-gray-400 inline-flex items-center gap-1">
              📅 {formatDate(task.dueDate)}
            </span>
          )}
        </div>
      ) : null}

      {/* ─── Divider ────────────────────────────────────────────────────────── */}
      <div className="border-t border-gray-100 pt-2 mt-2" />

      {/* ─── Column Transition Controls ─────────────────────────────────────── */}
      <div className="flex justify-between items-center text-xs">
        {/* Move to To Do */}
        <button
          onClick={() => onMove(task._id, 'todo')}
          disabled={task.status === 'todo'}
          className={`transition flex items-center gap-0.5 ${
            task.status === 'todo'
              ? 'text-pink-400 font-semibold cursor-default'
              : 'text-gray-300 hover:text-pink-400'
          }`}
        >
          To Do
        </button>

        {/* Move to In Progress */}
        <button
          onClick={() => onMove(task._id, 'inprogress')}
          disabled={task.status === 'inprogress'}
          className={`transition ${
            task.status === 'inprogress'
              ? 'text-purple-600 font-semibold cursor-default'
              : 'text-gray-300 hover:text-purple-500'
          }`}
        >
          In Progress
        </button>

        {/* Move to Done */}
        <button
          onClick={() => onMove(task._id, 'done')}
          disabled={task.status === 'done'}
          className={`transition flex items-center gap-0.5 ${
            task.status === 'done'
              ? 'text-emerald-600 font-semibold cursor-default'
              : 'text-gray-300 hover:text-emerald-500'
          }`}
        >
          Done ✓
        </button>
      </div>
    </div>
  )
}

export default TaskCard