import { useEffect, useState } from 'react'
import { cn } from '@utils/cn'

/**
 * ScoreGauge - Animated circular progress indicator for AI/Human score
 * This is the HERO component - the visual centerpiece of verification results
 *
 * @param {number} score - AI probability score (0-1)
 * @param {string} size - 'sm' | 'md' | 'lg' | 'xl'
 * @param {boolean} animate - Enable entrance animation
 * @param {boolean} showLabel - Show "AI Score" label
 * @param {string} label - Custom label text
 */

const sizes = {
  sm: { width: 80, strokeWidth: 6, fontSize: 'text-lg', labelSize: 'text-xs' },
  md: { width: 120, strokeWidth: 8, fontSize: 'text-2xl', labelSize: 'text-xs' },
  lg: { width: 160, strokeWidth: 10, fontSize: 'text-3xl', labelSize: 'text-sm' },
  xl: { width: 200, strokeWidth: 12, fontSize: 'text-4xl', labelSize: 'text-sm' },
}

// Get color based on AI score (higher = more likely AI)
function getScoreColor(score) {
  if (score >= 0.7) return { stroke: '#EF4444', text: 'text-error', bg: 'bg-error/10' } // Red - AI
  if (score >= 0.3) return { stroke: '#F59E0B', text: 'text-warning', bg: 'bg-warning/10' } // Amber - Mixed
  return { stroke: '#10B981', text: 'text-success', bg: 'bg-success/10' } // Green - Human
}

// Get gradient ID for unique SVG gradients
let gradientId = 0
function getGradientId() {
  return `score-gradient-${++gradientId}`
}

export default function ScoreGauge({
  score = 0,
  size = 'lg',
  animate = true,
  showLabel = true,
  label = 'AI Probability',
  className,
}) {
  const [animatedScore, setAnimatedScore] = useState(animate ? 0 : score)
  const [isVisible, setIsVisible] = useState(!animate)

  const config = sizes[size]
  const radius = (config.width - config.strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const colors = getScoreColor(score)
  const gId = getGradientId()

  // Animate the score on mount
  useEffect(() => {
    if (!animate) {
      setAnimatedScore(score)
      setIsVisible(true)
      return
    }

    // Small delay before starting animation
    const showTimer = setTimeout(() => setIsVisible(true), 100)

    // Animate the score value
    const startTime = Date.now()
    const duration = 1200 // 1.2 seconds
    const startValue = 0
    const endValue = score

    const animateValue = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function (ease-out cubic)
      const eased = 1 - Math.pow(1 - progress, 3)

      setAnimatedScore(startValue + (endValue - startValue) * eased)

      if (progress < 1) {
        requestAnimationFrame(animateValue)
      }
    }

    const animationTimer = setTimeout(() => {
      requestAnimationFrame(animateValue)
    }, 200)

    return () => {
      clearTimeout(showTimer)
      clearTimeout(animationTimer)
    }
  }, [score, animate])

  // Calculate stroke offset for the progress arc
  const strokeDashoffset = circumference * (1 - animatedScore)
  const percentage = Math.round(animatedScore * 100)

  return (
    <div
      className={cn(
        'inline-flex flex-col items-center',
        'transition-all duration-500',
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
        className
      )}
    >
      {/* SVG Gauge */}
      <div className="relative">
        <svg
          width={config.width}
          height={config.width}
          className="transform -rotate-90"
        >
          {/* Gradient definition */}
          <defs>
            <linearGradient id={gId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={colors.stroke} stopOpacity="0.8" />
              <stop offset="100%" stopColor={colors.stroke} stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* Background circle */}
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={config.strokeWidth}
            className="text-gray/10"
          />

          {/* Progress arc */}
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gId})`}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-300 ease-out"
            style={{
              filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.1))',
            }}
          />
        </svg>

        {/* Center content */}
        <div
          className={cn(
            'absolute inset-0 flex flex-col items-center justify-center',
            'transform rotate-0' // Reset rotation for text
          )}
        >
          {/* Percentage */}
          <span
            className={cn(
              'font-mono font-bold tabular-nums',
              config.fontSize,
              colors.text
            )}
          >
            {percentage}%
          </span>

          {/* Mini label */}
          {size !== 'sm' && (
            <span className={cn('text-gray mt-0.5', config.labelSize)}>
              {score >= 0.7 ? 'AI' : score >= 0.3 ? 'Mixed' : 'Human'}
            </span>
          )}
        </div>
      </div>

      {/* Label below */}
      {showLabel && (
        <span className={cn('mt-3 text-gray font-medium', config.labelSize)}>
          {label}
        </span>
      )}
    </div>
  )
}

/**
 * Compact ScoreGauge variant - inline display
 */
export function ScoreGaugeInline({
  score = 0,
  className,
}) {
  const colors = getScoreColor(score)
  const percentage = Math.round(score * 100)

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full',
        colors.bg,
        className
      )}
    >
      {/* Mini progress bar */}
      <div className="w-12 h-1.5 bg-white/50 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            backgroundColor: colors.stroke,
          }}
        />
      </div>

      {/* Percentage */}
      <span
        className={cn('font-mono text-sm font-semibold', colors.text)}
      >
        {percentage}%
      </span>
    </div>
  )
}

/**
 * Score comparison display - shows AI vs Human scores side by side
 */
export function ScoreComparison({
  aiScore = 0,
  humanScore = 0,
  className,
}) {
  const aiPercentage = Math.round(aiScore * 100)
  const humanPercentage = Math.round(humanScore * 100)

  return (
    <div className={cn('space-y-3', className)}>
      {/* AI Score */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-dark">AI Generated</span>
          <span className="font-mono font-semibold text-error">
            {aiPercentage}%
          </span>
        </div>
        <div className="h-2 bg-gray/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-error rounded-full transition-all duration-700 ease-out"
            style={{ width: `${aiPercentage}%` }}
          />
        </div>
      </div>

      {/* Human Score */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-dark">Human Created</span>
          <span className="font-mono font-semibold text-success">
            {humanPercentage}%
          </span>
        </div>
        <div className="h-2 bg-gray/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-success rounded-full transition-all duration-700 ease-out"
            style={{ width: `${humanPercentage}%` }}
          />
        </div>
      </div>
    </div>
  )
}

/**
 * Minimal score display for history/lists
 */
export function ScorePill({ score = 0, className }) {
  const colors = getScoreColor(score)
  const percentage = Math.round(score * 100)

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center',
        'px-2 py-0.5 rounded-md',
        'font-mono text-xs font-semibold',
        colors.bg,
        colors.text,
        className
      )}
    >
      {percentage}%
    </span>
  )
}
