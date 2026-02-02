import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@store/authStore'
import { ROUTES } from '@utils/constants'
import Loader from '@components/common/Loader'

export default function GoogleCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login, setError } = useAuthStore()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Extract tokens from URL params (backend redirects here with tokens)
        const accessToken = searchParams.get('access_token')
        const refreshToken = searchParams.get('refresh_token')
        const error = searchParams.get('error')

        if (error) {
          throw new Error(error)
        }

        if (!accessToken) {
          throw new Error('No access token received')
        }

        // Store tokens temporarily
        localStorage.setItem('access_token', accessToken)
        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken)
        }

        // Fetch user profile
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/users/me`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )

        if (!response.ok) {
          throw new Error('Failed to fetch user profile')
        }

        const data = await response.json()
        const user = data.data

        // Login with user data
        login(user, accessToken, refreshToken)

        // Redirect to dashboard
        navigate(ROUTES.DASHBOARD, { replace: true })
      } catch (error) {
        console.error('Google auth error:', error)
        setError(error.message || 'Authentication failed')
        navigate(ROUTES.LOGIN, { replace: true })
      }
    }

    handleCallback()
  }, [searchParams, login, setError, navigate])

  return (
    <div className="min-h-screen bg-light flex items-center justify-center">
      <div className="text-center">
        <Loader size="lg" />
        <p className="mt-4 text-gray font-medium">Signing you in...</p>
      </div>
    </div>
  )
}
