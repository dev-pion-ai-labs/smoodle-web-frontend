import { useState, useEffect } from 'react'
import { FileText, Image, ScanFace, Video, Music, Coins } from 'lucide-react'
import { cn } from '@utils/cn'
import { CREDIT_COSTS } from '@utils/constants'
import { useAuthStore } from '@store/authStore'
import { useVerifyStore } from '@store/verifyStore'
import DashboardLayout from '@components/layout/DashboardLayout'
import Card from '@components/common/Card'
import TextVerifier from '@components/verification/TextVerifier'
import FileVerifier from '@components/verification/FileVerifier'
import VerificationResult from '@components/verification/VerificationResult'
import RecentVerifications from '@components/verification/VerificationHistory'
import UpgradeCreditsModal from '@components/payment/UpgradeCreditsModal'

const tabs = [
  { id: 'text', label: 'Text', icon: FileText, cost: CREDIT_COSTS.text },
  { id: 'image', label: 'Image', icon: Image, cost: CREDIT_COSTS.image },
  { id: 'deepfake', label: 'Deepfake', icon: ScanFace, cost: CREDIT_COSTS.deepfake },
  { id: 'video', label: 'Video', icon: Video, cost: CREDIT_COSTS.video },
  { id: 'audio', label: 'Music', icon: Music, cost: CREDIT_COSTS.audio, comingSoon: true },
]

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('text')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [requiredCredits, setRequiredCredits] = useState(1)

  const credits = useAuthStore((state) => state.user?.credits ?? 0)
  const { currentResult, setCurrentResult, clearCurrentResult } = useVerifyStore()

  // Update document title
  useEffect(() => {
    document.title = 'Verify Content | Smoodle Verified'
  }, [])

  const handleInsufficientCredits = () => {
    const tab = tabs.find((t) => t.id === activeTab)
    setRequiredCredits(tab?.cost ?? 1)
    setShowUpgradeModal(true)
  }

  const handleReset = () => {
    clearCurrentResult()
  }

  const handleViewDetails = (item) => {
    setCurrentResult(item)
  }

  const currentTab = tabs.find((t) => t.id === activeTab)

  return (
    <DashboardLayout>
      <div className="page-enter">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-heading text-2xl font-bold text-dark">
              Verify Content
            </h1>
            <p className="text-gray mt-1">
              Check if content is AI-generated or human-created
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Verification Panel */}
          <div className="lg:col-span-2">
            {currentResult ? (
              // Show result
              <VerificationResult
                result={currentResult}
                onReset={handleReset}
              />
            ) : (
              // Show verification form
              <Card>
                {/* Tabs */}
                <div className="flex border-b border-gray/10 mb-6 -mx-6 px-6 overflow-x-auto">
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
                        {tab.comingSoon ? (
                          <span className="px-1.5 py-0.5 text-xs rounded-md bg-amber-100 text-amber-600 font-medium">
                            Soon
                          </span>
                        ) : (
                          <span
                            className={cn(
                              'px-1.5 py-0.5 text-xs rounded-md font-mono',
                              isActive
                                ? 'bg-primary/10 text-primary'
                                : 'bg-gray/10 text-gray'
                            )}
                          >
                            {tab.cost}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Tab Content */}
                <div className="animate-in fade-in duration-200">
                  {activeTab === 'text' && (
                    <TextVerifier
                      onInsufficientCredits={handleInsufficientCredits}
                    />
                  )}
                  {activeTab === 'image' && (
                    <FileVerifier
                      type="image"
                      onInsufficientCredits={handleInsufficientCredits}
                    />
                  )}
                  {activeTab === 'deepfake' && (
                    <FileVerifier
                      type="deepfake"
                      onInsufficientCredits={handleInsufficientCredits}
                    />
                  )}
                  {activeTab === 'audio' && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-4">
                        <Music className="w-8 h-8 text-amber-500" />
                      </div>
                      <h3 className="font-heading text-lg font-semibold text-dark mb-2">
                        Music Detection — Coming Soon
                      </h3>
                      <p className="text-gray text-sm max-w-sm">
                        AI music detection (Suno, Udio, etc.) is not yet available. We're working on bringing this feature to you soon.
                      </p>
                    </div>
                  )}
                  {activeTab === 'video' && (
                    <FileVerifier
                      type="video"
                      onInsufficientCredits={handleInsufficientCredits}
                    />
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar - Recent Verifications */}
          <div className="lg:col-span-1">
            <RecentVerifications
              onViewDetails={handleViewDetails}
            />
          </div>
        </div>
      </div>

      {/* Upgrade Credits Modal */}
      <UpgradeCreditsModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        requiredCredits={requiredCredits}
      />
    </DashboardLayout>
  )
}
