// ─── Column.tsx ───────────────────────────────────────────────────────────────
// Represents one column of the Kanban board (To Do, In Progress, or Done).
// Receives its tasks pre-filtered by App.tsx — it doesn't filter anything itself.
// ─────────────────────────────────────────────────────────────────────────────

import TaskCard from './TaskCard'
import type { Task, TaskStatus } from '../types'

type ColumnProps = {
  title: string                                           // column heading text e.g. "To Do"
  tasks: Task[]                                          // tasks to display in this column
  onEdit: (task: Task) => void                           // opens edit modal in App
  onDelete: (_id: string) => void                        // bubbles up to App → useTasks
  onMove: (_id: string, newStatus: TaskStatus) => void   // bubbles up to App → useTasks
  color: 'pink' | 'purple' | 'green'                    // controls the column's color theme
}

// ─── Color theme mapping ──────────────────────────────────────────────────────
const columnStyles = {
  pink: {
    bg:    'bg-[#FFE8EE]',              // warm pink background for "To Do"
    dot:   'bg-pink-400',              // colored dot next to the column title
    badge: 'bg-pink-400 text-white',   // pill badge showing task count
  },
  purple: {
    bg:    'bg-[#EDE8FF]',             // soft lavender for "In Progress"
    dot:   'bg-purple-400',
    badge: 'bg-purple-400 text-white',
  },
  green: {
    bg:    'bg-[#E8FFF3]',             // mint green for "Done"
    dot:   'bg-green-400',
    badge: 'bg-green-400 text-white',
  },
}

function Column({ title, tasks, onEdit, onDelete, onMove, color }: ColumnProps) {
  const styles = columnStyles[color]

  return (
    <div className={`${styles.bg} rounded-3xl p-5 w-80 min-h-96 flex flex-col`}>

      {/* ─── Column Header ────────────────────────────────────────────────── */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${styles.dot}`} />
          <h2 className="font-bold text-gray-700">{title}</h2>
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${styles.badge}`}>
          {tasks.length}
        </span>
      </div>

      {/* ─── Empty state ──────────────────────────────────────────────────── */}
      {tasks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12 text-gray-400">
          <svg className="w-9 h-9 mb-2 opacity-30 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-xs font-medium text-gray-400 tracking-wide">No tasks here</p>
        </div>
      ) : null}

      {/* ─── Task cards list ──────────────────────────────────────────────── */}
      <div className="flex-1">
        {tasks.map(task => (
          <TaskCard
            key={task._id}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
            onMove={onMove}
          />
        ))}
      </div>
    </div>
  )
}

export default Column