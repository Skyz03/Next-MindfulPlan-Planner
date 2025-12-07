import { createClient } from '@/utils/supabase/server'
import { addTask, toggleTask } from './actions'

// FETCH DATA FOR TEST USER
async function getTasks() {
  const supabase = createClient()
  const { data } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', 'test-user-1') // <--- Hardcoded!
    .order('created_at', { ascending: false })

  return data || []
}

export default async function Dashboard() {
  const tasks = await getTasks()

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-6">Daily Planner (Dev Mode)</h1>

      {/* ADD TASK FORM */}
      <form action={addTask} className="flex gap-2 mb-8">
        <input
          name="title"
          type="text"
          placeholder="Add a new task..."
          className="border p-2 rounded w-full"
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
      </form>

      {/* TASK LIST */}
      <ul className="space-y-3">
        {tasks.map((task) => (
          <li key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className={task.is_completed ? "line-through text-gray-400" : ""}>
              {task.title}
            </span>

            {/* We need a tiny form to make the button work with Server Actions */}
            <form action={toggleTask.bind(null, task.id, task.is_completed)}>
              <button className="text-sm text-blue-500 hover:underline">
                {task.is_completed ? "Undo" : "Done"}
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  )
}