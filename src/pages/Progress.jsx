import { useMemo, useState } from 'react'
import Header from '../components/layout/Header'
import ProgressChart from '../components/progress/ProgressChart'
import { getHistory, getStreak } from '../lib/storage'
import { WORKOUT_PLAN } from '../lib/workoutData'
import { TrendingUp, Flame, Target, Activity } from 'lucide-react'

function buildExerciseProgress(history) {
  const exerciseData = {}

  history.forEach(({ dateKey, session }) => {
    if (!session) return
    ;(session.exercises || []).forEach(ex => {
      if (!exerciseData[ex.id]) {
        exerciseData[ex.id] = { name: ex.name, data: [] }
      }
      // Find max weight used in this session for this exercise
      const maxWeight = ex.sets
        .filter(s => s.completed && s.weightKg != null)
        .reduce((max, s) => Math.max(max, s.weightKg), 0)
      if (maxWeight > 0) {
        const date = new Date(dateKey + 'T00:00:00')
        exerciseData[ex.id].data.push({
          date: date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }),
          weight: maxWeight,
          dateKey,
        })
      }
    })
  })

  // Sort each exercise's data by date
  Object.values(exerciseData).forEach(ex => {
    ex.data.sort((a, b) => a.dateKey.localeCompare(b.dateKey))
  })

  return exerciseData
}

export default function Progress() {
  const history = useMemo(() => getHistory(30), [])
  const streak = getStreak()
  const exerciseProgress = useMemo(() => buildExerciseProgress(history), [history])

  const [selectedExercise, setSelectedExercise] = useState(null)

  // Get exercises that have at least 2 data points
  const exercisesWithData = Object.entries(exerciseProgress)
    .filter(([, v]) => v.data.length >= 2)
    .sort((a, b) => b[1].data.length - a[1].data.length)

  const currentExerciseId = selectedExercise || exercisesWithData[0]?.[0]
  const currentExercise = exerciseProgress[currentExerciseId]

  // Weekly stats
  const weeklyStats = useMemo(() => {
    const now = new Date()
    const weekAgo = new Date(now)
    weekAgo.setDate(now.getDate() - 7)
    const twoWeeksAgo = new Date(now)
    twoWeeksAgo.setDate(now.getDate() - 14)

    const thisWeek = history.filter(({ dateKey }) => new Date(dateKey) >= weekAgo)
    const lastWeek = history.filter(({ dateKey }) => {
      const d = new Date(dateKey)
      return d >= twoWeeksAgo && d < weekAgo
    })

    const calcVolume = (entries) => entries.reduce((acc, { session }) => {
      if (!session) return acc
      return acc + (session.exercises || []).reduce((a, ex) => {
        return a + ex.sets.reduce((s, set) => {
          if (!set.completed || !set.weightKg) return s
          return s + set.weightKg * (set.actualReps || set.plannedRepsMax)
        }, 0)
      }, 0)
    }, 0)

    return {
      thisWeekSessions: thisWeek.filter(h => h.session?.completed).length,
      lastWeekSessions: lastWeek.filter(h => h.session?.completed).length,
      thisWeekVolume: Math.round(calcVolume(thisWeek)),
      lastWeekVolume: Math.round(calcVolume(lastWeek)),
    }
  }, [history])

  const volumeDiff = weeklyStats.thisWeekVolume - weeklyStats.lastWeekVolume
  const sessionDiff = weeklyStats.thisWeekSessions - weeklyStats.lastWeekSessions

  return (
    <>
      <Header title="Evolução" />
      <div style={{ padding: '20px 20px 100px' }}>
        {/* Streak card */}
        {streak.current > 0 && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: 16,
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            marginBottom: 20,
          }}>
            <Flame size={32} color="#F59E0B" />
            <div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 22,
                fontWeight: 700,
                color: '#F59E0B',
              }}>
                {streak.current} dias seguidos
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Recorde: {streak.longest} dias
              </div>
            </div>
          </div>
        )}

        {/* Weekly comparison */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '16px 20px',
          marginBottom: 20,
        }}>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--text-secondary)',
            marginBottom: 16,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}>
            Esta Semana vs Anterior
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              {
                label: 'Treinos',
                icon: Target,
                current: weeklyStats.thisWeekSessions,
                diff: sessionDiff,
                suffix: '',
              },
              {
                label: 'Volume',
                icon: Activity,
                current: weeklyStats.thisWeekVolume,
                diff: volumeDiff,
                suffix: 'kg',
              },
            ].map(({ label, icon: Icon, current, diff, suffix }) => (
              <div key={label}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Icon size={14} color="var(--text-secondary)" />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
                </div>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 26,
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: 4,
                }}>
                  {current}{suffix}
                </div>
                {diff !== 0 && (
                  <div style={{
                    fontSize: 12,
                    color: diff > 0 ? 'var(--success)' : 'var(--danger)',
                    fontWeight: 600,
                  }}>
                    {diff > 0 ? '↑' : '↓'} {Math.abs(diff)}{suffix} vs semana ant.
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Progress charts */}
        {exercisesWithData.length === 0 ? (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: '32px 20px',
            textAlign: 'center',
          }}>
            <TrendingUp size={40} color="var(--text-disabled)" style={{ marginBottom: 16 }} />
            <h3 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>Sem dados suficientes</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              Registre peso nos treinos para ver gráficos de evolução de carga.
            </p>
          </div>
        ) : (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: '16px 20px',
          }}>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 16,
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: 16,
            }}>
              Evolução de Carga
            </h3>

            {/* Exercise selector */}
            <div style={{
              display: 'flex',
              gap: 8,
              overflowX: 'auto',
              paddingBottom: 12,
              marginBottom: 16,
            }}>
              {exercisesWithData.map(([id, ex]) => (
                <button
                  key={id}
                  onClick={() => setSelectedExercise(id)}
                  style={{
                    flexShrink: 0,
                    padding: '6px 14px',
                    borderRadius: 999,
                    background: currentExerciseId === id ? 'var(--accent)' : 'var(--bg-surface)',
                    border: `1px solid ${currentExerciseId === id ? 'var(--accent)' : 'var(--border)'}`,
                    color: currentExerciseId === id ? '#000' : 'var(--text-secondary)',
                    fontSize: 13,
                    fontWeight: currentExerciseId === id ? 700 : 400,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-display)',
                    minHeight: 36,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {ex.name.split(' ').slice(0, 2).join(' ')}
                </button>
              ))}
            </div>

            {currentExercise && (
              <ProgressChart
                data={currentExercise.data}
                title={currentExercise.name}
              />
            )}
          </div>
        )}
      </div>
    </>
  )
}
