import { useState } from 'react'
import {
  ShieldCheck,
  ShieldAlert,
  FileText,
  Clock,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Download,
  RotateCcw,
  History,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Scale,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { cn } from '@utils/cn'
import { ROUTES } from '@utils/constants'
import { getAuditReport } from '@services/auditService'
import Card from '@components/common/Card'
import Badge from '@components/common/Badge'
import Button from '@components/common/Button'

export default function AuditResult({ result, onReset }) {
  const [downloadingReport, setDownloadingReport] = useState(false)
  const [expandedFlagged, setExpandedFlagged] = useState({})
  const [showVerified, setShowVerified] = useState(false)

  if (!result) return null

  const { verdict, summary, document, flagged_claims, verified_claims, report_url, audit_id } = result
  const isVerified = verdict === 'verified'

  const handleDownloadReport = async () => {
    // Use inline report_url if available, otherwise fetch
    const url = report_url
    if (url) {
      window.open(url, '_blank')
      return
    }

    setDownloadingReport(true)
    try {
      const data = await getAuditReport(audit_id)
      if (data.report_url) {
        window.open(data.report_url, '_blank')
      }
    } catch (error) {
      toast.error(error || 'Failed to get report')
    } finally {
      setDownloadingReport(false)
    }
  }

  const toggleFlaggedClaim = (index) => {
    setExpandedFlagged((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  return (
    <div className="space-y-6">
      {/* Verdict Banner */}
      <Card className={cn(
        'flex items-center gap-4',
        isVerified ? 'border-success/30 bg-success/5' : 'border-error/30 bg-error/5'
      )}>
        <div className={cn(
          'w-14 h-14 rounded-2xl flex items-center justify-center',
          isVerified ? 'bg-success/10' : 'bg-error/10'
        )}>
          {isVerified ? (
            <ShieldCheck className="w-7 h-7 text-success" />
          ) : (
            <ShieldAlert className="w-7 h-7 text-error" />
          )}
        </div>
        <div>
          <Badge variant={isVerified ? 'success' : 'error'} size="lg" dot pill>
            {isVerified ? 'Verified' : 'Flagged'}
          </Badge>
          <p className="text-sm text-gray mt-1">
            {isVerified
              ? 'All claims in this document were verified.'
              : `${flagged_claims?.length || 0} claim(s) could not be verified.`}
          </p>
        </div>
      </Card>

      {/* Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryCard
          icon={FileText}
          label="Total Claims"
          value={summary?.total_claims ?? 0}
        />
        <SummaryCard
          icon={CheckCircle2}
          label="Verified"
          value={summary?.verified ?? 0}
          color="success"
        />
        <SummaryCard
          icon={AlertTriangle}
          label="Flagged"
          value={summary?.flagged ?? 0}
          color="error"
        />
        <SummaryCard
          icon={Clock}
          label="Time"
          value={`${summary?.processing_time_seconds ?? 0}s`}
        />
      </div>

      {/* Document Info */}
      {document && (
        <Card>
          <h3 className="font-heading font-semibold text-dark mb-3">Document Info</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {document.name && (
              <InfoRow icon={FileText} label="Name" value={document.name} />
            )}
            {document.type && (
              <InfoRow icon={FileText} label="Type" value={document.type} />
            )}
            {document.jurisdiction && (
              <InfoRow icon={Scale} label="Jurisdiction" value={document.jurisdiction} />
            )}
            {document.domain && (
              <InfoRow icon={Globe} label="Domain" value={document.domain} />
            )}
          </div>
        </Card>
      )}

      {/* Flagged Claims */}
      {flagged_claims && flagged_claims.length > 0 && (
        <Card>
          <h3 className="font-heading font-semibold text-dark mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-error" />
            Flagged Claims ({flagged_claims.length})
          </h3>
          <div className="space-y-2">
            {flagged_claims.map((claim, i) => (
              <div
                key={i}
                className="border border-error/15 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => toggleFlaggedClaim(i)}
                  className="w-full flex items-start gap-3 p-3 text-left hover:bg-error/5 transition-colors"
                >
                  <div className="mt-0.5">
                    {expandedFlagged[i] ? (
                      <ChevronDown className="w-4 h-4 text-gray" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-dark">{claim.claim_text}</p>
                    {claim.location && (
                      <p className="text-xs text-gray mt-1">Location: {claim.location}</p>
                    )}
                  </div>
                  <Badge variant="error" size="sm">Flagged</Badge>
                </button>

                {expandedFlagged[i] && (
                  <div className="px-3 pb-3 ml-7 space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
                    {claim.explanation && (
                      <div>
                        <p className="text-xs font-medium text-gray uppercase tracking-wide">Explanation</p>
                        <p className="text-sm text-dark mt-0.5">{claim.explanation}</p>
                      </div>
                    )}
                    {claim.suggested_correction && (
                      <div>
                        <p className="text-xs font-medium text-gray uppercase tracking-wide">Suggested Correction</p>
                        <p className="text-sm text-success mt-0.5">{claim.suggested_correction}</p>
                      </div>
                    )}
                    {claim.sources && claim.sources.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray uppercase tracking-wide">Sources</p>
                        <div className="mt-1 space-y-1">
                          {claim.sources.map((source, si) => (
                            <a
                              key={si}
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                            >
                              <ExternalLink className="w-3 h-3 flex-shrink-0" />
                              {source.title || source.url}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Verified Claims (collapsed by default) */}
      {verified_claims && verified_claims.length > 0 && (
        <Card>
          <button
            onClick={() => setShowVerified(!showVerified)}
            className="w-full flex items-center justify-between"
          >
            <h3 className="font-heading font-semibold text-dark flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-success" />
              Verified Claims ({verified_claims.length})
            </h3>
            {showVerified ? (
              <ChevronDown className="w-5 h-5 text-gray" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray" />
            )}
          </button>

          {showVerified && (
            <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
              {verified_claims.map((claim, i) => (
                <div key={i} className="flex items-start gap-2 p-2.5 bg-success/5 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-dark">{claim.claim_text}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <Button
          onClick={handleDownloadReport}
          loading={downloadingReport}
          variant="outline"
          icon={Download}
        >
          Download Report
        </Button>

        <div className="flex-1" />

        <Link to={ROUTES.AUDIT_HISTORY}>
          <Button variant="ghost" icon={History}>
            View History
          </Button>
        </Link>

        <Button onClick={onReset} icon={RotateCcw}>
          Audit Another
        </Button>
      </div>
    </div>
  )
}

function SummaryCard({ icon: Icon, label, value, color }) {
  return (
    <div className="p-3 rounded-xl bg-gray/5 border border-gray/10">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={cn('w-4 h-4', color ? `text-${color}` : 'text-gray')} />
        <span className="text-xs text-gray">{label}</span>
      </div>
      <p className={cn(
        'font-heading font-bold text-xl',
        color ? `text-${color}` : 'text-dark'
      )}>
        {value}
      </p>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-gray" />
      <span className="text-sm text-gray">{label}:</span>
      <span className="text-sm text-dark font-medium">{value}</span>
    </div>
  )
}
