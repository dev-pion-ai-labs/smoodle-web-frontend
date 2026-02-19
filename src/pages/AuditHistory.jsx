import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  History as HistoryIcon,
  FileText,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  Clock,
} from 'lucide-react'
import { cn } from '@utils/cn'
import { ROUTES } from '@utils/constants'
import { formatDateTime } from '@utils/helpers'
import { getAuditHistory } from '@services/auditService'
import DashboardLayout from '@components/layout/DashboardLayout'
import Card from '@components/common/Card'
import Button from '@components/common/Button'
import Badge from '@components/common/Badge'
import { Select } from '@components/common/Input'
import { Skeleton, SkeletonCard } from '@components/common/Loader'

const verdictOptions = [
  { value: 'all', label: 'All Verdicts' },
  { value: 'verified', label: 'Verified' },
  { value: 'flagged', label: 'Flagged' },
]

export default function AuditHistory() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  })
  const [verdictFilter, setVerdictFilter] = useState('all')

  // Update document title
  useEffect(() => {
    document.title = 'Audit History | Smoodle Verified'
  }, [])

  // Fetch history
  useEffect(() => {
    fetchHistory()
  }, [pagination.page, verdictFilter])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getAuditHistory(
        pagination.page,
        pagination.limit,
        verdictFilter === 'all' ? null : verdictFilter
      )

      setData(response.audits || [])
      setPagination((prev) => ({
        ...prev,
        total: response.pagination?.total || 0,
      }))
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(pagination.total / pagination.limit) || 1

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }))
    }
  }

  const handleViewAudit = (auditId) => {
    navigate(`/audit/${auditId}`)
  }

  return (
    <DashboardLayout>
      <div className="page-enter">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-heading text-2xl font-bold text-dark">
              Audit History
            </h1>
            <p className="text-gray mt-1">
              View and manage your past document audits
            </p>
          </div>
          <Button
            onClick={() => navigate(ROUTES.AUDIT)}
            icon={FileText}
          >
            New Audit
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 sm:max-w-[200px]">
              <Select
                value={verdictFilter}
                onChange={(e) => {
                  setVerdictFilter(e.target.value)
                  setPagination((prev) => ({ ...prev, page: 1 }))
                }}
                icon={Filter}
              >
                {verdictOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex-1" />

            {!loading && (
              <div className="flex items-center text-sm text-gray">
                {pagination.total} audit{pagination.total !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </Card>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <Card className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
            <h3 className="font-heading font-semibold text-dark mb-2">
              Failed to load history
            </h3>
            <p className="text-gray mb-4">{error}</p>
            <Button onClick={fetchHistory}>Try Again</Button>
          </Card>
        ) : data.length === 0 ? (
          <Card className="text-center py-12">
            <div className="w-16 h-16 bg-gray/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <HistoryIcon className="w-8 h-8 text-gray" />
            </div>
            <h3 className="font-heading font-semibold text-dark mb-2">
              No audits yet
            </h3>
            <p className="text-gray mb-4">
              Start auditing documents to see your history here.
            </p>
            <Button onClick={() => navigate(ROUTES.AUDIT)}>
              Audit a Document
            </Button>
          </Card>
        ) : (
          <>
            {/* History List */}
            <div className="space-y-3">
              {data.map((item) => (
                <AuditHistoryCard
                  key={item.audit_id}
                  item={item}
                  onClick={() => handleViewAudit(item.audit_id)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
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
                  Page {pagination.page} of {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

function AuditHistoryCard({ item, onClick }) {
  const isVerified = item.verdict === 'verified'
  const isComplete = item.status === 'complete'
  const isFailed = item.status === 'failed'
  const isProcessing = !isComplete && !isFailed

  return (
    <Card
      className="hover:border-primary/30 cursor-pointer transition-all"
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
          isComplete && isVerified && 'bg-success/10',
          isComplete && !isVerified && 'bg-error/10',
          isProcessing && 'bg-primary/10',
          isFailed && 'bg-gray/10'
        )}>
          {isComplete && isVerified && <ShieldCheck className="w-6 h-6 text-success" />}
          {isComplete && !isVerified && <ShieldAlert className="w-6 h-6 text-error" />}
          {isProcessing && <Clock className="w-6 h-6 text-primary animate-pulse" />}
          {isFailed && <AlertCircle className="w-6 h-6 text-gray" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-dark font-medium truncate">{item.document_name || 'Untitled Document'}</p>
          <p className="text-sm text-gray">{formatDateTime(item.created_at)}</p>
        </div>

        {/* Claims count */}
        {isComplete && (
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <span className="text-success font-medium">{item.claims_verified ?? 0} verified</span>
            <span className="text-gray">/</span>
            <span className="text-error font-medium">{item.claims_flagged ?? 0} flagged</span>
          </div>
        )}

        {/* Status badge */}
        {isComplete && (
          <Badge variant={isVerified ? 'success' : 'error'} size="md" dot pill>
            {isVerified ? 'Verified' : 'Flagged'}
          </Badge>
        )}
        {isProcessing && (
          <Badge variant="warning" size="md" dot pill>
            Processing
          </Badge>
        )}
        {isFailed && (
          <Badge variant="default" size="md" dot pill>
            Failed
          </Badge>
        )}
      </div>

      {/* Mobile: claims count */}
      {isComplete && (
        <div className="flex items-center gap-2 mt-3 text-sm sm:hidden">
          <span className="text-success font-medium">{item.claims_verified ?? 0} verified</span>
          <span className="text-gray">/</span>
          <span className="text-error font-medium">{item.claims_flagged ?? 0} flagged</span>
        </div>
      )}
    </Card>
  )
}
