import { useState, useEffect } from 'react'
import Column from './components/Column'
import { getTasks, addTask, deleteTask, moveTask } from './api'

// This is our Task type — tells TypeScript what a task looks like
type Task = {
  _id: string                                    // MongoDB unique ID
  title: string                                  // task name
  priority: "high" | "medium" | "low"           // only these 3 values allowed
  category: string                               // Work, Personal, etc
  status: "todo" | "inprogress" | "done"        // which column it belongs to
  dueDate: string                                // optional due date
}

function App() {
  // useState — React watches these variables and updates the screen when they change
  const [tasks, setTasks] = useState<Task[]>([])         // all tasks from database
  const [loading, setLoading] = useState(true)            // show loading screen while fetching
  const [showModal, setShowModal] = useState(false)       // show/hide add task modal
  const [search, setSearch] = useState('')                // search bar text

  // Form fields for the new task modal
  const [newTitle, setNewTitle] = useState('')
  const [newPriority, setNewPriority] = useState<"high" | "medium" | "low">('medium')
  const [newCategory, setNewCategory] = useState('Personal')
  const [newDueDate, setNewDueDate] = useState('')

  // useEffect — runs once when the app first loads
  // We use it to fetch tasks from the backend automatically
  useEffect(() => {
    loadTasks()
  }, []) // empty [] means "run only once on startup"

  // Fetch all tasks from our Express backend
  const loadTasks = async () => {
    const data = await getTasks()
    setTasks(data)
    setLoading(false)
  }

  // Delete a task — calls backend then removes from screen
  const handleDelete = async (_id: string) => {
    await deleteTask(_id)
    setTasks(tasks.filter(t => t._id !== _id)) // keep everything except this task
  }

  // Add a new task — calls backend then adds to screen
  const handleAdd = async () => {
    if (!newTitle.trim()) return // don't add empty tasks
    const task = await addTask(newTitle, newPriority, newCategory, newDueDate)
    setTasks([...tasks, task]) // ...tasks keeps existing tasks, then adds the new one
    // Reset all form fields
    setNewTitle('')
    setNewPriority('medium')
    setNewCategory('Personal')
    setNewDueDate('')
    setShowModal(false) // close the modal
  }

  // Move a task to a different column
  const handleMove = async (_id: string, newStatus: Task["status"]) => {
    await moveTask(_id, newStatus) // tell backend to update status
    setTasks(tasks.map(t =>
      t._id === _id ? { ...t, status: newStatus } : t
      // if this is the task we want → update its status
      // if not → leave it exactly as it is
    ))
  }

  // Filter tasks by search text — shows only matching tasks
  const filteredTasks = tasks.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase())
  )

  // Calculate daily progress percentage
  const done = tasks.filter(t => t.status === 'done').length
  const total = tasks.length
  const progress = total > 0 ? Math.round((done / total) * 100) : 0

  // Dynamic greeting based on time of day
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  // Show loading screen while fetching from backend
  if (loading) return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center">
      <p className="text-pink-400 text-xl font-semibold">Loading MochiTask... 🌸</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FFF5F7]">

      {/* ===== NAVBAR ===== */}
      <nav className="bg-white border-b border-pink-100 px-8 py-4 flex items-center gap-4 sticky top-0 z-40">

        {/* Logo */}
        <div className="flex items-center gap-2 mr-8">
          <span className="text-2xl">🌸</span>
          <span className="text-xl font-bold text-pink-400">MochiTask</span>
        </div>

        {/* Search bar — centered in navbar */}
        <div className="flex-1 flex justify-center">
          <input
            className="w-full max-w-md bg-pink-50 border border-pink-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-pink-300 placeholder-pink-300"
            placeholder="Search your tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Progress bar — right side of navbar */}
        <div className="flex items-center gap-3 ml-auto">
          <div className="text-right">
            <p className="text-xs text-gray-400">Daily progress</p>
            <p className="text-xs font-bold text-gray-600">{done}/{total}</p>
          </div>
          {/* Progress bar track */}
          <div className="w-24 bg-pink-100 rounded-full h-2">
            {/* Progress fill — width is dynamic based on % done */}
            <div
              className="bg-gradient-to-r from-pink-400 to-purple-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Avatar */}
          <div className="w-9 h-9 bg-purple-200 rounded-full flex items-center justify-center text-lg">🌸</div>
        </div>
      </nav>

      {/* ===== MAIN CONTENT ===== */}
      {/* max-w-6xl + mx-auto centers everything on the page */}
      <div className="max-w-6xl mx-auto p-8">

        {/* Greeting section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">{greeting}, friend 🌷</h1>
          <p className="text-gray-400 mt-1">
            {tasks.filter(t => t.status !== 'done').length} tasks waiting, {done} all wrapped up. You've got this!
          </p>
        </div>

        {/* ===== KANBAN BOARD ===== */}
        {/* justify-center centers the 3 columns */}
        <div className="flex gap-6 justify-center">
          <Column
            title="To Do"
            tasks={filteredTasks.filter(t => t.status === "todo")}
            onDelete={handleDelete}
            onMove={handleMove}
            color="pink"
          />
          <Column
            title="In Progress"
            tasks={filteredTasks.filter(t => t.status === "inprogress")}
            onDelete={handleDelete}
            onMove={handleMove}
            color="purple"
          />
          <Column
            title="Done"
            tasks={filteredTasks.filter(t => t.status === "done")}
            onDelete={handleDelete}
            onMove={handleMove}
            color="green"
          />
        </div>
      </div>

      {/* ===== FLOATING + BUTTON ===== */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-pink-400 hover:bg-pink-500 text-white text-3xl rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
      >
        +
      </button>

      {/* ===== ADD TASK MODAL ===== */}
      {/* Only renders when showModal is true */}
      {showModal && (
        // Overlay — dark background behind modal
        // items-center + justify-center = perfectly centered on screen
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={(e) => {
            // Close modal if user clicks the dark overlay (not the modal itself)
            if (e.target === e.currentTarget) setShowModal(false)
          }}
        >
          {/* Modal box — centered */}
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl mx-4">

            {/* Modal header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">New mochi task 🍡</h2>
              {/* Close button */}
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 bg-pink-50 hover:bg-pink-100 rounded-full flex items-center justify-center text-gray-400 transition"
              >
                ×
              </button>
            </div>

            {/* Title input */}
            <div className="mb-4">
              <label className="text-sm text-gray-500 mb-1 block">Title</label>
              <input
                className="w-full bg-pink-50 border border-pink-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-pink-400 placeholder-pink-300"
                placeholder="What needs doing?"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAdd() }}
                autoFocus
              />
            </div>

            {/* Priority and Category dropdowns side by side */}
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <label className="text-sm text-gray-500 mb-1 block">Priority</label>
                <select
                  className="w-full bg-pink-50 border border-pink-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-pink-400 text-gray-700"
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as "high" | "medium" | "low")}
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
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                >
                  <option>Personal</option>
                  <option>Work</option>
                  <option>Shopping</option>
                  <option>Learning</option>
                </select>
              </div>
            </div>

            {/* Due date picker */}
            <div className="mb-6">
              <label className="text-sm text-gray-500 mb-1 block">Due date</label>
              <input
                type="date"
                className="w-full bg-pink-50 border border-pink-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-pink-400 text-gray-700"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
              />
            </div>

            {/* Submit button */}
            <button
              onClick={handleAdd}
              className="w-full bg-pink-400 hover:bg-pink-500 text-white font-semibold py-4 rounded-2xl transition-all duration-200"
            >
              Add task 🌸
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App