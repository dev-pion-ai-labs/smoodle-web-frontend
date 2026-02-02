import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { forgotPasswordSchema } from '@utils/validators'
import { forgotPassword } from '@services/authService'
import { ROUTES } from '@utils/constants'
import AuthLayout from '@components/auth/AuthLayout'
import Input from '@components/common/Input'
import Button from '@components/common/Button'

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [sentEmail, setSentEmail] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await forgotPassword(data.email)
      setSentEmail(data.email)
      setEmailSent(true)
    } catch (error) {
      toast.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  // Success state
  if (emailSent) {
    return (
      <AuthLayout title="Check your email" showBackToHome={false}>
        <div className="text-center">
          {/* Success icon */}
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>

          <p className="text-gray mb-2">
            We've sent a password reset link to:
          </p>
          <p className="font-medium text-dark mb-6">{sentEmail}</p>

          <p className="text-sm text-gray mb-6">
            Click the link in the email to reset your password. If you don't see it, check your spam folder.
          </p>

          <Link to={ROUTES.LOGIN}>
            <Button variant="outline" fullWidth icon={ArrowLeft}>
              Back to Login
            </Button>
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Forgot password?"
      subtitle="No worries, we'll send you reset instructions"
    >
      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          icon={Mail}
          error={errors.email?.message}
          {...register('email')}
        />

        <Button
          type="submit"
          fullWidth
          loading={isLoading}
          className="mt-6"
        >
          Send Reset Link
        </Button>
      </form>

      {/* Back to login */}
      <p className="text-center text-sm text-gray mt-6">
        <Link
          to={ROUTES.LOGIN}
          className="inline-flex items-center gap-1 text-primary font-medium hover:text-primary-dark transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>
      </p>
    </AuthLayout>
  )
}
