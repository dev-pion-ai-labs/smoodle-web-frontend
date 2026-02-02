import { forwardRef } from 'react'
import { cn } from '@utils/cn'
import { Spinner } from './Loader'

/**
 * Button component with variants, sizes, and loading state
 *
 * @param {string} variant - 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {boolean} loading - Show loading spinner
 * @param {boolean} disabled - Disable button
 * @param {React.ComponentType} icon - Icon component to show
 * @param {string} iconPosition - 'left' | 'right'
 * @param {boolean} fullWidth - Full width button
 */

const variants = {
  primary: [
    'bg-primary text-white',
    'hover:bg-primary-dark',
    'focus:ring-2 focus:ring-primary focus:ring-offset-2',
    'shadow-md hover:shadow-lg',
  ].join(' '),
  secondary: [
    'bg-dark text-white',
    'hover:bg-dark/90',
    'focus:ring-2 focus:ring-dark focus:ring-offset-2',
    'shadow-md hover:shadow-lg',
  ].join(' '),
  outline: [
    'bg-white text-dark border-2 border-gray/20',
    'hover:border-primary hover:text-primary',
    'focus:ring-2 focus:ring-primary focus:ring-offset-2',
    'shadow-sm hover:shadow-md',
  ].join(' '),
  danger: [
    'bg-error text-white',
    'hover:bg-error/90',
    'focus:ring-2 focus:ring-error focus:ring-offset-2',
    'shadow-md hover:shadow-lg',
  ].join(' '),
  ghost: [
    'bg-transparent text-gray',
    'hover:bg-gray/10 hover:text-dark',
    'focus:ring-2 focus:ring-gray/20',
  ].join(' '),
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5',
}

const iconSizes = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
}

const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    icon: Icon,
    iconPosition = 'left',
    fullWidth = false,
    className,
    type = 'button',
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      className={cn(
        // Base styles
        'inline-flex items-center justify-center font-medium rounded-xl',
        'transition-all duration-200 ease-out',
        'focus:outline-none',
        // Micro-interactions
        'hover:scale-[0.98] active:scale-95',
        // Variant styles
        variants[variant],
        // Size styles
        sizes[size],
        // Full width
        fullWidth && 'w-full',
        // Disabled state
        isDisabled && 'opacity-50 cursor-not-allowed hover:scale-100 active:scale-100',
        className
      )}
      {...props}
    >
      {/* Loading spinner */}
      {loading && (
        <Spinner
          size="sm"
          className={cn(
            'border-current border-t-transparent',
            iconSizes[size]
          )}
        />
      )}

      {/* Left icon */}
      {!loading && Icon && iconPosition === 'left' && (
        <Icon className={iconSizes[size]} />
      )}

      {/* Button text */}
      {children && <span>{children}</span>}

      {/* Right icon */}
      {!loading && Icon && iconPosition === 'right' && (
        <Icon className={iconSizes[size]} />
      )}
    </button>
  )
})

export default Button

// Icon-only button variant
export const IconButton = forwardRef(function IconButton(
  {
    icon: Icon,
    variant = 'ghost',
    size = 'md',
    label,
    className,
    ...props
  },
  ref
) {
  const iconButtonSizes = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
  }

  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      className={cn(
        'inline-flex items-center justify-center rounded-lg',
        'transition-all duration-200 ease-out',
        'focus:outline-none focus:ring-2 focus:ring-primary/50',
        'hover:scale-[0.95] active:scale-90',
        variant === 'ghost' && 'hover:bg-gray/10',
        variant === 'primary' && 'bg-primary text-white hover:bg-primary-dark',
        iconButtonSizes[size],
        className
      )}
      {...props}
    >
      <Icon className={iconSizes[size]} />
    </button>
  )
})
