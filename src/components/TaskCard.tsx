type TaskCardProps = {
    id: number
    title : string
    priority : "high" | "medium" | "low"
    category: string
    onDelete: (id:number) => void
    onMove: (id: number, newStatus: "todo" | "inprogress" | "done") => void
}
const priorityStyles ={
    high: "bg-red-100 text-red-500",
    medium: "bg-yellow-100 text-yellow-600",
    low: "bg-green-100 text-green-600",
}
function TaskCard({id,title,priority,category,onDelete,onMove}:TaskCardProps){
    return(
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-3">
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${priorityStyles[priority]}`}>{priority.toUpperCase()}</span>
             <span>
                <button onClick={() => onDelete(id)} className="text-gray-300 hover:text-red-400 text-lg">×</button>
            </span>
            <span className="font-semibold mt-2 text-gray-800">{title}</span>
            <span className="text-xs text-gray-400 mt-1">{category}</span>
            <div className="flex gap-2 mt-2">
                <button onClick={() => onMove(id, "todo")} className="text-xs bg-pink-100 text-pink-500 px-2 py-1 rounded-lg">To Do</button>
                <button onClick={() => onMove(id, "inprogress")} className="text-xs bg-purple-100 text-purple-500 px-2 py-1 rounded-lg">In Progress</button>
                <button onClick={() => onMove(id, "done")} className="text-xs bg-green-100 text-green-500 px-2 py-1 rounded-lg">Done</button>
            </div>
        </div>
    )
}
export default TaskCard