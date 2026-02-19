import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@store/authStore'
import { ROUTES } from '@utils/constants'

/**
 * EnterpriseRoute - Protects routes that require enterprise subscription
 * First checks authentication, then checks enterprise plan
 * Redirects to pricing if authenticated but not enterprise
 */
export default function EnterpriseRoute({ children }) {
  const accessToken = useAuthStore((state) => state.accessToken)
  const user = useAuthStore((state) => state.user)

  // Check authentication first
  if (!accessToken) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  // Check enterprise subscription
  if (user?.plan !== 'enterprise') {
    return <Navigate to={ROUTES.PRICING} replace />
  }

  return children
}
