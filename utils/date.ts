export function getWeekDays(currentDate: Date = new Date()) {
    const week = []
    // Start from Sunday (or Monday, depending on preference)
    // Let's center the week around the current date for better UX
    const start = new Date(currentDate)
    start.setDate(currentDate.getDate() - 3) // Start 3 days ago
  
    for (let i = 0; i < 7; i++) {
      const day = new Date(start)
      day.setDate(start.getDate() + i)
      week.push(day)
    }
    return week
  }
  
  export function formatDate(date: Date) {
    return date.toISOString().split('T')[0] // Returns "YYYY-MM-DD"
  }
  
  export function isSameDay(d1: Date, d2: Date) {
    return formatDate(d1) === formatDate(d2)
  }