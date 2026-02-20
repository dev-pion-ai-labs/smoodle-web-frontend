import { useEffect, useState } from 'react'
import {
  History as HistoryIcon,
  FileText,
  Image,
  ScanFace,
  Video,
  Music,
  Filter,
  ArrowUpDown,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@utils/cn'
import { getTimeAgo, formatDateTime, truncateText } from '@utils/helpers'
import { getHistory, deleteVerification } from '@services/verifyService'
import { useVerifyStore } from '@store/verifyStore'
import DashboardLayout from '@components/layout/DashboardLayout'
import Card from '@components/common/Card'
import Button from '@components/common/Button'
import { Select } from '@components/common/Input'
import { Skeleton, SkeletonCard } from '@components/common/Loader'
import { VerdictBadge } from '@components/common/Badge'
import { ScorePill } from '@components/common/ScoreGauge'
import { ConfirmModal } from '@components/common/Modal'
import VerificationDetailModal from '@components/verification/VerificationDetailModal'
import toast from 'react-hot-toast'

const typeIcons = {
  text: FileText,
  image: Image,
  deepfake: ScanFace,
  video: Video,
  audio: Music,
}

const typeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'text', label: 'Text' },
  { value: 'image', label: 'Image' },
  { value: 'deepfake', label: 'Deepfake' },
  { value: 'video', label: 'Video' },
  { value: 'audio', label: 'Music' },
]

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
]

export default function History() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  // Filters
  const [typeFilter, setTypeFilter] = useState('all')
  const [sortOrder, setSortOrder] = useState('newest')

  // Modals
  const [selectedItem, setSelectedItem] = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Update document title
  useEffect(() => {
    document.title = 'Verification History | Smoodle Verified'
  }, [])

  // Fetch history
  useEffect(() => {
    fetchHistory()
  }, [pagination.page, typeFilter, sortOrder])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getHistory(
        pagination.page,
        pagination.limit,
        typeFilter === 'all' ? null : typeFilter
      )

      // Backend returns { items, total, page, pages, limit }
      let items = response.items || []

      // Sort client-side (API may not support sort)
      if (sortOrder === 'oldest') {
        items = [...items].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      }

      setData(items)
      setPagination((prev) => ({
        ...prev,
        total: response.total || items.length,
        totalPages: response.pages || Math.ceil((response.total || items.length) / prev.limit),
      }))
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }))
    }
  }

  const handleDelete = async () => {
    if (!deleteItem) return

    try {
      setDeleting(true)
      await deleteVerification(deleteItem.id)
      toast.success('Verification deleted')
      setDeleteItem(null)
      fetchHistory() // Refresh list
    } catch (err) {
      toast.error(err || 'Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  const getContentPreview = (item) => {
    // Backend returns text_preview for text verifications (first 100 chars)
    if (item.content_type === 'text' && item.text_preview) {
      return truncateText(item.text_preview, 60)
    }
    if (item.file_url) {
      const fileName = item.file_url.split('/').pop()
      return truncateText(fileName, 40)
    }
    if (item.file_key) {
      const fileName = item.file_key.split('/').pop()
      return truncateText(fileName, 40)
    }
    return `${item.content_type} verification`
  }

  return (
    <DashboardLayout>
      <div className="page-enter">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-heading text-2xl font-bold text-dark">
              Verification History
            </h1>
            <p className="text-gray mt-1">
              View and manage your past verifications
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Type Filter */}
            <div className="flex-1 sm:max-w-[200px]">
              <Select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value)
                  setPagination((prev) => ({ ...prev, page: 1 }))
                }}
                icon={Filter}
              >
                {typeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Sort Order */}
            <div className="flex-1 sm:max-w-[200px]">
              <Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                icon={ArrowUpDown}
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex-1" />

            {/* Result count */}
            {!loading && (
              <div className="flex items-center text-sm text-gray">
                {pagination.total} verification{pagination.total !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </Card>

        {/* Content */}
        {loading ? (
          // Loading state
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          // Error state
          <Card className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
            <h3 className="font-heading font-semibold text-dark mb-2">
              Failed to load history
            </h3>
            <p className="text-gray mb-4">{error}</p>
            <Button onClick={fetchHistory}>Try Again</Button>
          </Card>
        ) : data.length === 0 ? (
          // Empty state
          <Card className="text-center py-12">
            <div className="w-16 h-16 bg-gray/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <HistoryIcon className="w-8 h-8 text-gray" />
            </div>
            <h3 className="font-heading font-semibold text-dark mb-2">
              No verifications yet
            </h3>
            <p className="text-gray mb-4">
              Start verifying content to see your history here.
            </p>
            <Button as="link" to="/dashboard">
              Verify Content
            </Button>
          </Card>
        ) : (
          <>
            {/* History List */}
            <div className="space-y-3">
              {data.map((item) => (
                <HistoryCard
                  key={item.id}
                  item={item}
                  preview={getContentPreview(item)}
                  onView={() => setSelectedItem(item)}
                  onDelete={() => setDeleteItem(item)}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  icon={ChevronLeft}
                >
                  Previous
                </Button>

                <span className="px-4 py-2 text-sm text-gray">
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      <VerificationDetailModal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        item={selectedItem}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        title="Delete Verification"
        message="Are you sure you want to delete this verification? This action cannot be undone."
        confirmText="Delete"
        confirmVariant="danger"
        loading={deleting}
      />
    </DashboardLayout>
  )
}

/**
 * History card component
 */
function HistoryCard({ item, preview, onView, onDelete }) {
  const Icon = typeIcons[item.content_type] || FileText
  // Backend returns human_score as 0-100 integer, convert to AI score (0-1)
  const humanScore = item.human_score ?? 50
  const aiScore = item.ai_score ?? (1 - humanScore / 100)

  return (
    <Card
      className="hover:border-primary/30 cursor-pointer transition-all"
      onClick={onView}
    >
      <div className="flex items-center gap-4">
        {/* Type Icon */}
        <div className="w-12 h-12 rounded-xl bg-gray/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-6 h-6 text-gray" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-dark font-medium truncate">{preview}</p>
          <p className="text-sm text-gray">{formatDateTime(item.created_at)}</p>
        </div>

        {/* Score */}
        <div className="hidden sm:block">
          <ScorePill score={aiScore} />
        </div>

        {/* Verdict */}
        <div className="hidden md:block">
          <VerdictBadge verdict={item.verdict} />
        </div>

        {/* Delete button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="p-2 rounded-lg text-gray hover:text-error hover:bg-error/10 transition-colors"
          aria-label="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile: Score and Verdict */}
      <div className="flex items-center gap-3 mt-3 sm:hidden">
        <ScorePill score={aiScore} />
        <VerdictBadge verdict={item.verdict} />
      </div>
    </Card>
  )
}
