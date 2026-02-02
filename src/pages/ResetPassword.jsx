import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Lock, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { resetPasswordSchema } from '@utils/validators'
import { resetPassword } from '@services/authService'
import { ROUTES } from '@utils/constants'
import AuthLayout from '@components/auth/AuthLayout'
import Input from '@components/common/Input'
import Button from '@components/common/Button'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [tokenError, setTokenError] = useState(false)

  // Check if token exists
  useEffect(() => {
    if (!token) {
      setTokenError(true)
    }
  }, [token])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirm_password: '',
    },
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await resetPassword(token, data.password)
      setIsSuccess(true)
    } catch (error) {
      toast.error(error)
      // Check if it's a token error
      if (error.includes('expired') || error.includes('invalid')) {
        setTokenError(true)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Invalid/missing token state
  if (tokenError) {
    return (
      <AuthLayout title="Invalid Reset Link" showBackToHome={false}>
        <div className="text-center">
          <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-error" />
          </div>

          <p className="text-gray mb-6">
            This password reset link is invalid or has expired. Please request a new one.
          </p>

          <Link to={ROUTES.FORGOT_PASSWORD}>
            <Button fullWidth>Request New Link</Button>
          </Link>

          <p className="text-center text-sm text-gray mt-4">
            <Link
              to={ROUTES.LOGIN}
              className="text-primary font-medium hover:text-primary-dark transition-colors"
            >
              Back to login
            </Link>
          </p>
        </div>
      </AuthLayout>
    )
  }

  // Success state
  if (isSuccess) {
    return (
      <AuthLayout title="Password Reset!" showBackToHome={false}>
        <div className="text-center">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>

          <p className="text-gray mb-6">
            Your password has been reset successfully. You can now log in with your new password.
          </p>

          <Link to={ROUTES.LOGIN}>
            <Button fullWidth>Go to Login</Button>
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Set new password"
      subtitle="Your new password must be different from previous passwords"
    >
      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="New Password"
          type="password"
          placeholder="Min. 8 characters"
          icon={Lock}
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label="Confirm New Password"
          type="password"
          placeholder="Confirm your password"
          icon={Lock}
          error={errors.confirm_password?.message}
          {...register('confirm_password')}
        />

        <Button
          type="submit"
          fullWidth
          loading={isLoading}
          className="mt-6"
        >
          Reset Password
        </Button>
      </form>

      {/* Back to login */}
      <p className="text-center text-sm text-gray mt-6">
        Remember your password?{' '}
        <Link
          to={ROUTES.LOGIN}
          className="text-primary font-medium hover:text-primary-dark transition-colors"
        >
          Log in
        </Link>
      </p>
    </AuthLayout>
  )
}
