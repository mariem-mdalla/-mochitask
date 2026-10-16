// ─── EditTaskModal.tsx ────────────────────────────────────────────────────────
// Pre-populated edit form for an existing task.
// Mirrors AddTaskModal in structure, but initialises fields from the task being edited
// and calls onEdit instead of onAdd.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import type { Task, TaskPriority, TaskUpdate } from '../types'

type EditTaskModalProps = {
  // The task being edited — used to pre-fill the form fields
  task: Task
  onEdit: (_id: string, updates: TaskUpdate) => Promise<void>
  onClose: () => void
}

function EditTaskModal({ task, onEdit, onClose }: EditTaskModalProps) {
  // Initialise each field from the existing task so the user sees their current values
  const [title,       setTitle]       = useState(task.title)
  const [description, setDescription] = useState(task.description || '')
  const [priority,    setPriority]    = useState<TaskPriority>(task.priority)
  const [category,    setCategory]    = useState(task.category)
  const [dueDate,     setDueDate]     = useState(task.dueDate || '')
  const [submitting,  setSubmitting]  = useState(false)

  const handleSubmit = async () => {
    if (!title.trim()) return
    try {
      setSubmitting(true)
      await onEdit(task._id, {
        title: title.trim(),
        description: description.trim(),
        priority,
        category,
        dueDate,
      })
      onClose()
    } catch {
      // onEdit already set the toast error — just re-enable the button
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl mx-4 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Edit task ✏️</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-pink-50 hover:bg-pink-100 rounded-full flex items-center justify-center text-gray-400 transition"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Title */}
        <div className="mb-4">
          <label className="text-sm text-gray-500 mb-1 block">Title</label>
          <input
            className="w-full bg-pink-50 border border-pink-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-pink-400 placeholder-pink-300"
            placeholder="What needs doing?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit()
              if (e.key === 'Escape') onClose()
            }}
            autoFocus
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="text-sm text-gray-500 mb-1 block">
            Description
            <span className="text-pink-300 ml-1">(optional)</span>
          </label>
          <textarea
            className="w-full bg-pink-50 border border-pink-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-pink-400 placeholder-pink-300 resize-none"
            placeholder="Add any extra details..."
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Priority + Category side by side */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="text-sm text-gray-500 mb-1 block">Priority</label>
            <select
              className="w-full bg-pink-50 border border-pink-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-pink-400 text-gray-700"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
            >
              <option value="high">HIGH</option>
              <option value="medium">MEDIUM</option>
              <option value="low">LOW</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="text-sm text-gray-500 mb-1 block">Category</label>
            <select
              className="w-full bg-pink-50 border border-pink-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-pink-400 text-gray-700"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>Personal</option>
              <option>Work</option>
              <option>Shopping</option>
              <option>Learning</option>
            </select>
          </div>
        </div>

        {/* Due date */}
        <div className="mb-6">
          <label className="text-sm text-gray-500 mb-1 block">Due date</label>
          <input
            type="date"
            className="w-full bg-pink-50 border border-pink-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-pink-400 text-gray-700"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        {/* Save button */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-pink-400 hover:bg-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-2xl transition-all duration-200"
        >
          {submitting ? 'Saving...' : 'Save changes 🌸'}
        </button>
      </div>
    </div>
  )
}

export default EditTaskModal
