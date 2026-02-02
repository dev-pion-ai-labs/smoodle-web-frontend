import { cn } from '@utils/cn'

/**
 * Loader component with multiple variants
 * - spinner: Animated spinning circle
 * - skeleton: Shimmering placeholder blocks
 * - dots: Animated bouncing dots
 */

// Spinner sizes
const sizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-3',
  lg: 'w-12 h-12 border-4',
  xl: 'w-16 h-16 border-4',
}

// Spinner component
function Spinner({ size = 'md', className }) {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-primary border-t-transparent',
        sizes[size],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

// Full page loader
function PageLoader({ message = 'Loading...' }) {
  return (
    <div className="fixed inset-0 bg-light flex flex-col items-center justify-center z-50">
      <Spinner size="xl" />
      <p className="mt-4 text-gray font-medium animate-pulse">{message}</p>
    </div>
  )
}

// Inline loader (for buttons, etc.)
function InlineLoader({ size = 'sm', className }) {
  return <Spinner size={size} className={className} />
}

// Skeleton block
function Skeleton({ className, animate = true }) {
  return (
    <div
      className={cn(
        'bg-gray/10 rounded-lg',
        animate && 'skeleton',
        className
      )}
    />
  )
}

// Skeleton variants for common patterns
function SkeletonText({ lines = 3, className }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  )
}

function SkeletonCard({ className }) {
  return (
    <div className={cn('bg-white rounded-xl p-6 shadow-sm', className)}>
      <Skeleton className="h-6 w-1/3 mb-4" />
      <SkeletonText lines={3} />
      <div className="flex gap-2 mt-4">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  )
}

function SkeletonAvatar({ size = 'md', className }) {
  const avatarSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }
  return (
    <Skeleton className={cn('rounded-full', avatarSizes[size], className)} />
  )
}

function SkeletonTable({ rows = 5, cols = 4, className }) {
  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex gap-4 pb-2 border-b border-gray/10">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

// Dots loader (alternative style)
function DotsLoader({ className }) {
  return (
    <div className={cn('flex gap-1', className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 bg-primary rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  )
}

// Main Loader export - default is PageLoader
export default function Loader({ variant = 'page', ...props }) {
  switch (variant) {
    case 'spinner':
      return <Spinner {...props} />
    case 'inline':
      return <InlineLoader {...props} />
    case 'skeleton':
      return <Skeleton {...props} />
    case 'dots':
      return <DotsLoader {...props} />
    case 'page':
    default:
      return <PageLoader {...props} />
  }
}

// Named exports for specific use
export {
  Spinner,
  PageLoader,
  InlineLoader,
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonAvatar,
  SkeletonTable,
  DotsLoader,
}
