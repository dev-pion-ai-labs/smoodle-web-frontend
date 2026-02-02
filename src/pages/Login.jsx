import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { loginSchema } from '@utils/validators'
import { login, getCurrentUser } from '@services/authService'
import { useAuthStore } from '@store/authStore'
import { ROUTES } from '@utils/constants'
import AuthLayout from '@components/auth/AuthLayout'
import GoogleAuthButton, { AuthDivider } from '@components/auth/GoogleAuthButton'
import Input from '@components/common/Input'
import Button from '@components/common/Button'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const loginUser = useAuthStore((state) => state.login)
  const [isLoading, setIsLoading] = useState(false)

  // Get the intended destination (if redirected from PrivateRoute)
  const from = location.state?.from?.pathname || ROUTES.DASHBOARD

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      // Login to get tokens
      const tokenResponse = await login(data.email, data.password)
      const { access_token, refresh_token } = tokenResponse

      // Store tokens temporarily to fetch user profile
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('refresh_token', refresh_token)

      // Fetch user profile
      const user = await getCurrentUser()

      // Update auth store
      loginUser(user, access_token, refresh_token)

      toast.success('Welcome back!')
      navigate(from, { replace: true })
    } catch (error) {
      toast.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to continue verifying content"
    >
      {/* Google OAuth */}
      <GoogleAuthButton text="Continue with Google" />

      <AuthDivider />

      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          icon={Mail}
          error={errors.email?.message}
          {...register('email')}
        />

        <div>
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            icon={Lock}
            error={errors.password?.message}
            {...register('password')}
          />
          <div className="mt-2 text-right">
            <Link
              to={ROUTES.FORGOT_PASSWORD}
              className="text-sm text-primary hover:text-primary-dark transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          fullWidth
          loading={isLoading}
          className="mt-6"
        >
          Log In
        </Button>
      </form>

      {/* Signup link */}
      <p className="text-center text-sm text-gray mt-6">
        Don't have an account?{' '}
        <Link
          to={ROUTES.SIGNUP}
          className="text-primary font-medium hover:text-primary-dark transition-colors"
        >
          Sign up
        </Link>
      </p>
    </AuthLayout>
  )
}
