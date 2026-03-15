import { useNavigate, useLocation } from 'react-router-dom'
import { Zap, Clock, BarChart2, Leaf, Settings } from 'lucide-react'

const NAV_ITEMS = [
  { path: '/today', icon: Zap, label: 'Hoje' },
  { path: '/history', icon: Clock, label: 'Histórico' },
  { path: '/diet', icon: Leaf, label: 'Dieta' },
  { path: '/progress', icon: BarChart2, label: 'Evolução' },
  { path: '/settings', icon: Settings, label: 'Config' },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  const activeIndex = NAV_ITEMS.findIndex(
    ({ path }) => location.pathname === path || location.pathname.startsWith(path + '/')
  )

  const itemWidthPct = 100 / NAV_ITEMS.length

  return (
    <nav style={{
      position: 'fixed',
      bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 32px)',
      maxWidth: 448,
      background: 'rgba(30, 30, 30, 0.55)',
      backdropFilter: 'blur(28px) saturate(180%)',
      WebkitBackdropFilter: 'blur(28px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.10)',
      borderRadius: 999,
      display: 'flex',
      padding: '6px 10px',
      zIndex: 100,
      boxShadow: '0 8px 32px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.06) inset',
    }}>
      {/* Sliding indicator */}
      {activeIndex >= 0 && (
        <div style={{
          position: 'absolute',
          top: 6,
          bottom: 6,
          left: `calc(10px + ${activeIndex} * (100% - 20px) / ${NAV_ITEMS.length})`,
          width: `calc((100% - 20px) / ${NAV_ITEMS.length})`,
          background: 'rgba(200, 255, 0, 0.13)',
          borderRadius: 999,
          transition: 'left 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
          pointerEvents: 'none',
        }} />
      )}

      {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
        const active = location.pathname === path || location.pathname.startsWith(path + '/')
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px 0',
              background: 'none',
              borderRadius: 999,
              border: 'none',
              cursor: 'pointer',
              color: active ? 'var(--accent)' : 'rgba(255,255,255,0.45)',
              gap: 3,
              minHeight: 56,
              position: 'relative',
              zIndex: 1,
              transition: 'color 0.3s ease',
            }}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 1.8} style={{ transition: 'stroke-width 0.3s ease' }} />
            <span style={{
              fontSize: 10,
              fontWeight: active ? 600 : 400,
              fontFamily: 'var(--font-body)',
              transition: 'font-weight 0.3s ease',
            }}>
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
