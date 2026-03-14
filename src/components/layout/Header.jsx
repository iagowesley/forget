import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

export default function Header({ title, showBack = false, right = null }) {
  const navigate = useNavigate()

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 20px',
      paddingTop: 'calc(16px + env(safe-area-inset-top, 0px))',
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg-primary)',
      position: 'sticky',
      top: 0,
      zIndex: 10,
      minHeight: 60,
    }}>
      <div style={{ width: 44, display: 'flex', alignItems: 'center' }}>
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              padding: 8,
              margin: -8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 44,
              minWidth: 44,
            }}
          >
            <ChevronLeft size={24} />
          </button>
        )}
      </div>

      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 17,
        fontWeight: 600,
        color: 'var(--text-primary)',
        letterSpacing: '-0.3px',
      }}>
        {title}
      </h2>

      <div style={{ width: 44, display: 'flex', justifyContent: 'flex-end' }}>
        {right}
      </div>
    </header>
  )
}
