import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Check,
  Zap,
  Crown,
  Building2,
  Coins,
  ArrowRight,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@utils/cn'
import { ROUTES } from '@utils/constants'
import { openRazorpayCheckout, loadRazorpayScript } from '@utils/razorpay'
import { createOrder, verifyPayment } from '@services/paymentService'
import { useAuthStore } from '@store/authStore'
import DashboardLayout from '@components/layout/DashboardLayout'
import Card from '@components/common/Card'
import Button from '@components/common/Button'

// Subscription plans
const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: null,
    credits: 10,
    creditsLabel: '10 credits on signup',
    icon: Zap,
    description: 'Get started with basic verification',
    features: [
      'Text verification',
      'Image verification',
      'Audio verification',
      'Basic support',
    ],
    cta: 'Current Plan',
    disabled: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 499,
    period: 'month',
    credits: 500,
    creditsLabel: '500 credits/month',
    icon: Crown,
    description: 'Perfect for professionals',
    popular: true,
    features: [
      'All verification types',
      '500 credits/month',
      'Priority processing',
      'Email support',
      'Full history access',
      'API access (coming soon)',
    ],
    cta: 'Upgrade to Pro',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 2499,
    period: 'month',
    credits: 5000,
    creditsLabel: '5000 credits/month',
    icon: Building2,
    description: 'For teams and businesses',
    features: [
      'All verification types',
      '5000 credits/month',
      'Fastest processing',
      'Priority support',
      'Full API access',
      'Custom integrations',
      'Dedicated account manager',
    ],
    cta: 'Contact Sales',
    contactSales: true,
  },
]

// Credit packs for one-time purchase
const creditPacks = [
  { id: 'starter', name: 'Starter', credits: 50, price: 99 },
  { id: 'popular', name: 'Popular', credits: 200, price: 299, popular: true },
  { id: 'pro', name: 'Pro', credits: 500, price: 599 },
  { id: 'enterprise', name: 'Enterprise', credits: 2000, price: 1999 },
]

export default function Pricing() {
  const [searchParams] = useSearchParams()
  const [loadingPlan, setLoadingPlan] = useState(null)
  const [loadingPack, setLoadingPack] = useState(null)

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const updateCredits = useAuthStore((state) => state.updateCredits)

  const currentPlan = user?.plan || 'free'

  // Update document title
  useEffect(() => {
    document.title = 'Pricing | Smoodle Verified'
  }, [])

  // Preload Razorpay script
  useEffect(() => {
    loadRazorpayScript().catch(() => {
      // Silent fail, will retry on purchase
    })
  }, [])

  // Handle pack query param (from upgrade modal)
  useEffect(() => {
    const packId = searchParams.get('pack')
    if (packId && isAuthenticated) {
      const pack = creditPacks.find((p) => p.id === packId)
      if (pack) {
        // Scroll to credit packs section
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

    if (plan.contactSales) {
      window.location.href = 'mailto:sales@smoodle.ai?subject=Enterprise Plan Inquiry'
      return
    }

    if (plan.id === currentPlan) {
      toast('This is your current plan')
      return
    }

    try {
      setLoadingPlan(plan.id)

      // Create order
      const order = await createOrder({ plan_id: plan.id })

      // Open Razorpay checkout
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

      // Verify payment
      const verification = await verifyPayment(result)

      // Update credits
      if (verification.credits) {
        updateCredits(verification.credits)
      }

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

      // Create order
      const order = await createOrder({ pack_id: pack.id })

      // Open Razorpay checkout
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

      // Verify payment
      const verification = await verifyPayment(result)

      // Update credits
      if (verification.credits) {
        updateCredits(verification.credits)
      }

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
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-bold text-dark">Pricing</h1>
          <p className="text-gray mt-1">
            Choose a plan or buy credits to verify content
          </p>
        </div>

        {/* Plans Section */}
        <section className="mb-12">
          <h2 className="font-heading text-lg font-semibold text-dark mb-4">
            Subscription Plans
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const Icon = plan.icon
              const isCurrent = currentPlan === plan.id
              const isLoading = loadingPlan === plan.id

              return (
                <Card
                  key={plan.id}
                  className={cn(
                    'relative flex flex-col',
                    plan.popular && 'border-2 border-primary shadow-lg'
                  )}
                >
                  {/* Popular badge */}
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-4 py-1 bg-primary text-white text-sm font-medium rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}

                  {/* Header */}
                  <div className="text-center mb-6 pt-2">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3',
                        plan.popular ? 'bg-primary text-white' : 'bg-gray/10 text-gray'
                      )}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-heading font-bold text-lg text-dark mb-1">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-gray">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="text-center mb-6">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-xl text-gray">₹</span>
                      <span className="font-heading text-4xl font-bold text-dark">
                        {plan.price.toLocaleString()}
                      </span>
                      {plan.period && (
                        <span className="text-gray">/{plan.period}</span>
                      )}
                    </div>
                    <p className="text-sm text-primary font-medium mt-2">
                      {plan.creditsLabel}
                    </p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2.5 mb-6 flex-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-dark">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  {isCurrent ? (
                    <Button variant="outline" fullWidth disabled>
                      Current Plan
                    </Button>
                  ) : plan.contactSales ? (
                    <Button
                      variant={plan.popular ? 'primary' : 'outline'}
                      fullWidth
                      onClick={() => handlePlanUpgrade(plan)}
                    >
                      Contact Sales
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  ) : (
                    <Button
                      variant={plan.popular ? 'primary' : 'outline'}
                      fullWidth
                      loading={isLoading}
                      disabled={isLoading || !!loadingPlan}
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

        {/* Credit Packs Section */}
        <section id="credit-packs">
          <h2 className="font-heading text-lg font-semibold text-dark mb-4">
            Credit Packs
          </h2>
          <p className="text-gray text-sm mb-6">
            Buy additional credits anytime. No subscription required.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Coins className="w-5 h-5 text-primary" />
                    </div>

                    <h3 className="font-heading font-semibold text-dark mb-1">
                      {pack.name}
                    </h3>

                    <p className="text-2xl font-heading font-bold text-primary mb-0.5">
                      {pack.credits.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray mb-3">credits</p>

                    <p className="text-xl font-heading font-bold text-dark mb-4">
                      ₹{pack.price.toLocaleString()}
                    </p>

                    <Button
                      variant={pack.popular ? 'primary' : 'outline'}
                      fullWidth
                      size="sm"
                      loading={isLoading}
                      disabled={isLoading || !!loadingPack || !isAuthenticated}
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
              <Link to={ROUTES.LOGIN} className="text-primary hover:underline">
                Login
              </Link>{' '}
              or{' '}
              <Link to={ROUTES.SIGNUP} className="text-primary hover:underline">
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
