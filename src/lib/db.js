import { supabase } from './supabase'

// ─── Workout Sessions ────────────────────────────────────────────────────────

/**
 * Upsert a workout session. Returns the Supabase session UUID or null.
 */
export async function upsertWorkoutSession(userId, session) {
  const { data, error } = await supabase
    .from('workout_sessions')
    .upsert(
      {
        user_id: userId,
        date: session.dateKey,
        day_name: session.dayKey,
        workout_type: session.type,
        completed: session.completed ?? false,
        started_at: session.startedAt || null,
        finished_at: session.finishedAt || null,
      },
      { onConflict: 'user_id,date' }
    )
    .select('id')
    .single()

  if (error) {
    console.error('[db] upsertWorkoutSession:', error.message)
    return null
  }
  return data.id
}

/**
 * Upsert all sets from all exercises in a session.
 */
export async function upsertSessionSets(sessionId, exercises) {
  if (!sessionId || !exercises?.length) return

  const rows = []
  for (const ex of exercises) {
    for (const s of ex.sets) {
      rows.push({
        session_id: sessionId,
        exercise_id: ex.id,
        exercise_name: ex.name,
        set_number: s.setNumber,
        planned_reps_min: s.plannedRepsMin ?? null,
        planned_reps_max: s.plannedRepsMax ?? null,
        actual_reps: s.actualReps ?? null,
        weight_kg: s.weightKg ?? null,
        completed: s.completed ?? false,
        completed_at: s.completedAt || null,
      })
    }
  }

  const { error } = await supabase
    .from('exercise_sets')
    .upsert(rows, { onConflict: 'session_id,exercise_id,set_number' })

  if (error) console.error('[db] upsertSessionSets:', error.message)
}

/**
 * Sync a full session (metadata + all sets) to Supabase.
 */
export async function syncSession(userId, session) {
  const sessionId = await upsertWorkoutSession(userId, session)
  if (sessionId) {
    await upsertSessionSets(sessionId, session.exercises)
  }
  return sessionId
}

// ─── Load from Supabase ──────────────────────────────────────────────────────

function buildExercisesFromSets(sets) {
  const map = new Map()
  for (const s of sets) {
    if (!map.has(s.exercise_id)) {
      map.set(s.exercise_id, {
        id: s.exercise_id,
        name: s.exercise_name,
        completed: false,
        sets: [],
      })
    }
    map.get(s.exercise_id).sets.push({
      setNumber: s.set_number,
      plannedRepsMin: s.planned_reps_min,
      plannedRepsMax: s.planned_reps_max,
      actualReps: s.actual_reps,
      weightKg: s.weight_kg,
      completed: s.completed,
      completedAt: s.completed_at,
    })
  }
  const exercises = Array.from(map.values())
  for (const ex of exercises) {
    ex.sets.sort((a, b) => a.setNumber - b.setNumber)
    ex.completed = ex.sets.length > 0 && ex.sets.every(s => s.completed)
  }
  return exercises
}

/**
 * Load all sessions (with sets) from Supabase for the last `days` days.
 */
export async function loadAllSessions(userId, days = 90) {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  const cutoffStr = cutoff.toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*, exercise_sets(*)')
    .eq('user_id', userId)
    .gte('date', cutoffStr)
    .order('date', { ascending: false })

  if (error) {
    console.error('[db] loadAllSessions:', error.message)
    return []
  }

  return (data || []).map(row => ({
    supabaseId: row.id,
    dateKey: row.date,
    dayKey: row.day_name,
    type: row.workout_type,
    completed: row.completed,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    exercises: buildExercisesFromSets(row.exercise_sets || []),
  }))
}

// ─── Streak ──────────────────────────────────────────────────────────────────

export async function syncStreak(userId, streak) {
  const { error } = await supabase
    .from('streaks')
    .upsert(
      {
        user_id: userId,
        current_streak: streak.current,
        longest_streak: streak.longest,
        last_training_date: streak.lastTrainingDate,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )
  if (error) console.error('[db] syncStreak:', error.message)
}

export async function loadStreak(userId) {
  const { data, error } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) return null
  return {
    current: data.current_streak,
    longest: data.longest_streak,
    lastTrainingDate: data.last_training_date,
  }
}

// ─── Weight History ──────────────────────────────────────────────────────────

export async function syncWeightHistory(userId, history) {
  const { error } = await supabase
    .from('profiles')
    .update({ weight_history: history })
    .eq('id', userId)
  if (error) console.error('[db] syncWeightHistory:', error.message)
}

export async function loadWeightHistory(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('weight_history')
    .eq('id', userId)
    .single()
  if (error || !data) return []
  return data.weight_history || []
}
