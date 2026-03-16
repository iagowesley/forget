import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

const AUTH_PAGES = ['/login', '/setup']

export default function AuthGuard() {
  const { user, profile, loading } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (loading) return

    const onAuthPage = AUTH_PAGES.includes(location.pathname)

    if (!user && !onAuthPage) {
      navigate('/login', { replace: true })
    } else if (user && profile !== undefined && !profile?.profile_completed && location.pathname !== '/setup') {
      // profile === undefined means still loading — don't redirect yet
      navigate('/setup', { replace: true })
    } else if (user && profile?.profile_completed && onAuthPage) {
      navigate('/today', { replace: true })
    }
  }, [user, profile, loading, location.pathname])

  return null
}
