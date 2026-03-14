import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import BottomNav from './components/layout/BottomNav'
import AuthGuard from './components/auth/AuthGuard'
import useAuthStore from './store/authStore'
import { initNotifications } from './lib/notifications'
import { getSettings } from './lib/storage'
import Today from './pages/Today'
import DayView from './pages/DayView'
import ExerciseView from './pages/ExerciseView'
import History from './pages/History'
import Progress from './pages/Progress'
import Settings from './pages/Settings'
import Login from './pages/Login'
import ProfileSetup from './pages/ProfileSetup'
import Header from './components/layout/Header'
import { Zap } from 'lucide-react'

const HIDE_NAV_PATHS = ['/login', '/setup']

function AppShell() {
  const location = useLocation()
  const { loading, initialize } = useAuthStore()

  useEffect(() => {
    const unsub = initialize()
    initNotifications(getSettings())
    return unsub
  }, [])

  const hideNav = HIDE_NAV_PATHS.includes(location.pathname)

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        background: 'var(--bg-primary)',
      }}>
        <Zap size={40} color="var(--accent)" />
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Carregando...</p>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      background: 'var(--bg-primary)',
    }}>
      <AuthGuard />
      <Routes>
        <Route path="/" element={<Navigate to="/today" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/setup" element={<ProfileSetup />} />
        <Route
          path="/today"
          element={
            <>
              <Header title="FORGEfit" right={<span style={{ fontSize: 20 }}>⚡</span>} />
              <Today />
            </>
          }
        />
        <Route path="/day/:dayName" element={<DayView />} />
        <Route path="/exercise/:id" element={<ExerciseView />} />
        <Route path="/history" element={<History />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
      {!hideNav && <BottomNav />}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}
