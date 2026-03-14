import { useNavigate } from 'react-router-dom'
import { Trophy, ArrowLeft, Flame } from 'lucide-react'

export default function CompletionScreen({ session, dayPlan }) {
  const navigate = useNavigate()

  const totalSets = session.exercises.reduce((acc, ex) => acc + ex.sets.length, 0)
  const completedSets = session.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0)

  const totalVolume = session.exercises.reduce((acc, ex) => {
    return acc + ex.sets.reduce((a, s) => {
      if (!s.completed || !s.weightKg) return a
      return a + (s.weightKg * (s.actualReps || s.plannedRepsMax))
    }, 0)
  }, 0)

  const durationMs = session.finishedAt && session.startedAt
    ? new Date(session.finishedAt) - new Date(session.startedAt)
    : 0
  const minutes = Math.floor(durationMs / 60000)

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'var(--bg-primary)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      zIndex: 200,
      animation: 'fadeIn 0.4s ease',
    }}>
      {/* Trophy */}
      <div style={{
        width: 100,
        height: 100,
        borderRadius: '50%',
        background: 'rgba(200, 255, 0, 0.1)',
        border: '2px solid var(--accent)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 28,
        animation: 'pulse-ring 1.5s ease infinite',
      }}>
        <Trophy size={48} color="var(--accent)" />
      </div>

      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 32,
        fontWeight: 700,
        color: 'var(--text-primary)',
        textAlign: 'center',
        marginBottom: 8,
      }}>
        Treino Completo!
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 16, textAlign: 'center', marginBottom: 36 }}>
        {dayPlan?.type} — {dayPlan?.label}
      </p>

      {/* Stats grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 12,
        width: '100%',
        maxWidth: 360,
        marginBottom: 40,
      }}>
        {[
          { label: 'Séries', value: `${completedSets}/${totalSets}` },
          { label: 'Exercícios', value: session.exercises.filter(e => e.completed).length },
          { label: 'Volume', value: totalVolume > 0 ? `${Math.round(totalVolume)}kg` : '—' },
          { label: 'Duração', value: minutes > 0 ? `${minutes}min` : '—' },
        ].map(({ label, value }) => (
          <div key={label} style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '16px 20px',
            textAlign: 'center',
          }}>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 24,
              fontWeight: 700,
              color: 'var(--accent)',
              marginBottom: 4,
            }}>
              {value}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 360 }}>
        <button
          onClick={() => navigate('/today')}
          style={{
            flex: 1,
            height: 52,
            borderRadius: 12,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontFamily: 'var(--font-display)',
            fontSize: 15,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <ArrowLeft size={18} />
          Início
        </button>
        <button
          onClick={() => navigate('/history')}
          style={{
            flex: 1,
            height: 52,
            borderRadius: 12,
            background: 'var(--accent)',
            border: 'none',
            color: '#000',
            cursor: 'pointer',
            fontFamily: 'var(--font-display)',
            fontSize: 15,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Flame size={18} />
          Histórico
        </button>
      </div>
    </div>
  )
}
