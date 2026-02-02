import { Link } from 'react-router-dom'
import { Coins, Zap, ArrowRight, X } from 'lucide-react'
import { ROUTES, CREDIT_COSTS } from '@utils/constants'
import { useAuthStore } from '@store/authStore'
import Modal from '@components/common/Modal'
import Button from '@components/common/Button'

/**
 * UpgradeCreditsModal - Shown when user has insufficient credits
 */
export default function UpgradeCreditsModal({ isOpen, onClose, requiredCredits }) {
  const credits = useAuthStore((state) => state.user?.credits ?? 0)

  const creditPacks = [
    { id: 'starter', name: 'Starter Pack', credits: 50, price: 99 },
    { id: 'popular', name: 'Popular Pack', credits: 200, price: 299, popular: true },
    { id: 'pro', name: 'Pro Pack', credits: 500, price: 599 },
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Coins className="w-8 h-8 text-warning" />
        </div>
        <h2 className="text-xl font-heading font-bold text-dark mb-2">
          Need More Credits
        </h2>
        <p className="text-gray">
          You have <strong className="text-dark">{credits} credits</strong> but need{' '}
          <strong className="text-primary">{requiredCredits} credits</strong> for this verification.
        </p>
      </div>

      {/* Credit Costs Reference */}
      <div className="bg-gray/5 rounded-xl p-4 mb-6">
        <p className="text-sm font-medium text-dark mb-3">Credit costs per verification:</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray">Text</span>
            <span className="font-mono text-dark">{CREDIT_COSTS.text} credit</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray">Image</span>
            <span className="font-mono text-dark">{CREDIT_COSTS.image} credits</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray">Audio</span>
            <span className="font-mono text-dark">{CREDIT_COSTS.audio} credits</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray">Video</span>
            <span className="font-mono text-dark">{CREDIT_COSTS.video} credits</span>
          </div>
        </div>
      </div>

      {/* Quick Credit Packs */}
      <div className="space-y-3 mb-6">
        <p className="text-sm font-medium text-dark">Quick top-up:</p>
        {creditPacks.map((pack) => (
          <Link
            key={pack.id}
            to={`${ROUTES.PRICING}?pack=${pack.id}`}
            onClick={onClose}
            className={`
              flex items-center justify-between p-4 rounded-xl border-2 transition-all
              ${pack.popular
                ? 'border-primary bg-primary/5 hover:bg-primary/10'
                : 'border-gray/10 hover:border-primary/30 hover:bg-gray/5'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <div className={`
                w-10 h-10 rounded-lg flex items-center justify-center
                ${pack.popular ? 'bg-primary text-white' : 'bg-gray/10 text-gray'}
              `}>
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-dark">{pack.name}</p>
                  {pack.popular && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-primary text-white rounded-full">
                      Popular
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray">{pack.credits} credits</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-dark">₹{pack.price}</span>
              <ArrowRight className="w-4 h-4 text-gray" />
            </div>
          </Link>
        ))}
      </div>

      {/* Subscription CTA */}
      <div className="bg-primary/5 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-dark mb-1">Go Pro for unlimited verifications</p>
            <p className="text-sm text-gray mb-2">
              Get 500 credits/month, priority processing, and more.
            </p>
            <Link
              to={ROUTES.PRICING}
              onClick={onClose}
              className="text-sm font-medium text-primary hover:underline"
            >
              View subscription plans →
            </Link>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="ghost" onClick={onClose} fullWidth>
          Cancel
        </Button>
        <Link to={ROUTES.PRICING} onClick={onClose} className="flex-1">
          <Button variant="primary" fullWidth icon={Coins}>
            Get Credits
          </Button>
        </Link>
      </div>
    </Modal>
  )
}
