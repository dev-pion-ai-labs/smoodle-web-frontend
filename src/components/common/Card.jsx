import { cn } from '@utils/cn'

/**
 * Card component with hover effects and variants
 *
 * @param {boolean} hoverable - Enable hover lift effect
 * @param {boolean} clickable - Style as clickable (cursor pointer)
 * @param {string} padding - 'none' | 'sm' | 'md' | 'lg'
 * @param {string} variant - 'default' | 'outlined' | 'elevated'
 */

const paddingSizes = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

const variants = {
  default: 'bg-white shadow-sm border border-gray/10',
  outlined: 'bg-white border-2 border-gray/20',
  elevated: 'bg-white shadow-lg',
  ghost: 'bg-gray/5',
}

export default function Card({
  children,
  hoverable = false,
  clickable = false,
  padding = 'md',
  variant = 'default',
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        // Base styles
        'rounded-xl transition-all duration-200',
        // Variant
        variants[variant],
        // Padding
        paddingSizes[padding],
        // Hover effects
        hoverable && [
          'hover:-translate-y-0.5',
          'hover:shadow-lg',
          'hover:border-gray/20',
        ],
        // Clickable
        clickable && 'cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Card Header
 */
export function CardHeader({ children, className, ...props }) {
  return (
    <div
      className={cn('pb-4 border-b border-gray/10', className)}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Card Title
 */
export function CardTitle({ children, className, ...props }) {
  return (
    <h3
      className={cn('font-heading font-semibold text-lg text-dark', className)}
      {...props}
    >
      {children}
    </h3>
  )
}

/**
 * Card Description
 */
export function CardDescription({ children, className, ...props }) {
  return (
    <p
      className={cn('text-sm text-gray mt-1', className)}
      {...props}
    >
      {children}
    </p>
  )
}

/**
 * Card Content
 */
export function CardContent({ children, className, ...props }) {
  return (
    <div className={cn('py-4', className)} {...props}>
      {children}
    </div>
  )
}

/**
 * Card Footer
 */
export function CardFooter({ children, className, ...props }) {
  return (
    <div
      className={cn('pt-4 border-t border-gray/10 flex items-center gap-2', className)}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Stats Card - Pre-styled card for displaying statistics
 */
export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  trendDirection = 'up',
  className,
}) {
  return (
    <Card className={cn('flex items-start gap-4', className)}>
      {Icon && (
        <div className="p-3 rounded-xl bg-primary/10">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray font-medium">{title}</p>
        <p className="font-heading text-2xl font-bold text-dark mt-1">
          {value}
        </p>
        {trend && (
          <p
            className={cn(
              'text-sm font-medium mt-1',
              trendDirection === 'up' ? 'text-success' : 'text-error'
            )}
          >
            {trendDirection === 'up' ? '↑' : '↓'} {trend}
          </p>
        )}
      </div>
    </Card>
  )
}
