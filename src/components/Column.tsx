import TaskCard from "./TaskCard"
type Task = {
    id: number
    title: string
    priority: "high" | "medium" | "low"
    category: string
    status: "todo" | "inprogress" | "done"
}
type ColumnProps = {
    title : string
    tasks: Task[]
    onDelete:(id:number)=> void
    onMove: (id: number, newStatus: "todo" | "inprogress" | "done") => void
}
function Column({title,tasks,onDelete,onMove}: ColumnProps){
    return (
        <div className="bg-pink-50 rounded-2xl p-4 w-72 min-h-96">
            <h2 className="font-bold text-gray-700 mb-4">{title}</h2>
            {tasks.map(task => (
                <TaskCard
                key={task.id}
                id={task.id}
                title={task.title}
                priority={task.priority}
                category={task.category}
                onDelete={onDelete}
                onMove={onMove}
                />
            ))}
        </div>
    )
}
export default Column