import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getWorkoutPlan, DAY_ORDER, DAY_LABELS_SHORT, getTodayKey } from '../lib/workoutData'
import { getDateKey, getSession, getWeekCelebrated, setWeekCelebrated } from '../lib/storage'
import useAuthStore from '../store/authStore'
import StreakBadge from '../components/progress/StreakBadge'
import WeekCompleteModal from '../components/WeekCompleteModal'
import { ChevronRight, Moon, Zap, Calendar } from 'lucide-react'

export default function Today() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const workoutPlan = getWorkoutPlan(profile?.gender)
  const todayKey = getTodayKey()
  const todayPlan = workoutPlan[todayKey]
  const todayDateKey = getDateKey()
  const todaySession = getSession(todayDateKey)
  const [showWeekComplete, setShowWeekComplete] = useState(false)

  const isRestDay = todayPlan?.type === 'Rest'

  // Weekly overview
  const weeklyProgress = DAY_ORDER.slice(0, 5).map(dayKey => {
    const plan = workoutPlan[dayKey]
    // Get date for this week
    const today = new Date()
    const dayOfWeek = today.getDay() // 0 = sunday
    const dayIndex = DAY_ORDER.indexOf(dayKey)
    const diff = dayIndex - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)
    const date = new Date(today)
    date.setDate(today.getDate() + diff)
    const dateKey = getDateKey(date)
    const session = getSession(dateKey)
    const isPast = date < new Date(today.setHours(0, 0, 0, 0))
    const isToday = dayKey === todayKey
    return { dayKey, plan, dateKey, session, isPast, isToday, date }
  })

  const completedThisWeek = weeklyProgress.filter(d => d.session?.completed).length

  // Get current week key (year + week number)
  const getWeekKey = () => {
    const now = new Date()
    const start = new Date(now.getFullYear(), 0, 1)
    const week = Math.ceil(((now - start) / 86400000 + start.getDay() + 1) / 7)
    return `${now.getFullYear()}_w${week}`
  }

  useEffect(() => {
    if (completedThisWeek === 5) {
      const weekKey = getWeekKey()
      if (!getWeekCelebrated(weekKey)) {
        setWeekCelebrated(weekKey)
        setShowWeekComplete(true)
      }
    }
  }, [completedThisWeek])

  return (
    <>
    {showWeekComplete && <WeekCompleteModal onClose={() => setShowWeekComplete(false)} />}
    <div style={{ padding: '20px 20px 100px' }}>
      {/* Header greeting */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
              {profile?.username ? `Olá, ${profile.username} · ` : ''}{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 28,
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.5px',
            }}>
              {isRestDay ? 'Dia de Descanso' : `Treino — ${todayPlan?.type}`}
            </h1>
          </div>
          <span style={{ fontSize: 36 }}>{todayPlan?.emoji}</span>
        </div>
        <StreakBadge />
      </div>

      {/* Weekly bar */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: '16px',
        marginBottom: 24,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}>
            SEMANA
          </span>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {completedThisWeek}/5 treinos
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {weeklyProgress.map(({ dayKey, plan, session, isToday, isPast }) => {
            const done = session?.completed
            return (
              <button
                key={dayKey}
                onClick={() => navigate(`/day/${dayKey}`)}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 4px',
                  background: isToday ? 'rgba(200, 255, 0, 0.1)' : 'none',
                  border: `1px solid ${isToday ? 'rgba(200, 255, 0, 0.3)' : 'transparent'}`,
                  borderRadius: 10,
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: 10, fontWeight: 600, color: isToday ? 'var(--accent)' : 'var(--text-secondary)' }}>
                  {DAY_LABELS_SHORT[dayKey]}
                </span>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: done ? 'var(--accent)' : isPast ? 'var(--bg-surface)' : 'var(--bg-surface)',
                  border: `2px solid ${done ? 'var(--accent)' : isToday ? 'var(--accent)' : 'var(--border)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {done ? (
                    <span style={{ fontSize: 12 }}>✓</span>
                  ) : (
                    <span style={{ fontSize: 10, color: isToday ? 'var(--accent)' : 'var(--text-disabled)' }}>
                      {plan.type?.charAt(0)}
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Today's workout or rest message */}
      {isRestDay ? (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          padding: 32,
          textAlign: 'center',
        }}>
          <Moon size={48} color="var(--text-secondary)" style={{ marginBottom: 16 }} />
          <h2 style={{ fontSize: 22, marginBottom: 8, color: 'var(--text-primary)' }}>
            Recuperação ativa
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
            O descanso é parte do treino. Seus músculos crescem durante a recuperação. Aproveite para alongar, hidratar e dormir bem.
          </p>
          <div style={{
            background: 'rgba(200, 255, 0, 0.08)',
            borderRadius: 12,
            padding: '12px 16px',
            display: 'inline-block',
          }}>
            <span style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 600 }}>
              💡 Dica: consuma creatina mesmo nos dias de descanso
            </span>
          </div>
        </div>
      ) : (
        <div
          style={{ cursor: 'pointer' }}
          onClick={() => navigate(`/day/${todayKey}`)}
        >
          {/* Today's card */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            padding: 20,
            marginBottom: 16,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    background: todayPlan.color + '20',
                    color: todayPlan.color,
                    borderRadius: 999,
                    padding: '3px 10px',
                    letterSpacing: 0.5,
                    textTransform: 'uppercase',
                  }}>
                    {todayPlan.type}
                  </span>
                  {todaySession?.completed && (
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      background: 'rgba(34, 197, 94, 0.15)',
                      color: 'var(--success)',
                      borderRadius: 999,
                      padding: '3px 10px',
                    }}>
                      ✓ Concluído
                    </span>
                  )}
                </div>
                <h2 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 22,
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: 4,
                }}>
                  Foco: {todayPlan.focus}
                </h2>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                  {todayPlan.exercises.length} exercícios · {todayPlan.exercises.reduce((a, e) => a + e.sets, 0)} séries totais
                </p>
              </div>
              <ChevronRight size={24} color="var(--text-secondary)" />
            </div>

            {/* Exercise list preview */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {todayPlan.exercises.slice(0, 3).map(ex => {
                const exSession = todaySession?.exercises?.find(e => e.id === ex.id)
                return (
                  <div key={ex.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    background: exSession?.completed ? 'rgba(200, 255, 0, 0.06)' : 'var(--bg-surface)',
                    borderRadius: 10,
                  }}>
                    <div style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: exSession?.completed ? 'var(--accent)' : 'var(--bg-card)',
                      border: `1px solid ${exSession?.completed ? 'var(--accent)' : 'var(--border)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {exSession?.completed && <span style={{ fontSize: 10, color: '#000' }}>✓</span>}
                    </div>
                    <span style={{ fontSize: 14, color: exSession?.completed ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                      {ex.name}
                    </span>
                    <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-secondary)' }}>
                      {ex.sets}×{ex.repsMin}–{ex.repsMax}
                    </span>
                  </div>
                )
              })}
              {todayPlan.exercises.length > 3 && (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13, paddingTop: 4 }}>
                  + {todayPlan.exercises.length - 3} exercícios
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => navigate(`/day/${todayKey}`)}
            style={{
              width: '100%',
              height: 56,
              borderRadius: 14,
              background: todaySession?.completed ? 'var(--bg-surface)' : 'var(--accent)',
              border: 'none',
              color: todaySession?.completed ? 'var(--text-secondary)' : '#000',
              cursor: 'pointer',
              fontFamily: 'var(--font-display)',
              fontSize: 16,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
            }}
          >
            <Zap size={20} />
            {todaySession?.completed ? 'Ver Treino' : todaySession?.startedAt ? 'Continuar Treino' : 'Iniciar Treino'}
          </button>
        </div>
      )}
    </div>
    </>
  )
}
