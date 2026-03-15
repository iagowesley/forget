// localStorage persistence helpers

const PREFIX = 'forgefit_'

export function getItem(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(PREFIX + key)
    return item !== null ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

export function setItem(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch { /* ignore */ }
}

export function removeItem(key) {
  localStorage.removeItem(PREFIX + key)
}

// Session key format: YYYY-MM-DD (local time, not UTC)
export function getDateKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Get or create session for today
export function getSession(dateKey) {
  return getItem(`session_${dateKey}`, null)
}

export function saveSession(dateKey, session) {
  setItem(`session_${dateKey}`, session)
  // Also update history index
  const history = getItem('history_index', [])
  if (!history.includes(dateKey)) {
    history.push(dateKey)
    history.sort().reverse()
    // Keep only last 90 days
    setItem('history_index', history.slice(0, 90))
  }
}

export function getHistory(limit = 90) {
  const index = getItem('history_index', [])
  return index.slice(0, limit).map(dateKey => ({
    dateKey,
    session: getSession(dateKey),
  })).filter(e => e.session !== null)
}

export function getSettings() {
  return getItem('settings', {
    restStrength: 90,
    restHypertrophy: 60,
    restResistance: 45,
    creatineNotification: false,
    creatineTime: '08:00',
    gymNotification: false,
    gymTime: '17:00',
  })
}

export function getWeekCelebrated(weekKey) {
  return getItem(`week_celebrated_${weekKey}`, false)
}

export function setWeekCelebrated(weekKey) {
  setItem(`week_celebrated_${weekKey}`, true)
}

export function saveSettings(settings) {
  setItem('settings', settings)
}

// Streak calculation
export function getStreak() {
  return getItem('streak', { current: 0, longest: 0, lastTrainingDate: null })
}

// Diet plan (one per user)
export function getDiet(userId) {
  return getItem(`diet_${userId}`, null)
}

export function saveDiet(userId, diet, goal) {
  setItem(`diet_${userId}`, { diet, goal, generatedAt: new Date().toISOString() })
}

// Body weight history
export function getWeightHistory() {
  return getItem('weight_history', [])
}

export function logBodyWeight(dateKey, weightKg) {
  const history = getWeightHistory()
  const idx = history.findIndex(e => e.date === dateKey)
  if (idx >= 0) {
    history[idx].weight = weightKg
  } else {
    history.push({ date: dateKey, weight: weightKg })
  }
  history.sort((a, b) => a.date.localeCompare(b.date))
  setItem('weight_history', history.slice(-365))
}

export function updateStreak(dateKey) {
  const streak = getStreak()
  const today = dateKey
  const yesterday = new Date(dateKey)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayKey = yesterday.toISOString().split('T')[0]

  if (streak.lastTrainingDate === yesterday.toISOString().split('T')[0]) {
    streak.current += 1
  } else if (streak.lastTrainingDate === today) {
    // already counted today
    return streak
  } else {
    streak.current = 1
  }

  streak.longest = Math.max(streak.longest, streak.current)
  streak.lastTrainingDate = today
  setItem('streak', streak)
  return streak
}
