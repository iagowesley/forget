import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getWorkoutPlan } from '../lib/workoutData'
import { getDateKey } from '../lib/storage'
import useWorkoutStore from '../store/workoutStore'
import useAuthStore from '../store/authStore'
import ExerciseCard from '../components/workout/ExerciseCard'
import Header from '../components/layout/Header'
import { Zap, Moon, Timer, CheckCircle2 } from 'lucide-react'

export default function DayView() {
  const { dayName } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const workoutPlan = getWorkoutPlan(profile?.gender)
  const dayPlan = workoutPlan[dayName]

  const { currentSession, initSession, startSession } = useWorkoutStore()

  // For simplicity, use today's date for current day, otherwise approximate
  const today = new Date()
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const todayKey = days[today.getDay()]
  const dayIndex = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].indexOf(dayName)
  const todayIndex = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].indexOf(todayKey)
  const diff = dayIndex - todayIndex
  const sessionDate = new Date(today)
  sessionDate.setDate(today.getDate() + diff)
  const dateKey = getDateKey(sessionDate)

  useEffect(() => {
    if (dayPlan && dayPlan.type !== 'Rest') {
      initSession(dayName, dateKey, dayPlan)
    }
  }, [dayName, dateKey])

  if (!dayPlan) {
    return (
      <div style={{ padding: 20, color: 'var(--text-secondary)' }}>Dia não encontrado</div>
    )
  }

  if (dayPlan.type === 'Rest') {
    return (
      <>
        <Header title={dayPlan.label} showBack />
        <div style={{ padding: 40, textAlign: 'center' }}>
          <Moon size={48} color="var(--text-secondary)" style={{ marginBottom: 16 }} />
          <h2 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>Dia de Descanso</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Recuperação é parte essencial do treino.</p>
        </div>
      </>
    )
  }

  const completedExercises = currentSession?.exercises?.filter(e => e.completed).length || 0
  const totalExercises = dayPlan.exercises.length

  // Live elapsed timer
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    if (!currentSession?.startedAt || currentSession?.completed) return
    const start = new Date(currentSession.startedAt)
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [currentSession?.startedAt, currentSession?.completed])

  const formatElapsed = (s) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const handleStart = () => {
    startSession(dateKey)
  }

  return (
    <>
      <Header title={dayPlan.label} showBack />
      <div style={{ padding: '20px 20px 100px' }}>
        {/* Day header */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '16px 20px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              color: dayPlan.color,
              background: dayPlan.color + '15',
              borderRadius: 999,
              padding: '3px 10px',
              display: 'inline-block',
              marginBottom: 6,
            }}>
              {dayPlan.type}
            </span>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 20,
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: 2,
            }}>
              Foco: {dayPlan.focus}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {completedExercises}/{totalExercises} exercícios concluídos
            </p>
          </div>
          <span style={{ fontSize: 36 }}>{dayPlan.emoji}</span>
        </div>

        {/* Progress bar */}
        {currentSession?.startedAt && (
          <div style={{
            height: 4,
            background: 'var(--bg-surface)',
            borderRadius: 999,
            marginBottom: 20,
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0}%`,
              background: 'var(--accent)',
              borderRadius: 999,
              transition: 'width 0.4s ease',
            }} />
          </div>
        )}

        {/* In-progress banner */}
        {currentSession?.startedAt && !currentSession?.completed && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            background: 'rgba(200,255,0,0.08)',
            border: '1px solid rgba(200,255,0,0.25)',
            borderRadius: 12,
            marginBottom: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: 'var(--accent)',
                animation: 'pulse-dot 1.5s ease-in-out infinite',
              }} />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>
                Em andamento
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                · {completedExercises}/{totalExercises} exercícios
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Timer size={14} color="var(--text-secondary)" />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                {formatElapsed(elapsed)}
              </span>
            </div>
          </div>
        )}

        {/* Completed banner */}
        {currentSession?.completed && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 16px',
            background: 'rgba(34,197,94,0.08)',
            border: '1px solid rgba(34,197,94,0.25)',
            borderRadius: 12,
            marginBottom: 16,
          }}>
            <CheckCircle2 size={18} color="var(--success)" />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--success)' }}>
              Treino concluído!
            </span>
            {currentSession.finishedAt && currentSession.startedAt && (
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 'auto' }}>
                {Math.round((new Date(currentSession.finishedAt) - new Date(currentSession.startedAt)) / 60000)} min
              </span>
            )}
          </div>
        )}

        {/* Start button if not started */}
        {!currentSession?.startedAt && (
          <button
            onClick={handleStart}
            style={{
              width: '100%',
              height: 52,
              borderRadius: 12,
              background: 'var(--accent)',
              border: 'none',
              color: '#000',
              cursor: 'pointer',
              fontFamily: 'var(--font-display)',
              fontSize: 16,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginBottom: 20,
            }}
          >
            <Zap size={20} />
            Iniciar Treino
          </button>
        )}

        {/* Exercise list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {dayPlan.exercises.map(exercise => {
            const sessionEx = currentSession?.exercises?.find(e => e.id === exercise.id)
            return (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                sessionExercise={sessionEx}
                dayKey={dayName}
                dateKey={dateKey}
              />
            )
          })}
        </div>
      </div>
    </>
  )
}
