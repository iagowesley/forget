import { Flame } from 'lucide-react'
import { getStreak } from '../../lib/storage'

export default function StreakBadge() {
  const streak = getStreak()
  if (streak.current === 0) return null

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      background: 'rgba(245, 158, 11, 0.15)',
      border: '1px solid rgba(245, 158, 11, 0.3)',
      borderRadius: 999,
      padding: '6px 12px',
    }}>
      <Flame size={16} color="#F59E0B" />
      <span style={{
        fontFamily: 'var(--font-display)',
        fontSize: 13,
        fontWeight: 700,
        color: '#F59E0B',
      }}>
        {streak.current} dia{streak.current !== 1 ? 's' : ''} seguidos
      </span>
    </div>
  )
}
