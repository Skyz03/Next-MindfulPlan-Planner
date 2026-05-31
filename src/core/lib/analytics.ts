import { createClient } from '@/core/lib/supabase/server'
import { getWeekDays, formatDate } from '@/core/lib/date'

export type ProductivityReport = {
  rangeType: 'week' | 'month'
  score: number
  total: number
  completed: number
  activityByDay: Array<{ day: string; dateNum: number; fullDate: string; total: number }>
  goalBreakdown: Array<{ name: string; total: number; completed: number }>
  biggestWin: Record<string, unknown> | null
  focusHours: number
  peakTime: 'Morning' | 'Afternoon' | 'Evening'
  planningAccuracy: 'Calibrated' | 'Underestimator' | 'Overestimator'
}

function toLocalYMD(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getMonthRange(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1, 12, 0, 0)
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 12, 0, 0)
  return { start, end }
}

export async function getProductivityReport(rangeType: 'week' | 'month' = 'week'): Promise<ProductivityReport | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const today = new Date()
  let startDateStr: string, endDateStr: string, dateLabels: Date[]

  if (rangeType === 'month') {
    const { start, end } = getMonthRange(today)
    startDateStr = toLocalYMD(start)
    endDateStr = toLocalYMD(end)
    dateLabels = []
    const current = new Date(start)
    current.setDate(1)
    while (current.getMonth() === start.getMonth()) {
      dateLabels.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
  } else {
    const weekDays = getWeekDays(today)
    startDateStr = formatDate(weekDays[0])
    endDateStr = formatDate(weekDays[6])
    dateLabels = weekDays
  }

  const { data: tasks } = await supabase
    .from('tasks')
    .select(`*, goals (id, title)`)
    .eq('user_id', user.id)
    .gte('due_date', startDateStr)
    .lte('due_date', endDateStr)

  if (!tasks) return null

  const total = tasks.length
  const completedTasks = tasks.filter((t) => t.is_completed)
  const completedCount = completedTasks.length

  const completionRate = total > 0 ? (completedCount / total) * 100 : 0
  const highPriorityBonus = completedTasks.filter((t) => t.priority === 'high').length * 2
  const score = Math.min(Math.round(completionRate + highPriorityBonus), 100)

  const totalMinutes = completedTasks.reduce((acc, t) => {
    return acc + (t.actual_duration > 0 ? t.actual_duration : t.duration || 60)
  }, 0)
  const focusHours = Math.round((totalMinutes / 60) * 10) / 10

  const activityByDay = dateLabels.map((day) => {
    const dateStr = toLocalYMD(day)
    const count = completedTasks.filter((t) => t.due_date === dateStr).length
    return {
      day: day.toLocaleDateString('en-US', { weekday: 'short' }),
      dateNum: day.getDate(),
      fullDate: dateStr,
      total: count,
    }
  })

  const goalMap = new Map<string, { name: string; total: number; completed: number }>()
  tasks.forEach((t) => {
    const goalTitle = t.goals?.title || 'Unlinked'
    if (!goalMap.has(goalTitle)) goalMap.set(goalTitle, { name: goalTitle, total: 0, completed: 0 })
    const entry = goalMap.get(goalTitle)!
    entry.total += 1
    if (t.is_completed) entry.completed += 1
  })
  const goalBreakdown = Array.from(goalMap.values()).sort((a, b) => b.completed - a.completed)

  let morning = 0, afternoon = 0, evening = 0
  completedTasks.forEach((t) => {
    if (t.start_time) {
      const hour = parseInt(t.start_time.split(':')[0])
      if (hour >= 5 && hour < 12) morning++
      else if (hour >= 12 && hour < 17) afternoon++
      else evening++
    }
  })
  const peakTime: 'Morning' | 'Afternoon' | 'Evening' =
    morning > afternoon && morning > evening ? 'Morning'
    : afternoon > morning && afternoon > evening ? 'Afternoon'
    : 'Evening'

  const biggestWin = completedTasks.sort((a, b) => {
    const p = (s: string) => (s === 'high' ? 3 : s === 'medium' ? 2 : 1)
    return (p(b.priority) + (b.goal_id ? 1 : 0)) - (p(a.priority) + (a.goal_id ? 1 : 0))
  })[0] ?? null

  return {
    rangeType,
    score,
    total,
    completed: completedCount,
    activityByDay,
    goalBreakdown,
    biggestWin,
    focusHours,
    peakTime,
    planningAccuracy: calculateAccuracy(completedTasks),
  }
}

type TrackedTask = { actual_duration: number; duration: number }
function calculateAccuracy(tasks: TrackedTask[]): 'Calibrated' | 'Underestimator' | 'Overestimator' {
  const tracked = tasks.filter((t) => t.actual_duration > 0 && t.duration > 0)
  if (tracked.length === 0) return 'Calibrated'
  const avgRatio = tracked.reduce((acc, t) => acc + t.actual_duration / t.duration, 0) / tracked.length
  if (avgRatio > 1.1) return 'Underestimator'
  if (avgRatio < 0.9) return 'Overestimator'
  return 'Calibrated'
}
