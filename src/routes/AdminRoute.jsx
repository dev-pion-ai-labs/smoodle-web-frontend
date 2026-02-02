import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@store/authStore'
import { ROUTES } from '@utils/constants'

/**
 * AdminRoute - Protects routes that require admin role
 * First checks authentication, then checks admin status
 * Redirects to dashboard if authenticated but not admin
 */
export default function AdminRoute({ children }) {
  const accessToken = useAuthStore((state) => state.accessToken)
  const user = useAuthStore((state) => state.user)

  // Check authentication first
  if (!accessToken) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  // Check admin status
  const isAdmin = user?.role === 'admin' || user?.is_admin === true
  if (!isAdmin) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  return children
}
