import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@store/authStore'
import { getCurrentUser } from '@services/authService'
import { ROUTES } from '@utils/constants'
import { Spinner } from '@components/common/Loader'
import Button from '@components/common/Button'
import logo from '@assets/logo.png'

export default function GoogleCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const loginUser = useAuthStore((state) => state.login)
  const [error, setError] = useState(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Extract tokens from URL params (backend redirects here with tokens)
        const accessToken = searchParams.get('access_token')
        const refreshToken = searchParams.get('refresh_token')
        const errorParam = searchParams.get('error')
        const errorMessage = searchParams.get('error_description')

        if (errorParam) {
          throw new Error(errorMessage || errorParam || 'Authentication failed')
        }

        if (!accessToken) {
          throw new Error('No access token received')
        }

        // Store tokens temporarily to fetch user profile
        localStorage.setItem('access_token', accessToken)
        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken)
        }

        // Fetch user profile
        const user = await getCurrentUser()

        // Login with user data
        loginUser(user, accessToken, refreshToken)

        toast.success('Welcome to Smoodle!')
        navigate(ROUTES.DASHBOARD, { replace: true })
      } catch (err) {
        console.error('Google auth error:', err)
        // Clear any partial auth state
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        setError(err.message || 'Authentication failed')
      }
    }

    handleCallback()
  }, [searchParams, loginUser, navigate])

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center animate-in fade-in duration-300">
          {/* Logo */}
          <img
            src={logo}
            alt="Smoodle"
            className="h-12 w-auto mx-auto rounded-xl mb-6"
          />

          {/* Error icon */}
          <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-error" />
          </div>

          <h1 className="font-heading text-xl font-bold text-dark mb-2">
            Authentication Failed
          </h1>
          <p className="text-gray mb-6">{error}</p>

          <Link to={ROUTES.LOGIN}>
            <Button fullWidth>Back to Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Loading state
  return (
    <div className="min-h-screen bg-light flex items-center justify-center">
      <div className="text-center animate-in fade-in duration-300">
        {/* Logo */}
        <img
          src={logo}
          alt="Smoodle"
          className="h-16 w-auto mx-auto rounded-xl shadow-lg mb-8"
        />

        {/* Spinner */}
        <Spinner size="xl" className="mx-auto" />

        {/* Text */}
        <p className="mt-6 text-lg font-medium text-dark">Signing you in...</p>
        <p className="mt-2 text-sm text-gray">
          Please wait while we complete authentication
        </p>
      </div>
    </div>
  )
}
