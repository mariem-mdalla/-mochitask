import TaskCard from "./TaskCard"

type Task = {
  _id: string
  title: string
  priority: "high" | "medium" | "low"
  category: string
  status: "todo" | "inprogress" | "done"
  dueDate: string
}

type ColumnProps = {
  title: string
  tasks: Task[]
  onDelete: (_id: string) => void
  onMove: (_id: string, newStatus: "todo" | "inprogress" | "done") => void
  color: "pink" | "purple" | "green"
}

// Column background and dot colors based on the color prop
const columnStyles = {
  pink: {
    bg: "bg-[#FFE8EE]",       // warmer pink like the photo
    dot: "bg-pink-400",
    badge: "bg-pink-400 text-white"
  },
  purple: {
    bg: "bg-[#EDE8FF]",       // soft lavender like the photo
    dot: "bg-purple-400",
    badge: "bg-purple-400 text-white"
  },
  green: {
    bg: "bg-[#E8FFF3]",       // mint green like the photo
    dot: "bg-green-400",
    badge: "bg-green-400 text-white"
  },
}

function Column({ title, tasks, onDelete, onMove, color }: ColumnProps) {
  const styles = columnStyles[color]

  return (
    <div className={`${styles.bg} rounded-3xl p-5 w-80 min-h-96`}>

      {/* Column header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${styles.dot}`} />
          <h2 className="font-bold text-gray-700">{title}</h2>
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${styles.badge}`}>
          {tasks.length}
        </span>
      </div>

      {/* Empty state */}
      {tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-gray-300">
          <p className="text-4xl mb-2">🌸</p>
          <p className="text-sm">No tasks here</p>
        </div>
      )}

      {/* Task cards */}
      {tasks.map(task => (
        <TaskCard
          key={task._id}
          _id={task._id}
          title={task.title}
          priority={task.priority}
          category={task.category}
          dueDate={task.dueDate}
          isDone={task.status === 'done'}  // ← add this line
          onDelete={onDelete}
          onMove={onMove}
        />
      ))}
    </div>
  )
}

export default Column