import { useState } from 'react'

// Props this component receives from Column
type TaskCardProps = {
  _id: string                                              // MongoDB ID
  title: string
  priority: "high" | "medium" | "low"
  category: string
  dueDate: string
  isDone: boolean // added this 
  onDelete: (_id: string) => void                        // function to delete this task
  onMove: (_id: string, newStatus: "todo" | "inprogress" | "done") => void  // function to move this task
}

// Tailwind classes for each priority level
const priorityStyles = {
  high: "bg-red-100 text-red-500",
  medium: "bg-yellow-100 text-yellow-600",
  low: "bg-green-100 text-green-600",
}

// Emoji for each category
const categoryEmojis: Record<string, string> = {
  Work: "💼",
  Personal: "🌷",
  Shopping: "🛍️",
  Learning: "📚",
}

// Turns "2026-06-24" into "Jun 24" for display
const formatDate = (dateStr: string) => {
  if (!dateStr) return null
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function TaskCard({ _id, title, priority, category, dueDate,isDone, onDelete, onMove }: TaskCardProps) {
  // hovered state — used to show/hide the delete button
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className={`bg-white rounded-2xl p-4 shadow-sm mb-3 relative transition-all duration-200 ${
        hovered ? 'shadow-md -translate-y-1' : ''  // lifts up slightly on hover
      }`}
      onMouseEnter={() => setHovered(true)}   // mouse enters card → show delete button
      onMouseLeave={() => setHovered(false)}  // mouse leaves card → hide delete button
    >
      {/* Strikethrough if task is done */}
      <p className={`font-semibold mb-2 ${isDone ? 'line-through text-gray-300' : 'text-gray-800'}`}>
        {title}
      </p>
      {/* Delete button — only visible on hover, top right corner */}
      {hovered && (
      <button
        onClick={() => onDelete(_id)}
        className="absolute top-3 right-3 w-6 h-6 bg-pink-100 hover:bg-red-100 text-pink-300 hover:text-red-400 rounded-full text-sm flex items-center justify-center transition"
      >
        ×
      </button>
      )}

      {/* Top row — priority badge on left, category on right */}
      <div className="flex justify-between items-center mb-2 pr-6">
        {/* Priority badge */}
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${priorityStyles[priority]}`}>
          {priority.toUpperCase()}
        </span>
        {/* Category with emoji */}
        <span className="text-xs text-gray-400">
          {categoryEmojis[category] || '📌'} {category}
        </span>
      </div>

      {/* Task title */}
      <p className="font-semibold text-gray-800 mb-2">{title}</p>

      {/* Due date — only shows if a date was set */}
      {dueDate && (
        <p className="text-xs text-gray-400 mb-3 flex items-center gap-1">
          📅 {formatDate(dueDate)}
        </p>
      )}

      {/* Divider line */}
      <div className="border-t border-gray-50 pt-2 mt-1" />

      {/* Move buttons — evenly spaced */}
      <div className="flex justify-between items-center">
        {/* Move to To Do */}
        <button
          onClick={() => onMove(_id, "todo")}
          className="text-xs text-gray-300 hover:text-pink-400 transition flex items-center gap-1"
        >
          ← To Do
        </button>

        {/* Move to In Progress */}
        <button
          onClick={() => onMove(_id, "inprogress")}
          className="text-xs text-gray-300 hover:text-purple-500 transition"
        >
          In Progress
        </button>

        {/* Move to Done */}
        <button
          onClick={() => onMove(_id, "done")}
          className="text-xs text-gray-300 hover:text-green-500 transition flex items-center gap-1"
        >
          Done →
        </button>
      </div>
    </div>
  )
}

export default TaskCard