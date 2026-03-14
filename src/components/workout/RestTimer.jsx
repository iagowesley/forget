import { useEffect, useRef } from 'react'
import { SkipForward, Pause, Play } from 'lucide-react'

export default function RestTimer({ timeLeft, totalTime, isRunning, onSkip, onPause, onResume }) {
  if (timeLeft <= 0 && !isRunning) return null

  const radius = 52
  const circumference = 2 * Math.PI * radius
  const progress = totalTime > 0 ? timeLeft / totalTime : 0
  const dashOffset = circumference * (1 - progress)

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return (
    <div style={{
      position: 'fixed',
      bottom: 80,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 32px)',
      maxWidth: 448,
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 20,
      padding: '20px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: 20,
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      zIndex: 50,
      animation: 'slideUp 0.3s ease',
    }}>
      {/* Circular progress */}
      <div style={{ position: 'relative', width: 120, height: 120, flexShrink: 0 }}>
        <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
          {/* Background */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="var(--bg-surface)"
            strokeWidth="6"
          />
          {/* Progress */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 26,
            fontWeight: 700,
            color: 'var(--accent)',
            lineHeight: 1,
          }}>
            {minutes > 0 ? `${minutes}:${seconds.toString().padStart(2, '0')}` : seconds}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>descanso</span>
        </div>
      </div>

      {/* Controls */}
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12 }}>
          Descanse e prepare para a próxima série
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={isRunning ? onPause : onResume}
            style={{
              flex: 1,
              height: 44,
              borderRadius: 10,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              fontSize: 14,
              fontFamily: 'var(--font-body)',
            }}
          >
            {isRunning ? <Pause size={16} /> : <Play size={16} />}
            {isRunning ? 'Pausar' : 'Retomar'}
          </button>
          <button
            onClick={onSkip}
            style={{
              flex: 1,
              height: 44,
              borderRadius: 10,
              background: 'var(--accent)',
              border: 'none',
              color: '#000',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              fontSize: 14,
              fontWeight: 600,
              fontFamily: 'var(--font-display)',
            }}
          >
            <SkipForward size={16} />
            Pular
          </button>
        </div>
      </div>
    </div>
  )
}
