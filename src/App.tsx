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
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-pink-500 text-sm font-semibold tracking-wide">Loading MochiTask...</p>
        </div>
      </div>
    )
  }

  // ─── Fatal Error Screen ─────────────────────────────────────────────────────
  if (loadError) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <div className="text-center px-4 max-w-md">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-500 mx-auto flex items-center justify-center mb-3">
            <svg className="w-6 h-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-rose-600 text-lg font-bold mb-1">Unable to connect to MochiTask</h2>
          <p className="text-gray-500 text-xs mb-6 leading-relaxed">{loadError}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-pink-500 text-white px-6 py-2.5 rounded-full text-xs font-semibold hover:bg-pink-600 transition shadow-xs"
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
          <div className="w-8 h-8 rounded-xl bg-pink-400 text-white flex items-center justify-center shadow-xs">
            <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <span className="text-lg font-extrabold tracking-tight text-pink-500">MochiTask</span>
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
            <svg className="w-4 h-4 absolute left-3.5 top-2.5 text-pink-300 stroke-current pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
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
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Progress</p>
            <p className="text-xs font-bold text-gray-700">{done}/{total}</p>
          </div>

          <div className="w-24 bg-pink-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-pink-400 to-purple-400 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="w-8 h-8 bg-purple-100 border border-purple-200 text-purple-700 font-bold rounded-full flex items-center justify-center text-xs shadow-xs tracking-wider">
            MT
          </div>
        </div>
      </nav>

      {/* ===== MAIN CONTENT ===== */}
      <main className="max-w-6xl mx-auto p-8">

        {/* Header Greeting */}
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">
              {greeting}
            </h1>
            <p className="text-gray-500 mt-1 text-sm font-medium">
              {tasks.filter(t => t.status !== 'done').length} tasks waiting, {done} completed.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="hidden sm:inline-flex items-center gap-2 bg-pink-400 hover:bg-pink-500 text-white font-semibold text-sm px-4 py-2 rounded-2xl shadow-xs hover:shadow transition"
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
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2.5 bg-rose-50 border border-rose-300 text-rose-700 px-5 py-2.5 rounded-full text-xs font-medium shadow-lg z-50">
          <svg className="w-4 h-4 text-rose-500 stroke-current shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{actionError}</span>
          <button
            onClick={clearActionError}
            className="text-rose-400 hover:text-rose-700 font-bold ml-2 text-sm leading-none"
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