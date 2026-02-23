import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@store/authStore'
import { ROUTES } from '@utils/constants'

/**
 * PrivateRoute - Protects routes that require authentication
 * Redirects to login if user is not authenticated
 * Preserves the intended destination for redirect after login
 *
 * Checks both accessToken and refreshToken — if a refresh token exists,
 * the user is still considered authenticated (the API interceptor will
 * handle refreshing the access token automatically).
 */
export default function PrivateRoute({ children }) {
  const accessToken = useAuthStore((state) => state.accessToken)
  const refreshToken = useAuthStore((state) => state.refreshToken)
  const location = useLocation()

  if (!accessToken && !refreshToken) {
    // No tokens at all — redirect to login, but save the attempted URL
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  return children
}
