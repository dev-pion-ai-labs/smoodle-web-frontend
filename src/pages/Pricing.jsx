import { useEffect, useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import {
  Check,
  Zap,
  Crown,
  Building2,
  Coins,
  FileText,
  Image,
  Mic,
  Video,
  Shield,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@utils/cn'
import { ROUTES } from '@utils/constants'
import { openRazorpayCheckout, loadRazorpayScript } from '@utils/razorpay'
import { createOrder, verifyPayment } from '@services/paymentService'
import { getProfile, getSubscription } from '@services/userService'
import { useAuthStore } from '@store/authStore'
import DashboardLayout from '@components/layout/DashboardLayout'
import Card from '@components/common/Card'
import Button from '@components/common/Button'

// ─── Plan & pack data (matches backend payment_service.py exactly) ──────────

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: null,
    credits: 5,
    creditsLabel: '5 one-time credits',
    icon: Zap,
    description: 'Try Smoodle risk-free',
    valueMetric: 'No credit card needed',
    features: [
      'Text verification',
      'Image verification',
      'Audio verification',
      'Video verification',
      'Community support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 499,
    period: 'month',
    credits: 500,
    creditsLabel: '500 credits every month',
    icon: Crown,
    description: 'For professionals who verify daily',
    valueMetric: '~\u20B91 per verification',
    popular: true,
    features: [
      'All 4 verification types',
      '500 credits renewed monthly',
      'Priority processing queue',
      'Email support',
      'Full verification history',
    ],
    cta: 'Upgrade to Pro',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 2499,
    period: 'month',
    credits: 2000,
    creditsLabel: '2,000 credits every month',
    icon: Building2,
    description: 'Built for teams that need scale',
    valueMetric: '4\u00D7 the credits of Pro',
    badge: 'Best for Teams',
    features: [
      'Everything in Pro',
      '2,000 credits renewed monthly',
      'Fastest processing speeds',
      'Priority support channel',
      'Full REST API access',
      'Smoodle Audit (10 credits each)',
    ],
    cta: 'Upgrade to Enterprise',
  },
]

const creditPacks = [
  { id: 'pack_50', name: 'Starter', credits: 50, price: 99, perCredit: '1.98' },
  {
    id: 'pack_200',
    name: 'Value Pack',
    credits: 200,
    price: 349,
    popular: true,
    perCredit: '1.75',
    save: 12,
  },
  {
    id: 'pack_500',
    name: 'Bulk Pack',
    credits: 500,
    price: 799,
    perCredit: '1.60',
    save: 19,
  },
]

// All verifications cost 1 credit (matches backend verification_service.py)
const verificationTypes = [
  { type: 'Text', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
  { type: 'Image', icon: Image, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { type: 'Audio', icon: Mic, color: 'text-amber-600', bg: 'bg-amber-50' },
  { type: 'Video', icon: Video, color: 'text-purple-600', bg: 'bg-purple-50' },
]

// ─── Component ──────────────────────────────────────────────────────────────

export default function Pricing() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [loadingPlan, setLoadingPlan] = useState(null)
  const [loadingPack, setLoadingPack] = useState(null)

  const isAuthenticated = useAuthStore((state) => !!state.accessToken)
  const user = useAuthStore((state) => state.user)
  const updateCredits = useAuthStore((state) => state.updateCredits)
  const updateUser = useAuthStore((state) => state.updateUser)

  const currentPlan = user?.plan || 'free'
  const planRank = { free: 0, pro: 1, enterprise: 2 }

  useEffect(() => {
    document.title = 'Pricing | Smoodle Verified'
  }, [])

  useEffect(() => {
    loadRazorpayScript().catch(() => {})
  }, [])

  useEffect(() => {
    const packId = searchParams.get('pack')
    if (packId && isAuthenticated) {
      const pack = creditPacks.find((p) => p.id === packId)
      if (pack) {
        setTimeout(() => {
          document.getElementById('credit-packs')?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      }
    }
  }, [searchParams, isAuthenticated])

  const handlePlanUpgrade = async (plan) => {
    if (!isAuthenticated) {
      toast.error('Please login to upgrade')
      return
    }

    if (plan.id === currentPlan) {
      toast('This is your current plan')
      return
    }

    try {
      setLoadingPlan(plan.id)

      const order = await createOrder({ plan_id: plan.id })

      const result = await openRazorpayCheckout({
        order_id: order.order_id || order.id,
        amount: order.amount || plan.price * 100,
        currency: order.currency || 'INR',
        name: 'Smoodle Verified',
        description: `${plan.name} Plan Subscription`,
        prefill: {
          email: user?.email,
          name: user?.full_name,
        },
      })

      if (result.dismissed) {
        toast('Payment cancelled')
        return
      }

      await verifyPayment(result)

      // Re-fetch fresh data from backend
      const [profile, sub] = await Promise.all([
        getProfile(),
        getSubscription().catch(() => null),
      ])
      updateUser({
        credits: profile.credits,
        plan: sub?.plan || currentPlan,
      })

      toast.success(`Successfully upgraded to ${plan.name}!`)
    } catch (err) {
      console.error('Payment error:', err)
      toast.error(err?.description || err?.message || 'Payment failed')
    } finally {
      setLoadingPlan(null)
    }
  }

  const handlePackPurchase = async (pack) => {
    if (!isAuthenticated) {
      toast.error('Please login to purchase credits')
      return
    }

    try {
      setLoadingPack(pack.id)

      const order = await createOrder({ pack_id: pack.id })

      const result = await openRazorpayCheckout({
        order_id: order.order_id || order.id,
        amount: order.amount || pack.price * 100,
        currency: order.currency || 'INR',
        name: 'Smoodle Verified',
        description: `${pack.credits} Credits Pack`,
        prefill: {
          email: user?.email,
          name: user?.full_name,
        },
      })

      if (result.dismissed) {
        toast('Payment cancelled')
        return
      }

      await verifyPayment(result)

      // Re-fetch fresh credits from backend
      const profile = await getProfile()
      updateUser({ credits: profile.credits })

      toast.success(`Successfully purchased ${pack.credits} credits!`)
    } catch (err) {
      console.error('Payment error:', err)
      toast.error(err?.description || err?.message || 'Payment failed')
    } finally {
      setLoadingPack(null)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* ── Hero ── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Shield className="w-4 h-4" />
            Simple, transparent pricing
          </div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-dark mb-2">
            One credit, one verification
          </h1>
          <p className="text-gray max-w-lg mx-auto text-sm md:text-base">
            Detect AI-generated text, images, audio, and video &mdash; all for
            the same simple price. Pick the plan that fits your workflow.
          </p>
        </div>

        {/* ── Credit Explainer ── */}
        <div className="rounded-2xl bg-light border border-gray/10 p-4 md:p-6 mb-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-dark">
              1 credit = 1 verification of any type
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {verificationTypes.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.type}
                  className="flex items-center gap-3 rounded-xl bg-white p-3 border border-gray/5"
                >
                  <div
                    className={cn(
                      'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
                      item.bg
                    )}
                  >
                    <Icon className={cn('w-5 h-5', item.color)} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-dark">
                      {item.type}
                    </p>
                    <p className="text-xs text-gray">1 credit</p>
                  </div>
                </div>
              )
            })}
          </div>
          <p className="text-center text-xs text-gray mt-3">
            Smoodle Audit uses 10 credits per document for in-depth
            fact-checking
          </p>
        </div>

        {/* ── Plans ── */}
        <section className="mb-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const Icon = plan.icon
              const isCurrent = currentPlan === plan.id
              const isLowerPlan = plan.id !== 'free' && (planRank[plan.id] || 0) < (planRank[currentPlan] || 0)
              const isLoading = loadingPlan === plan.id

              return (
                <Card
                  key={plan.id}
                  className={cn(
                    'relative flex flex-col',
                    plan.popular && 'border-2 border-primary shadow-lg',
                    plan.badge &&
                      !plan.popular &&
                      'border-2 border-dark/10'
                  )}
                >
                  {/* Badge */}
                  {(plan.popular || plan.badge) && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span
                        className={cn(
                          'px-4 py-1 text-sm font-medium rounded-full whitespace-nowrap',
                          plan.popular
                            ? 'bg-primary text-white'
                            : 'bg-dark text-white'
                        )}
                      >
                        {plan.popular ? 'Most Popular' : plan.badge}
                      </span>
                    </div>
                  )}

                  {/* Header */}
                  <div className="text-center mb-5 pt-2">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3',
                        plan.popular
                          ? 'bg-primary text-white'
                          : 'bg-gray/10 text-gray'
                      )}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-heading font-bold text-lg text-dark">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-gray mt-0.5">
                      {plan.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="text-center mb-5">
                    {plan.price > 0 ? (
                      <>
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-lg text-gray">
                            &#8377;
                          </span>
                          <span className="font-heading text-4xl font-bold text-dark">
                            {plan.price.toLocaleString()}
                          </span>
                          <span className="text-gray text-sm">
                            /{plan.period}
                          </span>
                        </div>
                        <p className="text-xs text-primary font-semibold mt-1.5 tracking-wide uppercase">
                          {plan.valueMetric}
                        </p>
                      </>
                    ) : (
                      <>
                        <span className="font-heading text-4xl font-bold text-dark">
                          Free
                        </span>
                        <p className="text-xs text-gray font-medium mt-1.5">
                          {plan.valueMetric}
                        </p>
                      </>
                    )}
                    <p className="text-sm text-gray mt-2 font-medium">
                      {plan.creditsLabel}
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray/10 mb-5" />

                  {/* Features */}
                  <ul className="space-y-2.5 mb-6 flex-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check
                          className={cn(
                            'w-4 h-4 flex-shrink-0 mt-0.5',
                            plan.popular
                              ? 'text-primary'
                              : 'text-success'
                          )}
                        />
                        <span className="text-sm text-dark">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  {plan.id === 'free' ? (
                    isCurrent ? (
                      <Button variant="outline" fullWidth disabled>
                        Current Plan
                      </Button>
                    ) : !isAuthenticated ? (
                      <Button
                        variant="outline"
                        fullWidth
                        icon={ArrowRight}
                        iconPosition="right"
                        onClick={() => navigate(ROUTES.SIGNUP)}
                      >
                        Get Started Free
                      </Button>
                    ) : (
                      <Button variant="outline" fullWidth disabled>
                        Free Tier
                      </Button>
                    )
                  ) : isCurrent ? (
                    <Button variant="outline" fullWidth disabled>
                      Current Plan
                    </Button>
                  ) : isLowerPlan ? (
                    <Button variant="outline" fullWidth disabled>
                      Included in your plan
                    </Button>
                  ) : (
                    <Button
                      variant={plan.popular ? 'primary' : 'outline'}
                      fullWidth
                      loading={isLoading}
                      disabled={isLoading || !!loadingPlan}
                      icon={ArrowRight}
                      iconPosition="right"
                      onClick={() => handlePlanUpgrade(plan)}
                    >
                      {plan.cta}
                    </Button>
                  )}
                </Card>
              )
            })}
          </div>
        </section>

        {/* ── Credit Packs ── */}
        <section id="credit-packs" className="mb-10">
          <div className="text-center mb-6">
            <h2 className="font-heading text-lg font-semibold text-dark mb-1">
              Need credits without a subscription?
            </h2>
            <p className="text-gray text-sm">
              Buy credit packs anytime &mdash; they never expire.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {creditPacks.map((pack) => {
              const isLoading = loadingPack === pack.id

              return (
                <Card
                  key={pack.id}
                  className={cn(
                    'relative text-center',
                    pack.popular && 'border-2 border-primary'
                  )}
                >
                  {pack.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-3 py-0.5 bg-primary text-white text-xs font-medium rounded-full">
                        Best Value
                      </span>
                    </div>
                  )}

                  <div className="pt-2">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Coins className="w-6 h-6 text-primary" />
                    </div>

                    <h3 className="font-heading font-semibold text-dark mb-1">
                      {pack.name}
                    </h3>

                    <p className="text-3xl font-heading font-bold text-dark mb-0.5">
                      {pack.credits.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray mb-3">credits</p>

                    <p className="text-2xl font-heading font-bold text-primary mb-1">
                      &#8377;{pack.price.toLocaleString()}
                    </p>

                    <div className="flex items-center justify-center gap-2 mb-4">
                      <span className="text-xs text-gray">
                        &#8377;{pack.perCredit}/credit
                      </span>
                      {pack.save && (
                        <span className="text-xs font-semibold text-success bg-success/10 px-1.5 py-0.5 rounded">
                          Save {pack.save}%
                        </span>
                      )}
                    </div>

                    <Button
                      variant={pack.popular ? 'primary' : 'outline'}
                      fullWidth
                      size="sm"
                      loading={isLoading}
                      disabled={
                        isLoading || !!loadingPack || !isAuthenticated
                      }
                      onClick={() => handlePackPurchase(pack)}
                    >
                      {isAuthenticated ? 'Buy Now' : 'Login to Buy'}
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>

          {!isAuthenticated && (
            <p className="text-center text-sm text-gray mt-4">
              <Link
                to={ROUTES.LOGIN}
                className="text-primary hover:underline"
              >
                Login
              </Link>{' '}
              or{' '}
              <Link
                to={ROUTES.SIGNUP}
                className="text-primary hover:underline"
              >
                create an account
              </Link>{' '}
              to purchase credits.
            </p>
          )}
        </section>
      </div>
    </DashboardLayout>
  )
}
