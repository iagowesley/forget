import { create } from 'zustand'
import { getSession, saveSession, getDateKey, getSettings, saveSettings, updateStreak } from '../lib/storage'

const useWorkoutStore = create((set, get) => ({
  // Active session
  currentSession: null,
  settings: getSettings(),

  // Initialize or load session for a given day
  initSession: (dayKey, dateKey, dayPlan) => {
    if (!dayPlan || dayPlan.type === 'Rest') return

    let session = getSession(dateKey)
    if (!session) {
      session = {
        dateKey,
        dayKey,
        type: dayPlan.type,
        startedAt: null,
        finishedAt: null,
        completed: false,
        exercises: dayPlan.exercises.map(ex => ({
          id: ex.id,
          name: ex.name,
          completed: false,
          sets: Array.from({ length: ex.sets }, (_, i) => ({
            setNumber: i + 1,
            plannedRepsMin: ex.repsMin,
            plannedRepsMax: ex.repsMax,
            actualReps: null,
            weightKg: null,
            completed: false,
            completedAt: null,
          })),
        })),
      }
    }
    set({ currentSession: session })
  },

  startSession: (dateKey) => {
    const { currentSession } = get()
    if (!currentSession || currentSession.startedAt) return
    const updated = { ...currentSession, startedAt: new Date().toISOString() }
    saveSession(dateKey, updated)
    set({ currentSession: updated })
  },

  completeSet: (dateKey, exerciseId, setNumber, data = {}) => {
    const { currentSession } = get()
    if (!currentSession) return

    const updated = {
      ...currentSession,
      exercises: currentSession.exercises.map(ex => {
        if (ex.id !== exerciseId) return ex
        const sets = ex.sets.map(s => {
          if (s.setNumber !== setNumber) return s
          return {
            ...s,
            ...data,
            completed: true,
            completedAt: new Date().toISOString(),
          }
        })
        const completed = sets.every(s => s.completed)
        return { ...ex, sets, completed }
      }),
    }

    // Check if all exercises done
    const allDone = updated.exercises.every(ex => ex.completed)
    if (allDone && !updated.finishedAt) {
      updated.finishedAt = new Date().toISOString()
      updated.completed = true
      updateStreak(dateKey)
    }

    saveSession(dateKey, updated)
    set({ currentSession: updated })
  },

  uncompleteSet: (dateKey, exerciseId, setNumber) => {
    const { currentSession } = get()
    if (!currentSession) return

    const updated = {
      ...currentSession,
      completed: false,
      finishedAt: null,
      exercises: currentSession.exercises.map(ex => {
        if (ex.id !== exerciseId) return ex
        const sets = ex.sets.map(s => {
          if (s.setNumber !== setNumber) return s
          return { ...s, completed: false, completedAt: null }
        })
        return { ...ex, sets, completed: false }
      }),
    }

    saveSession(dateKey, updated)
    set({ currentSession: updated })
  },

  updateSetData: (dateKey, exerciseId, setNumber, data) => {
    const { currentSession } = get()
    if (!currentSession) return

    const updated = {
      ...currentSession,
      exercises: currentSession.exercises.map(ex => {
        if (ex.id !== exerciseId) return ex
        const sets = ex.sets.map(s => {
          if (s.setNumber !== setNumber) return s
          return { ...s, ...data }
        })
        return { ...ex, sets }
      }),
    }
    saveSession(dateKey, updated)
    set({ currentSession: updated })
  },

  updateSettings: (newSettings) => {
    const merged = { ...get().settings, ...newSettings }
    saveSettings(merged)
    set({ settings: merged })
  },

  getExerciseSession: (exerciseId) => {
    const { currentSession } = get()
    if (!currentSession) return null
    return currentSession.exercises.find(ex => ex.id === exerciseId) || null
  },

  getCompletedSetsCount: () => {
    const { currentSession } = get()
    if (!currentSession) return { done: 0, total: 0 }
    let done = 0, total = 0
    currentSession.exercises.forEach(ex => {
      ex.sets.forEach(s => {
        total++
        if (s.completed) done++
      })
    })
    return { done, total }
  },
}))

export default useWorkoutStore
