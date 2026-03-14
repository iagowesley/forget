import { useState } from 'react'
import { Check, RotateCcw } from 'lucide-react'
import { formatReps } from '../../lib/workoutData'

export default function SetTracker({ set, exercise, onComplete, onUncomplete, lastWeight }) {
  const [weight, setWeight] = useState(set.weightKg ?? lastWeight ?? '')
  const [reps, setReps] = useState(set.actualReps ?? '')

  const handleComplete = () => {
    onComplete(set.setNumber, {
      weightKg: weight !== '' ? parseFloat(weight) : null,
      actualReps: reps !== '' ? parseInt(reps) : exercise.repsMax,
    })
  }

  return (
    <div style={{
      background: set.completed ? 'rgba(200, 255, 0, 0.06)' : 'var(--bg-card)',
      border: `1px solid ${set.completed ? 'rgba(200, 255, 0, 0.2)' : 'var(--border)'}`,
      borderRadius: 12,
      padding: '14px 16px',
      transition: 'all 0.2s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Set number */}
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          background: set.completed ? 'var(--accent)' : 'var(--bg-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          {set.completed ? (
            <Check size={16} color="#000" strokeWidth={3} />
          ) : (
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 14,
              fontWeight: 700,
              color: 'var(--text-secondary)',
            }}>
              {set.setNumber}
            </span>
          )}
        </div>

        {/* Planned reps */}
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Meta: {formatReps(set.plannedRepsMin, set.plannedRepsMax)} reps
          </span>
        </div>

        {/* Inputs */}
        {!set.completed ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <input
                type="number"
                placeholder="kg"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                inputMode="decimal"
                style={{
                  width: 64,
                  height: 40,
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  color: 'var(--text-primary)',
                  textAlign: 'center',
                  fontSize: 15,
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                  outline: 'none',
                }}
              />
              <span style={{ fontSize: 10, color: 'var(--text-disabled)' }}>kg</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <input
                type="number"
                placeholder="reps"
                value={reps}
                onChange={e => setReps(e.target.value)}
                inputMode="numeric"
                style={{
                  width: 60,
                  height: 40,
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  color: 'var(--text-primary)',
                  textAlign: 'center',
                  fontSize: 15,
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                  outline: 'none',
                }}
              />
              <span style={{ fontSize: 10, color: 'var(--text-disabled)' }}>reps</span>
            </div>

            <button
              onClick={handleComplete}
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: 'var(--accent)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Check size={20} color="#000" strokeWidth={3} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ textAlign: 'right' }}>
              {set.weightKg != null && (
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--accent)' }}>
                  {set.weightKg}kg
                </div>
              )}
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                {set.actualReps || set.plannedRepsMax} reps
              </div>
            </div>
            <button
              onClick={() => onUncomplete(set.setNumber)}
              style={{
                background: 'none',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: 8,
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                minHeight: 44,
                minWidth: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <RotateCcw size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
