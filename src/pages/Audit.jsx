import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Upload, FileText, Coins, AlertCircle, ShieldCheck } from 'lucide-react'
import { cn } from '@utils/cn'
import { AUDIT_CREDIT_COST } from '@utils/constants'
import { getAuditStatus } from '@services/auditService'
import { useAuthStore } from '@store/authStore'
import DashboardLayout from '@components/layout/DashboardLayout'
import Card from '@components/common/Card'
import { AuditFileSubmit, AuditTextSubmit, AuditProgressTracker, AuditResult } from '@components/audit'
import UpgradeCreditsModal from '@components/payment/UpgradeCreditsModal'

const tabs = [
  { id: 'file', label: 'Upload Document', icon: Upload },
  { id: 'text', label: 'Paste Text', icon: FileText },
]

export default function Audit() {
  const { auditId } = useParams()
  const [view, setView] = useState('submit') // submit | processing | result
  const [activeTab, setActiveTab] = useState('file')
  const [currentAuditId, setCurrentAuditId] = useState(null)
  const [auditResult, setAuditResult] = useState(null)
  const [failedData, setFailedData] = useState(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const credits = useAuthStore((state) => state.user?.credits ?? 0)

  // Update document title
  useEffect(() => {
    document.title = 'Document Audit | Smoodle Verified'
  }, [])

  // Deep-link: load audit by URL param
  useEffect(() => {
    if (auditId) {
      loadAudit(auditId)
    }
  }, [auditId])

  const loadAudit = async (id) => {
    try {
      const data = await getAuditStatus(id)

      if (data.status === 'complete') {
        setAuditResult(data)
        setView('result')
      } else if (data.status === 'failed') {
        setFailedData(data)
        setView('processing')
      } else {
        setCurrentAuditId(id)
        setView('processing')
      }
    } catch {
      // Audit not found or error, stay on submit
      setView('submit')
    }
  }

  const handleSubmitSuccess = (data) => {
    setCurrentAuditId(data.audit_id)
    setFailedData(null)
    setView('processing')
  }

  const handleComplete = (data) => {
    setAuditResult(data)
    setView('result')
  }

  const handleFailed = (data) => {
    setFailedData(data)
  }

  const handleReset = () => {
    setView('submit')
    setCurrentAuditId(null)
    setAuditResult(null)
    setFailedData(null)
  }

  return (
    <DashboardLayout>
      <div className="page-enter">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-heading text-2xl font-bold text-dark flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-primary" />
              Document Audit
            </h1>
            <p className="text-gray mt-1">
              AI-powered fact-checking for your documents
            </p>
          </div>

          {/* Credit Balance */}
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-xl">
            <Coins className="w-5 h-5 text-primary" />
            <span className="text-dark font-medium">
              <span className="font-heading font-bold text-primary">{credits}</span> credits
            </span>
          </div>
        </div>

        {/* Submit View */}
        {view === 'submit' && (
          <div className="max-w-2xl mx-auto">
            <Card>
              {/* Tabs */}
              <div className="flex border-b border-gray/10 mb-6 -mx-6 px-6">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        'flex items-center gap-2 px-4 py-3 font-medium text-sm whitespace-nowrap',
                        'border-b-2 transition-all duration-200',
                        'hover:text-primary',
                        isActive
                          ? 'border-primary text-primary'
                          : 'border-transparent text-gray'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Tab Content */}
              <div className="animate-in fade-in duration-200">
                {activeTab === 'file' && (
                  <AuditFileSubmit
                    onSubmitSuccess={handleSubmitSuccess}
                    onInsufficientCredits={() => setShowUpgradeModal(true)}
                  />
                )}
                {activeTab === 'text' && (
                  <AuditTextSubmit
                    onSubmitSuccess={handleSubmitSuccess}
                    onInsufficientCredits={() => setShowUpgradeModal(true)}
                  />
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Processing View */}
        {view === 'processing' && (
          <div className="max-w-md mx-auto">
            <Card>
              <h3 className="font-heading font-semibold text-dark mb-6">
                Auditing your document...
              </h3>

              {failedData ? (
                // Failed state
                <div className="space-y-4">
                  <div className="p-4 bg-error/5 border border-error/20 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-dark">Audit Failed</p>
                        <p className="text-sm text-gray mt-1">
                          {failedData.error || 'An error occurred during processing.'}
                        </p>
                        {failedData.credits_refunded > 0 && (
                          <p className="text-sm text-success mt-2">
                            {failedData.credits_refunded} credits have been refunded.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleReset}
                    className="w-full text-center text-sm text-primary font-medium hover:underline"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <AuditProgressTracker
                  auditId={currentAuditId}
                  onComplete={handleComplete}
                  onFailed={handleFailed}
                />
              )}
            </Card>
          </div>
        )}

        {/* Result View */}
        {view === 'result' && auditResult && (
          <AuditResult
            result={auditResult}
            onReset={handleReset}
          />
        )}
      </div>

      {/* Upgrade Credits Modal */}
      <UpgradeCreditsModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        requiredCredits={AUDIT_CREDIT_COST}
      />
    </DashboardLayout>
  )
}
