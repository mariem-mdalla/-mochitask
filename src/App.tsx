import { useState } from "react"
import Column from "./components/Column"
type Task = {
    id: number
    title: string
    priority: "high" | "medium" | "low"
    category: string
    status: "todo" | "inprogress" | "done"
  }
  const initialTasks: Task[] = [
  { id: 1, title: "Finalize Q3 Report", priority: "high", category: "Work", status: "todo" },
  { id: 2, title: "Book dentist", priority: "medium", category: "Personal", status: "todo" },
  { id: 3, title: "Buy stationery", priority: "low", category: "Shopping", status: "inprogress" },
  { id: 4, title: "Read Atomic Habits", priority: "low", category: "Learning", status: "done" },
]
function App(){
  const [tasks,setTasks]=useState<Task[]>(initialTasks)
  const handleDelete = (id:number)=>{
    setTasks(tasks.filter(t=>t.id !==id))
  }
  const handleAdd = (title:string)=>{
    const newTask: Task = {
      id:Date.now(),
      title,
      priority: "medium",
      category: "Personal",
      status: "todo"
    }
    setTasks([...tasks, newTask])//...tasks means "keep all existing tasks"
  }
  const handleMove=(id:number,newStatus:Task["status"]) =>{
    setTasks(tasks.map(task =>
      task.id === id ? { ...task,status:newStatus} : task //copy all task properties but change only the status.
                                                          //The ...task spread means "keep everything else the same."
    )
    )
  }
  return (
    
    <div className="bg-pink-50 min-h-screen p-8">
      <input
        className="border rounded-xl px-4 py-2 mr-2 mb-6"
        placeholder="New task... press Enter"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleAdd(e.currentTarget.value)
            e.currentTarget.value = ''
          }
        }}
      />
      <h1 className="text-4xl font-bold text-pink-400 mb-8">MochiTask 🌸</h1>
      <div className="flex gap-6">
        <Column title="To Do" tasks={tasks.filter(t => t.status === "todo")} onDelete={handleDelete} onMove={handleMove}/>
        <Column title="In Progress" tasks={tasks.filter(t => t.status === "inprogress")} onDelete={handleDelete} onMove={handleMove}/>
        <Column title="Done" tasks={tasks.filter(t => t.status === "done")} onDelete={handleDelete} onMove={handleMove}/>
      </div>
    </div>
  )
}
export default App