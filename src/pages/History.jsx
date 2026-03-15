import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header'
import { getHistory } from '../lib/storage'
import { getWorkoutPlan } from '../lib/workoutData'
import useAuthStore from '../store/authStore'
import { Calendar, CheckCircle, BarChart2 } from 'lucide-react'

function formatDate(dateKey) {
  const date = new Date(dateKey + 'T00:00:00')
  return date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })
}

export default function History() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const workoutPlan = getWorkoutPlan(profile?.gender)
  const history = useMemo(() => getHistory(30), [])

  const completedCount = history.filter(h => h.session?.completed).length
  const totalVolume = history.reduce((acc, { session }) => {
    if (!session) return acc
    return acc + (session.exercises || []).reduce((a, ex) => {
      return a + (ex.sets || []).reduce((s, set) => {
        if (!set.completed || !set.weightKg) return s
        return s + set.weightKg * (set.actualReps || set.plannedRepsMax)
      }, 0)
    }, 0)
  }, 0)

  if (history.length === 0) {
    return (
      <>
        <Header title="Histórico" />
        <div style={{ padding: 40, textAlign: 'center' }}>
          <Calendar size={48} color="var(--text-disabled)" style={{ marginBottom: 16 }} />
          <h2 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>Nenhum treino ainda</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Complete seu primeiro treino para ver o histórico aqui.
          </p>
        </div>
      </>
    )
  }

  return (
    <>
      <Header title="Histórico" />
      <div style={{ padding: '20px 20px 100px' }}>
        {/* Summary */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          marginBottom: 24,
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: '16px 18px',
          }}>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 28,
              fontWeight: 700,
              color: 'var(--accent)',
              marginBottom: 4,
            }}>
              {completedCount}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>treinos (30 dias)</div>
          </div>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: '16px 18px',
          }}>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 28,
              fontWeight: 700,
              color: 'var(--accent)',
              marginBottom: 4,
            }}>
              {totalVolume > 0 ? `${Math.round(totalVolume / 1000)}t` : '—'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>volume total</div>
          </div>
        </div>

        {/* History list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {history.map(({ dateKey, session }) => {
            const dayPlan = workoutPlan[session?.dayKey]
            const completedSets = (session?.exercises || [])
              .reduce((a, ex) => a + ex.sets.filter(s => s.completed).length, 0)
            const totalSets = (session?.exercises || [])
              .reduce((a, ex) => a + ex.sets.length, 0)

            const sessionVolume = (session?.exercises || []).reduce((a, ex) => {
              return a + ex.sets.reduce((s, set) => {
                if (!set.completed || !set.weightKg) return s
                return s + set.weightKg * (set.actualReps || set.plannedRepsMax)
              }, 0)
            }, 0)

            return (
              <div
                key={dateKey}
                style={{
                  background: 'var(--bg-card)',
                  border: `1px solid ${session?.completed ? 'rgba(200, 255, 0, 0.15)' : 'var(--border)'}`,
                  borderRadius: 14,
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                }}
              >
                {/* Status icon */}
                <div style={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  background: session?.completed ? 'rgba(200, 255, 0, 0.1)' : 'var(--bg-surface)',
                  border: `2px solid ${session?.completed ? 'rgba(200, 255, 0, 0.3)' : 'var(--border)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: 18,
                }}>
                  {dayPlan?.emoji || '💪'}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <span style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 15,
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                    }}>
                      {session?.type || 'Treino'}
                    </span>
                    {session?.completed && (
                      <CheckCircle size={14} color="var(--accent)" />
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 3 }}>
                    {formatDate(dateKey)}
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {completedSets}/{totalSets} séries
                    </span>
                    {sessionVolume > 0 && (
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        {Math.round(sessionVolume)}kg vol.
                      </span>
                    )}
                  </div>
                </div>

                {/* Exercises done */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 18,
                    fontWeight: 700,
                    color: session?.completed ? 'var(--accent)' : 'var(--text-secondary)',
                  }}>
                    {session?.exercises?.filter(e => e.completed).length || 0}/{session?.exercises?.length || 0}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>exercícios</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
