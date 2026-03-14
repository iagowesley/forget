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

// Session key format: YYYY-MM-DD
export function getDateKey(date = new Date()) {
  return date.toISOString().split('T')[0]
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

export function getHistory(limit = 30) {
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
    notificationsEnabled: false,
    notificationTime: '07:00',
  })
}

export function saveSettings(settings) {
  setItem('settings', settings)
}

// Streak calculation
export function getStreak() {
  return getItem('streak', { current: 0, longest: 0, lastTrainingDate: null })
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
