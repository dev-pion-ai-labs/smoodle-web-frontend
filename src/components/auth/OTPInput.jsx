import { useRef, useState, useEffect } from 'react'
import { cn } from '@utils/cn'

/**
 * OTPInput - 6-digit OTP input with auto-focus
 * Auto-advances on input, handles backspace, paste
 */
export default function OTPInput({
  length = 6,
  value = '',
  onChange,
  onComplete,
  error,
  disabled = false,
  autoFocus = true,
}) {
  const [otp, setOtp] = useState(value.split('').slice(0, length))
  const inputRefs = useRef([])

  // Sync external value
  useEffect(() => {
    if (value !== otp.join('')) {
      setOtp(value.split('').slice(0, length))
    }
  }, [value, length])

  // Auto-focus first input on mount
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [autoFocus])

  const handleChange = (index, e) => {
    const inputValue = e.target.value

    // Handle paste
    if (inputValue.length > 1) {
      const pastedValue = inputValue.replace(/\D/g, '').slice(0, length)
      const newOtp = pastedValue.split('')
      setOtp(newOtp)
      onChange?.(newOtp.join(''))

      // Focus last filled input or first empty one
      const focusIndex = Math.min(pastedValue.length, length - 1)
      inputRefs.current[focusIndex]?.focus()

      // Check if complete
      if (newOtp.length === length) {
        onComplete?.(newOtp.join(''))
      }
      return
    }

    // Single character input
    const digit = inputValue.replace(/\D/g, '').slice(-1)
    const newOtp = [...otp]
    newOtp[index] = digit
    setOtp(newOtp)
    onChange?.(newOtp.join(''))

    // Auto-advance to next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    // Check if complete
    const fullOtp = newOtp.join('')
    if (fullOtp.length === length && !newOtp.includes('')) {
      onComplete?.(fullOtp)
    }
  }

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // If current is empty, go back and clear previous
        const newOtp = [...otp]
        newOtp[index - 1] = ''
        setOtp(newOtp)
        onChange?.(newOtp.join(''))
        inputRefs.current[index - 1]?.focus()
      } else {
        // Clear current
        const newOtp = [...otp]
        newOtp[index] = ''
        setOtp(newOtp)
        onChange?.(newOtp.join(''))
      }
    }

    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleFocus = (e) => {
    e.target.select()
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-center gap-2 sm:gap-3">
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={length} // Allow paste
            value={otp[index] || ''}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onFocus={handleFocus}
            disabled={disabled}
            className={cn(
              'w-11 h-14 sm:w-12 sm:h-16',
              'text-center text-xl sm:text-2xl font-mono font-bold',
              'border-2 rounded-xl',
              'bg-white text-dark',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error
                ? 'border-error focus:ring-error focus:border-error'
                : 'border-gray/20 hover:border-gray/40',
              otp[index] && 'border-primary/50 bg-primary/5'
            )}
            aria-label={`Digit ${index + 1}`}
          />
        ))}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-error text-center animate-in fade-in slide-in-from-top-1 duration-200">
          {error}
        </p>
      )}
    </div>
  )
}
