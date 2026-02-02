import { cn } from '@utils/cn'

/**
 * Badge component for displaying status labels and tags
 *
 * @param {string} variant - 'success' | 'warning' | 'error' | 'info' | 'default' | 'primary'
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {boolean} dot - Show status dot
 * @param {boolean} pill - Use pill shape (more rounded)
 */

const variants = {
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  error: 'bg-error/10 text-error border-error/20',
  info: 'bg-blue-100 text-blue-700 border-blue-200',
  default: 'bg-gray/10 text-gray border-gray/20',
  primary: 'bg-primary/10 text-primary border-primary/20',
}

const dotColors = {
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
  info: 'bg-blue-500',
  default: 'bg-gray',
  primary: 'bg-primary',
}

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
}

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  pill = false,
  className,
  ...props
}) {
  return (
    <span
      className={cn(
        // Base styles
        'inline-flex items-center gap-1.5 font-medium border',
        'transition-colors duration-200',
        // Shape
        pill ? 'rounded-full' : 'rounded-lg',
        // Variant
        variants[variant],
        // Size
        sizes[size],
        className
      )}
      {...props}
    >
      {/* Status dot */}
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            dotColors[variant]
          )}
        />
      )}
      {children}
    </span>
  )
}

/**
 * Verdict Badge - Pre-styled badge for verification verdicts
 */
export function VerdictBadge({ verdict, className }) {
  const verdictConfig = {
    ai_generated: {
      variant: 'error',
      label: 'AI Generated',
    },
    human_created: {
      variant: 'success',
      label: 'Human Created',
    },
    mixed: {
      variant: 'warning',
      label: 'Mixed',
    },
    inconclusive: {
      variant: 'default',
      label: 'Inconclusive',
    },
  }

  const config = verdictConfig[verdict] || verdictConfig.inconclusive

  return (
    <Badge
      variant={config.variant}
      size="md"
      dot
      pill
      className={className}
    >
      {config.label}
    </Badge>
  )
}

/**
 * Content Type Badge - For text/image/audio/video
 */
export function ContentTypeBadge({ type, className }) {
  const typeConfig = {
    text: { variant: 'primary', label: 'Text' },
    image: { variant: 'info', label: 'Image' },
    audio: { variant: 'warning', label: 'Audio' },
    video: { variant: 'error', label: 'Video' },
  }

  const config = typeConfig[type] || { variant: 'default', label: type }

  return (
    <Badge variant={config.variant} size="sm" className={className}>
      {config.label}
    </Badge>
  )
}

/**
 * Confidence Badge - For high/medium/low confidence
 */
export function ConfidenceBadge({ confidence, className }) {
  const confidenceConfig = {
    high: { variant: 'success', label: 'High Confidence' },
    medium: { variant: 'warning', label: 'Medium Confidence' },
    low: { variant: 'error', label: 'Low Confidence' },
  }

  const config = confidenceConfig[confidence] || confidenceConfig.low

  return (
    <Badge variant={config.variant} size="sm" className={className}>
      {config.label}
    </Badge>
  )
}

/**
 * Plan Badge - For subscription plans
 */
export function PlanBadge({ plan, className }) {
  const planConfig = {
    free: { variant: 'default', label: 'Free' },
    pro: { variant: 'primary', label: 'Pro' },
    enterprise: { variant: 'success', label: 'Enterprise' },
  }

  const config = planConfig[plan] || planConfig.free

  return (
    <Badge variant={config.variant} size="sm" pill className={className}>
      {config.label}
    </Badge>
  )
}

/**
 * Status Badge - For payment/subscription status
 */
export function StatusBadge({ status, className }) {
  const statusConfig = {
    active: { variant: 'success', label: 'Active' },
    pending: { variant: 'warning', label: 'Pending' },
    cancelled: { variant: 'error', label: 'Cancelled' },
    expired: { variant: 'default', label: 'Expired' },
    failed: { variant: 'error', label: 'Failed' },
    success: { variant: 'success', label: 'Success' },
  }

  const config = statusConfig[status] || { variant: 'default', label: status }

  return (
    <Badge variant={config.variant} size="sm" dot className={className}>
      {config.label}
    </Badge>
  )
}
