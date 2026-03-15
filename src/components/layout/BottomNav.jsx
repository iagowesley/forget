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
      borderRadius: 28,
      display: 'flex',
      padding: '4px 8px',
      zIndex: 100,
      boxShadow: '0 8px 32px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.06) inset',
    }}>
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
              padding: '8px 0',
              background: active ? 'rgba(200, 255, 0, 0.12)' : 'none',
              borderRadius: 20,
              border: 'none',
              cursor: 'pointer',
              color: active ? 'var(--accent)' : 'rgba(255,255,255,0.45)',
              gap: 3,
              minHeight: 52,
              transition: 'color 0.2s, background 0.2s',
            }}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
            <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, fontFamily: 'var(--font-body)' }}>
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
