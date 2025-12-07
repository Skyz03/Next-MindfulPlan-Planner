import { createClient } from '@/utils/supabase/server'
import { addTask, addGoal, toggleTask } from './actions'

// FETCH DATA
async function getData() {
  const supabase = createClient()

  // Parallel fetching: Get Tasks AND Goals at the same time
  const [tasksResponse, goalsResponse] = await Promise.all([
    supabase.from('tasks').select('*, goals(title)').eq('user_id', 'test-user-1').order('created_at', { ascending: false }),
    supabase.from('goals').select('*').eq('user_id', 'test-user-1').order('created_at', { ascending: false })
  ])

  return {
    tasks: tasksResponse.data || [],
    goals: goalsResponse.data || []
  }
}

export default async function Dashboard() {
  const { tasks, goals } = await getData()

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">

      {/* --- LEFT SIDEBAR: GOALS --- */}
      <aside className="w-80 bg-white border-r p-6 flex flex-col">
        <h2 className="text-xl font-bold mb-4 text-gray-800">My Goals</h2>

        {/* Add Goal Form */}
        <form action={addGoal} className="mb-6 flex gap-2">
          <input
            name="title"
            placeholder="New Goal..."
            className="w-full bg-gray-100 p-2 rounded text-sm outline-none focus:ring-2 ring-blue-100"
          />
        </form>

        {/* Goal List */}
        <div className="space-y-2 overflow-y-auto flex-1">
          {goals.map(goal => (
            <div key={goal.id} className="p-3 rounded-lg border border-gray-100 bg-gray-50 text-sm font-medium">
              🎯 {goal.title}
            </div>
          ))}
        </div>
      </aside>

      {/* --- MAIN CONTENT: TASKS --- */}
      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Today's Plan</h1>
            <p className="text-gray-500">Focus on what moves the needle.</p>
          </header>

          {/* ADD TASK FORM (Now with Goal Dropdown) */}
          <div className="bg-white p-4 rounded-xl shadow-sm border mb-8">
            <form action={addTask} className="flex flex-col gap-3">
              <input
                name="title"
                type="text"
                placeholder="What needs to be done?"
                className="w-full text-lg outline-none placeholder:text-gray-400"
              />

              <div className="flex items-center gap-3 border-t pt-3">
                {/* Goal Selector */}
                <select name="goal_id" className="text-sm bg-gray-50 border rounded px-2 py-1 text-gray-600 outline-none">
                  <option value="none">No Goal linked</option>
                  {goals.map(goal => (
                    <option key={goal.id} value={goal.id}>{goal.title}</option>
                  ))}
                </select>

                <div className="flex-1"></div> {/* Spacer */}

                <button className="bg-black text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-800">
                  Add Task
                </button>
              </div>
            </form>
          </div>

          {/* TASK LIST */}
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="group flex items-start gap-3 p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition-all">
                {/* Checkbox Form */}
                <form action={toggleTask.bind(null, task.id, task.is_completed)}>
                  <button className={`mt-1 w-5 h-5 rounded border flex items-center justify-center ${task.is_completed ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                    {task.is_completed && <span className="text-white text-xs">✓</span>}
                  </button>
                </form>

                <div className="flex-1">
                  <p className={`text-lg leading-tight ${task.is_completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {task.title}
                  </p>

                  {/* Goal Badge (Only show if a goal exists) */}
                  {task.goals && (
                    <span className="inline-block mt-2 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100 font-medium">
                      {task.goals.title}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}