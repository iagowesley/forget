import { Check, ChevronRight, Dumbbell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getIntensityColor, formatReps } from '../../lib/workoutData'

export default function ExerciseCard({ exercise, sessionExercise, dayKey, dateKey }) {
  const navigate = useNavigate()
  const completed = sessionExercise?.completed || false
  const completedSets = sessionExercise?.sets?.filter(s => s.completed).length || 0
  const totalSets = exercise.sets

  const intensityColor = getIntensityColor(exercise.intensity)

  return (
    <button
      onClick={() => navigate(`/exercise/${exercise.id}?day=${dayKey}&date=${dateKey}`)}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '14px 16px',
        background: completed ? 'rgba(200, 255, 0, 0.06)' : 'var(--bg-card)',
        border: `1px solid ${completed ? 'rgba(200, 255, 0, 0.2)' : 'var(--border)'}`,
        borderRadius: 12,
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.2s',
        minHeight: 72,
      }}
    >
      {/* Completion indicator */}
      <div style={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        background: completed ? 'var(--accent)' : 'var(--bg-surface)',
        border: `2px solid ${completed ? 'var(--accent)' : 'var(--border)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transition: 'all 0.2s',
      }}>
        {completed ? (
          <Check size={18} color="#000" strokeWidth={3} />
        ) : (
          <Dumbbell size={16} color="var(--text-disabled)" />
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 15,
          fontWeight: 600,
          color: completed ? 'var(--accent)' : 'var(--text-primary)',
          marginBottom: 4,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {exercise.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {exercise.sets}×{formatReps(exercise.repsMin, exercise.repsMax)}
          </span>
          <span style={{
            fontSize: 11,
            fontWeight: 600,
            color: intensityColor,
            background: intensityColor + '15',
            borderRadius: 999,
            padding: '2px 8px',
            letterSpacing: 0.3,
          }}>
            {exercise.intensity}
          </span>
          {completedSets > 0 && !completed && (
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {completedSets}/{totalSets} séries
            </span>
          )}
        </div>
      </div>

      <ChevronRight size={18} color="var(--text-disabled)" />
    </button>
  )
}
