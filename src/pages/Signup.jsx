import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Lock, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { signupSchema } from '@utils/validators'
import { signup } from '@services/authService'
import { ROUTES } from '@utils/constants'
import AuthLayout from '@components/auth/AuthLayout'
import GoogleAuthButton, { AuthDivider } from '@components/auth/GoogleAuthButton'
import Input from '@components/common/Input'
import Button from '@components/common/Button'

export default function Signup() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      full_name: '',
      email: '',
      password: '',
      confirm_password: '',
    },
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await signup(data.email, data.password, data.full_name)
      toast.success('Account created! Please verify your email.')
      // Navigate to OTP verification with email
      navigate(ROUTES.VERIFY_OTP, { state: { email: data.email } })
    } catch (error) {
      toast.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start verifying AI content in seconds"
    >
      {/* Google OAuth */}
      <GoogleAuthButton text="Sign up with Google" />

      <AuthDivider />

      {/* Signup Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          placeholder="John Doe"
          icon={User}
          error={errors.full_name?.message}
          {...register('full_name')}
        />

        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          icon={Mail}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Password"
          type="password"
          placeholder="Min. 8 characters"
          icon={Lock}
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label="Confirm Password"
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
          Create Account
        </Button>
      </form>

      {/* Login link */}
      <p className="text-center text-sm text-gray mt-6">
        Already have an account?{' '}
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
