// ─── App.tsx ──────────────────────────────────────────────────────────────────
// Root component of MochiTask — Kanban task manager.
//
// Responsibilities:
//   • Overall page layout (navbar, board, actions)
//   • Modal visibility states (AddTaskModal, EditTaskModal)
//   • Keyboard shortcuts ('N' for new task, 'Escape' to dismiss)
//   • Search empty-state banner
//   • Error toast and full-screen error fallbacks
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'
import Column from './components/Column'
import AddTaskModal from './components/AddTaskModal'
import EditTaskModal from './components/EditTaskModal'
import { useTasks } from './hooks/useTasks'
import type { Task } from './types'

function App() {
  const {
    tasks,
    filteredTasks,
    loading,
    loadError,
    actionError,
    clearActionError,
    search,
    setSearch,
    handleAdd,
    handleEdit,
    handleDelete,
    handleMove,
    progress,
    done,
    total,
  } = useTasks()

  // Modal display states
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingTask, setEditingTask]   = useState<Task | null>(null)

  // ─── Global Keyboard Shortcuts ──────────────────────────────────────────────
  // 'n' or 'N' opens the new task modal (when not actively typing in an input)
  // 'Escape' closes any open modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase()
      const isTyping = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select'

      if (e.key === 'Escape') {
        setShowAddModal(false)
        setEditingTask(null)
      } else if ((e.key === 'n' || e.key === 'N') && !isTyping && !showAddModal && !editingTask) {
        e.preventDefault()
        setShowAddModal(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showAddModal, editingTask])

  // Dynamic greeting based on user's current hour
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  // ─── Loading Screen ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-pink-50/60 flex items-center justify-center">
        <div className="text-center animate-pulse">
          <p className="text-4xl mb-3">🌸</p>
          <p className="text-pink-400 text-lg font-semibold">Loading MochiTask...</p>
        </div>
      </div>
    )
  }

  // ─── Fatal Error Screen ─────────────────────────────────────────────────────
  if (loadError) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <div className="text-center px-4 max-w-md">
          <p className="text-4xl mb-2">😢</p>
          <p className="text-rose-500 text-xl font-bold mb-2">Unable to connect to MochiTask</p>
          <p className="text-gray-500 text-sm mb-6">{loadError}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-pink-400 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-pink-500 transition shadow-sm"
          >
            Retry Connection
          </button>
        </div>
      </div>
    )
  }

  // Tasks in current columns
  const todoTasks       = filteredTasks.filter(t => t.status === 'todo')
  const inprogressTasks = filteredTasks.filter(t => t.status === 'inprogress')
  const doneTasks       = filteredTasks.filter(t => t.status === 'done')

  return (
    <div className="min-h-screen bg-[#FFF5F7]">

      {/* ===== NAVBAR ===== */}
      <nav className="bg-white/95 backdrop-blur-sm border-b border-pink-100 px-8 py-3.5 flex items-center gap-4 sticky top-0 z-40 shadow-xs">

        {/* Logo */}
        <div className="flex items-center gap-2.5 mr-6 select-none">
          <span className="text-2xl">🌸</span>
          <span className="text-xl font-extrabold tracking-tight text-pink-400">MochiTask</span>
        </div>

        {/* Real-time search bar */}
        <div className="flex-1 flex justify-center">
          <div className="relative w-full max-w-md">
            <input
              className="w-full bg-pink-50/80 border border-pink-100 rounded-full pl-10 pr-9 py-2 text-sm focus:outline-none focus:border-pink-300 focus:bg-white placeholder-pink-300 transition"
              placeholder="Search your tasks... (Press 'N' to create)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="absolute left-3.5 top-2.5 text-pink-300 text-xs">🔍</span>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-2 text-gray-400 hover:text-gray-600 text-sm font-bold w-5 h-5 flex items-center justify-center rounded-full hover:bg-pink-100"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Daily progress indicators */}
        <div className="flex items-center gap-3.5 ml-auto">
          <div className="text-right">
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Progress</p>
            <p className="text-xs font-bold text-gray-700">{done}/{total}</p>
          </div>

          <div className="w-24 bg-pink-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-pink-400 to-purple-400 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="w-9 h-9 bg-purple-100 border border-purple-200 rounded-full flex items-center justify-center text-base shadow-xs">
            🌸
          </div>
        </div>
      </nav>

      {/* ===== MAIN CONTENT ===== */}
      <main className="max-w-6xl mx-auto p-8">

        {/* Header Greeting */}
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
              {greeting}, friend 🌷
            </h1>
            <p className="text-gray-500 mt-1 text-sm font-medium">
              {tasks.filter(t => t.status !== 'done').length} tasks waiting, {done} all wrapped up. You've got this!
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="hidden sm:inline-flex items-center gap-2 bg-pink-400 hover:bg-pink-500 text-white font-semibold text-sm px-4 py-2.5 rounded-2xl shadow-sm hover:shadow transition"
          >
            <span>+ New Task</span>
            <kbd className="bg-pink-500/60 text-[10px] px-1.5 py-0.5 rounded text-pink-100">N</kbd>
          </button>
        </div>

        {/* Search Results Filter Banner */}
        {search.trim() !== '' && (
          <div className="mb-6 bg-pink-50/80 border border-pink-200 rounded-2xl px-4 py-3 flex items-center justify-between text-sm text-pink-800">
            <span>
              Showing results matching <span className="font-semibold">"{search}"</span> ({filteredTasks.length} found)
            </span>
            <button
              onClick={() => setSearch('')}
              className="text-pink-600 hover:text-pink-800 font-semibold underline text-xs ml-4"
            >
              Clear filter
            </button>
          </div>
        )}

        {/* ===== KANBAN BOARD COLUMNS ===== */}
        <div className="flex gap-6 justify-center items-start overflow-x-auto pb-4">
          <Column
            title="To Do"
            tasks={todoTasks}
            onEdit={setEditingTask}
            onDelete={handleDelete}
            onMove={handleMove}
            color="pink"
          />

          <Column
            title="In Progress"
            tasks={inprogressTasks}
            onEdit={setEditingTask}
            onDelete={handleDelete}
            onMove={handleMove}
            color="purple"
          />

          <Column
            title="Done"
            tasks={doneTasks}
            onEdit={setEditingTask}
            onDelete={handleDelete}
            onMove={handleMove}
            color="green"
          />
        </div>
      </main>

      {/* ===== FLOATING ACTION BUTTON ===== */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-pink-400 hover:bg-pink-500 text-white text-3xl rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:scale-105 active:scale-95"
        aria-label="Add new task (or press N)"
        title="Add new task (N)"
      >
        +
      </button>

      {/* ===== ADD TASK MODAL ===== */}
      {showAddModal && (
        <AddTaskModal
          onAdd={handleAdd}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* ===== EDIT TASK MODAL ===== */}
      {editingTask && (
        <EditTaskModal
          task={editingTask}
          onEdit={handleEdit}
          onClose={() => setEditingTask(null)}
        />
      )}

      {/* ===== ACTION ERROR NOTIFICATION TOAST ===== */}
      {actionError && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-rose-50 border border-rose-300 text-rose-700 px-6 py-3 rounded-full text-sm font-medium shadow-xl z-50">
          <span>⚠️ {actionError}</span>
          <button
            onClick={clearActionError}
            className="text-rose-400 hover:text-rose-700 font-bold ml-2 text-base"
            aria-label="Dismiss error notification"
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}

export default App