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
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: 480,
      background: 'var(--bg-card)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      zIndex: 100,
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
              padding: '10px 0',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: active ? 'var(--accent)' : 'var(--text-secondary)',
              gap: 4,
              minHeight: 56,
              transition: 'color 0.15s',
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
