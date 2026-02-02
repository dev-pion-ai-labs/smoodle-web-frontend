import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp, History, RotateCcw, Coins } from 'lucide-react'
import { cn } from '@utils/cn'
import { ROUTES, CREDIT_COSTS } from '@utils/constants'
import { formatDateTime } from '@utils/helpers'
import ScoreGauge from '@components/common/ScoreGauge'
import { VerdictBadge, ConfidenceBadge } from '@components/common/Badge'
import Button from '@components/common/Button'
import Card from '@components/common/Card'

/**
 * VerificationResult - Displays the verification result with animated score gauge
 * This is the "magic moment" UI - make it beautiful!
 */
export default function VerificationResult({
  result,
  onReset,
  className,
}) {
  const [detailsOpen, setDetailsOpen] = useState(false)

  if (!result) return null

  const {
    id,
    content_type,
    ai_score,
    human_score,
    verdict,
    confidence,
    details,
    credits_used,
    created_at,
  } = result

  // Calculate display score (AI probability as percentage)
  // Backend returns human_score as 0-100 integer, convert to 0-1 scale
  const humanScoreNormalized = (human_score ?? 50) / 100
  const aiProbability = ai_score ?? (1 - humanScoreNormalized)

  return (
    <Card
      className={cn(
        'animate-in fade-in slide-in-from-right-4 duration-500',
        className
      )}
    >
      {/* Main result section */}
      <div className="text-center">
        {/* Score Gauge - The hero element */}
        <div className="mb-6">
          <ScoreGauge
            score={aiProbability}
            size="xl"
            animate={true}
            label="AI Probability"
          />
        </div>

        {/* Verdict */}
        <div className="mb-4">
          <VerdictBadge verdict={verdict} className="text-base px-4 py-2" />
        </div>

        {/* Confidence */}
        <div className="mb-6">
          <ConfidenceBadge confidence={confidence} />
        </div>

        {/* Credits used */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray/5 rounded-full text-sm text-gray mb-6">
          <Coins className="w-4 h-4" />
          <span>
            {credits_used ?? CREDIT_COSTS[content_type] ?? 1} credit{credits_used !== 1 ? 's' : ''} used
          </span>
        </div>
      </div>

      {/* Details accordion */}
      {details && Object.keys(details).length > 0 && (
        <div className="border-t border-gray/10 pt-4 mt-4">
          <button
            onClick={() => setDetailsOpen(!detailsOpen)}
            className="flex items-center justify-between w-full text-sm font-medium text-dark hover:text-primary transition-colors"
          >
            <span>View Details</span>
            {detailsOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {detailsOpen && (
            <div className="mt-4 p-4 bg-gray/5 rounded-xl text-sm animate-in fade-in slide-in-from-top-2 duration-200">
              <pre className="whitespace-pre-wrap text-gray font-mono text-xs overflow-auto max-h-48">
                {JSON.stringify(details, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Timestamp */}
      {created_at && (
        <p className="text-xs text-gray text-center mt-4">
          Verified {formatDateTime(created_at)}
        </p>
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-gray/10">
        <Button
          variant="primary"
          fullWidth
          icon={RotateCcw}
          onClick={onReset}
        >
          Verify Another
        </Button>

        <Link to={ROUTES.HISTORY} className="flex-1">
          <Button
            variant="outline"
            fullWidth
            icon={History}
          >
            View History
          </Button>
        </Link>
      </div>
    </Card>
  )
}

/**
 * Compact result card for history/sidebar
 */
export function VerificationResultCompact({
  result,
  onClick,
  className,
}) {
  const { content_type, ai_score, human_score, verdict, created_at } = result
  // Backend returns human_score as 0-100 integer, convert to 0-1 scale
  const humanScoreNormalized = (human_score ?? 50) / 100
  const aiProbability = ai_score ?? (1 - humanScoreNormalized)

  // Content type icons mapping
  const typeLabels = {
    text: 'Text',
    image: 'Image',
    audio: 'Audio',
    video: 'Video',
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl',
        'bg-white border border-gray/10',
        'hover:border-primary/30 hover:shadow-sm',
        'cursor-pointer transition-all duration-200',
        className
      )}
    >
      {/* Score indicator */}
      <div
        className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center font-mono text-sm font-bold',
          aiProbability >= 0.7
            ? 'bg-error/10 text-error'
            : aiProbability >= 0.3
            ? 'bg-warning/10 text-warning'
            : 'bg-success/10 text-success'
        )}
      >
        {Math.round(aiProbability * 100)}%
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-dark truncate">
          {typeLabels[content_type] || content_type} verification
        </p>
        <p className="text-xs text-gray">
          {formatDateTime(created_at)}
        </p>
      </div>

      {/* Verdict badge */}
      <VerdictBadge verdict={verdict} />
    </div>
  )
}
