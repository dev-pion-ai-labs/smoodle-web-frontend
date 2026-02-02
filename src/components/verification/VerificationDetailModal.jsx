import { useState } from 'react'
import {
  FileText,
  Image,
  Mic,
  Video,
  ChevronDown,
  ChevronUp,
  Coins,
  Calendar,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@utils/cn'
import { formatDateTime, truncateText } from '@utils/helpers'
import { CREDIT_COSTS } from '@utils/constants'
import Modal from '@components/common/Modal'
import ScoreGauge from '@components/common/ScoreGauge'
import { VerdictBadge, ConfidenceBadge } from '@components/common/Badge'

const typeIcons = {
  text: FileText,
  image: Image,
  audio: Mic,
  video: Video,
}

const typeLabels = {
  text: 'Text',
  image: 'Image',
  audio: 'Audio',
  video: 'Video',
}

/**
 * VerificationDetailModal - Shows full details of a verification
 */
export default function VerificationDetailModal({ isOpen, onClose, item }) {
  const [detailsOpen, setDetailsOpen] = useState(false)

  if (!item) return null

  const {
    id,
    content_type,
    ai_score,
    human_score,
    verdict,
    confidence,
    confidence_score,
    details,
    credits_used,
    created_at,
    text_content,
    text_preview,
    file_url,
  } = item

  const Icon = typeIcons[content_type] || FileText
  // Backend returns human_score as 0-100 integer
  const humanScoreNormalized = (human_score ?? 50) / 100
  const aiProbability = ai_score ?? (1 - humanScoreNormalized)
  // Use confidence_score from backend if available
  const confidenceLevel = confidence || (confidence_score >= 0.9 ? 'high' : confidence_score >= 0.7 ? 'medium' : 'low')

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gray/10 flex items-center justify-center">
          <Icon className="w-6 h-6 text-gray" />
        </div>
        <div>
          <h2 className="font-heading font-bold text-dark">
            {typeLabels[content_type]} Verification
          </h2>
          <p className="text-sm text-gray">
            {formatDateTime(created_at)}
          </p>
        </div>
      </div>

      {/* Score Gauge */}
      <div className="flex justify-center mb-6">
        <ScoreGauge
          score={aiProbability}
          size="lg"
          animate={false}
          label="AI Probability"
        />
      </div>

      {/* Verdict & Confidence */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <VerdictBadge verdict={verdict} className="text-base px-4 py-2" />
        <ConfidenceBadge confidence={confidenceLevel} />
      </div>

      {/* Content Preview */}
      {content_type === 'text' && (text_content || text_preview) && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-dark mb-2">Content</h3>
          <div className="p-4 bg-gray/5 rounded-xl max-h-48 overflow-y-auto">
            <p className="text-sm text-gray whitespace-pre-wrap">
              {text_content || text_preview}
            </p>
          </div>
        </div>
      )}

      {/* File Preview */}
      {file_url && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-dark mb-2">File</h3>
          <div className="p-4 bg-gray/5 rounded-xl">
            {content_type === 'image' ? (
              <div className="space-y-3">
                <img
                  src={file_url}
                  alt="Verified content"
                  className="max-h-48 rounded-lg mx-auto"
                />
                <a
                  href={file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1 text-sm text-primary hover:underline"
                >
                  View Full Image
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Icon className="w-8 h-8 text-gray" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-dark truncate">
                    {file_url.split('/').pop()}
                  </p>
                  <a
                    href={file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    Open File
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center gap-2 p-3 bg-gray/5 rounded-xl">
          <Coins className="w-4 h-4 text-gray" />
          <div>
            <p className="text-xs text-gray">Credits Used</p>
            <p className="text-sm font-medium text-dark">
              {credits_used ?? CREDIT_COSTS[content_type] ?? 1}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 bg-gray/5 rounded-xl">
          <Calendar className="w-4 h-4 text-gray" />
          <div>
            <p className="text-xs text-gray">Verified On</p>
            <p className="text-sm font-medium text-dark">
              {new Date(created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Details Accordion */}
      {details && Object.keys(details).length > 0 && (
        <div className="border-t border-gray/10 pt-4">
          <button
            onClick={() => setDetailsOpen(!detailsOpen)}
            className="flex items-center justify-between w-full text-sm font-medium text-dark hover:text-primary transition-colors"
          >
            <span>Technical Details</span>
            {detailsOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {detailsOpen && (
            <div className="mt-4 p-4 bg-gray/5 rounded-xl animate-in fade-in slide-in-from-top-2 duration-200">
              <pre className="whitespace-pre-wrap text-gray font-mono text-xs overflow-auto max-h-48">
                {JSON.stringify(details, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
