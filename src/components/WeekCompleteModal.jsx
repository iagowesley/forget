import { useNavigate } from 'react-router-dom'
import { Star, Flame, RefreshCw } from 'lucide-react'

const MESSAGES = [
  'Semana DESTRUÍDA! Você é imparável! 🔥',
  'Consistência é o segredo dos campeões. 5 de 5!',
  'Você fez o que a maioria nunca faz. Parabéns!',
  'Músculo se constrói com dedicação — e você tem de sobra.',
  'PPL completo! Descanse bem, você mereceu muito.',
  'Disciplina bate motivação sempre. E você provou isso.',
]

function Confetti() {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2.5,
    duration: 2.5 + Math.random() * 2,
    color: ['#C8FF00', '#818CF8', '#F59E0B', '#EC4899', '#14B8A6', '#ffffff', '#ff6b6b'][Math.floor(Math.random() * 7)],
    size: 6 + Math.random() * 8,
    rotation: Math.random() * 360,
  }))

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: -20,
            width: p.size,
            height: p.size,
            borderRadius: p.id % 3 === 0 ? '50%' : p.id % 3 === 1 ? 2 : 0,
            background: p.color,
            transform: `rotate(${p.rotation}deg)`,
            animation: `confetti-fall ${p.duration}s ${p.delay}s ease-in forwards`,
          }}
        />
      ))}
    </div>
  )
}

export default function WeekCompleteModal({ onClose }) {
  const navigate = useNavigate()
  const message = MESSAGES[Math.floor(Math.random() * MESSAGES.length)]

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.92)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      zIndex: 300,
      animation: 'fadeIn 0.4s ease',
    }}>
      <Confetti />

      <div style={{
        width: 110,
        height: 110,
        borderRadius: '50%',
        background: 'rgba(200, 255, 0, 0.12)',
        border: '3px solid var(--accent)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 28,
        position: 'relative',
        zIndex: 1,
        boxShadow: '0 0 40px rgba(200,255,0,0.3)',
      }}>
        <Star size={52} color="var(--accent)" fill="var(--accent)" />
      </div>

      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 34,
        fontWeight: 700,
        color: 'var(--text-primary)',
        textAlign: 'center',
        marginBottom: 6,
        position: 'relative',
        zIndex: 1,
      }}>
        SEMANA COMPLETA!
      </h1>

      <p style={{
        color: 'var(--accent)',
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 16,
        fontWeight: 700,
        position: 'relative',
        zIndex: 1,
        fontFamily: 'var(--font-display)',
      }}>
        5 / 5 treinos ✓
      </p>

      <p style={{
        color: 'var(--text-secondary)',
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 44,
        lineHeight: 1.7,
        maxWidth: 300,
        position: 'relative',
        zIndex: 1,
      }}>
        {message}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 360, position: 'relative', zIndex: 1 }}>
        <button
          onClick={onClose}
          style={{
            height: 56,
            borderRadius: 14,
            background: 'var(--accent)',
            border: 'none',
            color: '#000',
            cursor: 'pointer',
            fontFamily: 'var(--font-display)',
            fontSize: 17,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}
        >
          <RefreshCw size={20} />
          Começar Nova Semana
        </button>

        <button
          onClick={() => { navigate('/history'); onClose() }}
          style={{
            height: 52,
            borderRadius: 14,
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
            gap: 10,
          }}
        >
          <Flame size={18} />
          Ver Histórico
        </button>
      </div>
    </div>
  )
}
