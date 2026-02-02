import { forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@utils/cn'

/**
 * Input component with label, error message, icon support, and password toggle
 *
 * @param {string} label - Input label
 * @param {string} error - Error message to display
 * @param {React.ComponentType} icon - Icon component to show on the left
 * @param {string} type - Input type (text, email, password, etc.)
 * @param {string} helperText - Helper text below input
 * @param {boolean} fullWidth - Full width input
 */

const Input = forwardRef(function Input(
  {
    label,
    error,
    icon: Icon,
    type = 'text',
    helperText,
    fullWidth = true,
    className,
    containerClassName,
    ...props
  },
  ref
) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div className={cn('space-y-1.5', fullWidth && 'w-full', containerClassName)}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-dark">
          {label}
        </label>
      )}

      {/* Input wrapper */}
      <div className="relative">
        {/* Left icon */}
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon className="w-5 h-5 text-gray" />
          </div>
        )}

        {/* Input field */}
        <input
          ref={ref}
          type={inputType}
          className={cn(
            // Base styles
            'w-full px-4 py-2.5 rounded-xl border text-sm',
            'bg-white text-dark placeholder:text-gray/50',
            'transition-all duration-200 ease-out',
            // Focus styles
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary',
            // Hover styles
            'hover:border-gray/40',
            // Error styles
            error
              ? 'border-error focus:ring-error focus:border-error'
              : 'border-gray/20',
            // With left icon
            Icon && 'pl-10',
            // With password toggle
            isPassword && 'pr-10',
            className
          )}
          {...props}
        />

        {/* Password toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray hover:text-dark transition-colors focus:outline-none"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-error animate-in fade-in slide-in-from-top-1 duration-200">
          {error}
        </p>
      )}

      {/* Helper text */}
      {helperText && !error && (
        <p className="text-sm text-gray">{helperText}</p>
      )}
    </div>
  )
})

export default Input

/**
 * Textarea variant
 */
export const Textarea = forwardRef(function Textarea(
  {
    label,
    error,
    helperText,
    fullWidth = true,
    rows = 4,
    className,
    containerClassName,
    ...props
  },
  ref
) {
  return (
    <div className={cn('space-y-1.5', fullWidth && 'w-full', containerClassName)}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-dark">
          {label}
        </label>
      )}

      {/* Textarea */}
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          // Base styles
          'w-full px-4 py-3 rounded-xl border text-sm',
          'bg-white text-dark placeholder:text-gray/50',
          'transition-all duration-200 ease-out resize-none',
          // Focus styles
          'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary',
          // Hover styles
          'hover:border-gray/40',
          // Error styles
          error
            ? 'border-error focus:ring-error focus:border-error'
            : 'border-gray/20',
          className
        )}
        {...props}
      />

      {/* Error message */}
      {error && (
        <p className="text-sm text-error animate-in fade-in slide-in-from-top-1 duration-200">
          {error}
        </p>
      )}

      {/* Helper text */}
      {helperText && !error && (
        <p className="text-sm text-gray">{helperText}</p>
      )}
    </div>
  )
})

/**
 * Select variant
 */
export const Select = forwardRef(function Select(
  {
    label,
    error,
    options = [],
    placeholder = 'Select an option',
    fullWidth = true,
    className,
    containerClassName,
    ...props
  },
  ref
) {
  return (
    <div className={cn('space-y-1.5', fullWidth && 'w-full', containerClassName)}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-dark">
          {label}
        </label>
      )}

      {/* Select */}
      <select
        ref={ref}
        className={cn(
          // Base styles
          'w-full px-4 py-2.5 rounded-xl border text-sm',
          'bg-white text-dark',
          'transition-all duration-200 ease-out',
          'cursor-pointer appearance-none',
          // Focus styles
          'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary',
          // Hover styles
          'hover:border-gray/40',
          // Error styles
          error
            ? 'border-error focus:ring-error focus:border-error'
            : 'border-gray/20',
          // Background arrow
          'bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236B7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")]',
          'bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10',
          className
        )}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>

      {/* Error message */}
      {error && (
        <p className="text-sm text-error animate-in fade-in slide-in-from-top-1 duration-200">
          {error}
        </p>
      )}
    </div>
  )
})
