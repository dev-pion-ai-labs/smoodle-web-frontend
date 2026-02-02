import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Mail, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { verifyOTP, resendOTP } from '@services/authService'
import { ROUTES } from '@utils/constants'
import AuthLayout from '@components/auth/AuthLayout'
import OTPInput from '@components/auth/OTPInput'
import Button from '@components/common/Button'

export default function VerifyOTP() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || ''

  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState('')
  const [cooldown, setCooldown] = useState(0)

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      toast.error('Please sign up first')
      navigate(ROUTES.SIGNUP, { replace: true })
    }
  }, [email, navigate])

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  const handleOTPComplete = async (code) => {
    setError('')
    setIsLoading(true)
    try {
      await verifyOTP(email, code)
      toast.success('Email verified successfully!')
      navigate(ROUTES.LOGIN, { replace: true })
    } catch (err) {
      setError(err)
      setOtp('') // Clear OTP on error
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (cooldown > 0) return

    setIsResending(true)
    setError('')
    try {
      await resendOTP(email)
      toast.success('OTP sent to your email')
      setCooldown(60) // 60 second cooldown
      setOtp('') // Clear current OTP
    } catch (err) {
      toast.error(err)
    } finally {
      setIsResending(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (otp.length === 6) {
      handleOTPComplete(otp)
    }
  }

  if (!email) return null

  return (
    <AuthLayout
      title="Verify your email"
      subtitle="We sent a 6-digit code to your email"
    >
      {/* Email display */}
      <div className="flex items-center justify-center gap-2 mb-8 p-3 bg-gray/5 rounded-xl">
        <Mail className="w-5 h-5 text-primary" />
        <span className="font-medium text-dark">{email}</span>
      </div>

      {/* OTP Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <OTPInput
          value={otp}
          onChange={setOtp}
          onComplete={handleOTPComplete}
          error={error}
          disabled={isLoading}
        />

        <Button
          type="submit"
          fullWidth
          loading={isLoading}
          disabled={otp.length !== 6}
        >
          Verify Email
        </Button>
      </form>

      {/* Resend OTP */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray mb-2">Didn't receive the code?</p>
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || isResending}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark disabled:text-gray disabled:cursor-not-allowed transition-colors"
        >
          {isResending ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Sending...
            </>
          ) : cooldown > 0 ? (
            `Resend in ${cooldown}s`
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Resend OTP
            </>
          )}
        </button>
      </div>

      {/* Back to signup */}
      <p className="text-center text-sm text-gray mt-6">
        Wrong email?{' '}
        <Link
          to={ROUTES.SIGNUP}
          className="text-primary font-medium hover:text-primary-dark transition-colors"
        >
          Sign up again
        </Link>
      </p>
    </AuthLayout>
  )
}
