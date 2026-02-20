import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { History, FileText, Image, ScanFace, Music, Video, ChevronRight, RefreshCw } from 'lucide-react'
import { cn } from '@utils/cn'
import { ROUTES } from '@utils/constants'
import { getTimeAgo, truncateText } from '@utils/helpers'
import { getHistory } from '@services/verifyService'
import { useVerifyStore } from '@store/verifyStore'
import { Skeleton } from '@components/common/Loader'
import { ScorePill } from '@components/common/ScoreGauge'
import Card from '@components/common/Card'

const typeIcons = {
  text: FileText,
  image: Image,
  deepfake: ScanFace,
  video: Video,
  audio: Music,
}

/**
 * RecentVerifications - Sidebar showing last 5 verifications
 */
export default function RecentVerifications({ onViewDetails, className }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const history = useVerifyStore((state) => state.history)
  const setHistory = useVerifyStore((state) => state.setHistory)

  // Fetch recent history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true)
        const response = await getHistory(1, 5)
        // Backend returns { items, total, page, pages, limit }
        setHistory(response.items || [])
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    // Only fetch if history is empty
    if (history.length === 0) {
      fetchHistory()
    } else {
      setLoading(false)
    }
  }, [history.length, setHistory])

  const handleRefresh = async () => {
    try {
      setLoading(true)
      const response = await getHistory(1, 5)
      // Backend returns { items, total, page, pages, limit }
      setHistory(response.items || [])
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className={cn('p-0', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray/10">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          <h3 className="font-heading font-semibold text-dark">Recent</h3>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="p-1.5 rounded-lg text-gray hover:text-primary hover:bg-gray/5 transition-colors disabled:opacity-50"
          aria-label="Refresh"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
        </button>
      </div>

      {/* Content */}
      <div className="p-2">
        {loading ? (
          // Loading skeletons
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-2 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          // Error state
          <div className="p-4 text-center text-sm text-gray">
            Failed to load history
          </div>
        ) : history.length === 0 ? (
          // Empty state
          <div className="p-6 text-center">
            <div className="w-12 h-12 bg-gray/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <History className="w-6 h-6 text-gray" />
            </div>
            <p className="text-sm text-gray">No verifications yet</p>
          </div>
        ) : (
          // History list
          <div className="space-y-1">
            {history.slice(0, 5).map((item) => (
              <HistoryItem
                key={item.id}
                item={item}
                onClick={() => onViewDetails?.(item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {history.length > 0 && (
        <div className="p-2 border-t border-gray/10">
          <Link
            to={ROUTES.HISTORY}
            className="flex items-center justify-center gap-1 w-full p-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </Card>
  )
}

/**
 * Single history item
 */
function HistoryItem({ item, onClick }) {
  const Icon = typeIcons[item.content_type] || FileText
  // Backend returns human_score as 0-100 integer, convert to AI score (0-1)
  const humanScore = item.human_score ?? 50
  const aiScore = item.ai_score ?? (1 - humanScore / 100)

  // Get content preview
  const getPreview = () => {
    // Backend returns text_preview for text verifications (first 100 chars)
    if (item.content_type === 'text' && item.text_preview) {
      return truncateText(item.text_preview, 40)
    }
    if (item.file_url) {
      const fileName = item.file_url.split('/').pop()
      return truncateText(fileName, 30)
    }
    if (item.file_key) {
      const fileName = item.file_key.split('/').pop()
      return truncateText(fileName, 30)
    }
    return `${item.content_type} verification`
  }

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full p-2 rounded-lg text-left hover:bg-gray/5 transition-colors"
    >
      {/* Type icon */}
      <div className="w-8 h-8 rounded-lg bg-gray/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-gray" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-dark truncate">{getPreview()}</p>
        <p className="text-xs text-gray">{getTimeAgo(item.created_at)}</p>
      </div>

      {/* Score */}
      <ScorePill score={aiScore} />
    </button>
  )
}
