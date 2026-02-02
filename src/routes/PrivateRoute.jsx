import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@store/authStore'
import { ROUTES } from '@utils/constants'

/**
 * PrivateRoute - Protects routes that require authentication
 * Redirects to login if user is not authenticated
 * Preserves the intended destination for redirect after login
 */
export default function PrivateRoute({ children }) {
  const accessToken = useAuthStore((state) => state.accessToken)
  const location = useLocation()

  if (!accessToken) {
    // Redirect to login, but save the attempted URL
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  return children
}
