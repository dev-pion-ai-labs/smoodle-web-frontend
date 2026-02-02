import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Check,
  Zap,
  Crown,
  Building2,
  Coins,
  ArrowRight,
  Sparkles,
  Shield,
  Clock,
  Headphones,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@utils/cn'
import { ROUTES } from '@utils/constants'
import { openRazorpayCheckout, loadRazorpayScript } from '@utils/razorpay'
import { createOrder, verifyPayment } from '@services/paymentService'
import { useAuthStore } from '@store/authStore'
import Navbar from '@components/layout/Navbar'
import Footer from '@components/layout/Footer'
import Card from '@components/common/Card'
import Button from '@components/common/Button'
import { Spinner } from '@components/common/Loader'
import { PlanBadge } from '@components/common/Badge'

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
    <div className="min-h-screen bg-light">
      <Navbar />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 text-center">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-dark mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-lg text-gray max-w-2xl mx-auto">
              Choose the plan that works for you. All plans include access to our
              AI detection technology.
            </p>
          </div>
        </section>

        {/* Plans Section */}
        <section className="pb-16">
          <div className="max-w-6xl mx-auto px-4">
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
                      plan.popular && 'border-2 border-primary shadow-lg scale-[1.02]'
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
                          'w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4',
                          plan.popular ? 'bg-primary text-white' : 'bg-gray/10 text-gray'
                        )}
                      >
                        <Icon className="w-7 h-7" />
                      </div>
                      <h3 className="font-heading font-bold text-xl text-dark mb-1">
                        {plan.name}
                      </h3>
                      <p className="text-sm text-gray">{plan.description}</p>
                    </div>

                    {/* Price */}
                    <div className="text-center mb-6">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-2xl text-gray">₹</span>
                        <span className="font-heading text-5xl font-bold text-dark">
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
                    <ul className="space-y-3 mb-8 flex-1">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
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
          </div>
        </section>

        {/* Credit Packs Section */}
        <section id="credit-packs" className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl font-bold text-dark mb-4">
                Need More Credits?
              </h2>
              <p className="text-gray max-w-2xl mx-auto">
                Buy additional credits anytime. No subscription required.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Coins className="w-6 h-6 text-primary" />
                      </div>

                      <h3 className="font-heading font-bold text-lg text-dark mb-1">
                        {pack.name}
                      </h3>

                      <p className="text-3xl font-heading font-bold text-primary mb-1">
                        {pack.credits.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray mb-4">credits</p>

                      <p className="text-2xl font-heading font-bold text-dark mb-4">
                        ₹{pack.price.toLocaleString()}
                      </p>

                      <Button
                        variant={pack.popular ? 'primary' : 'outline'}
                        fullWidth
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
              <p className="text-center text-sm text-gray mt-6">
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
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl font-bold text-dark mb-4">
                Why Choose Smoodle?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Sparkles,
                  title: 'State-of-the-Art AI',
                  description: 'Powered by the latest AI detection models',
                },
                {
                  icon: Shield,
                  title: 'Secure & Private',
                  description: 'Your content is never stored or shared',
                },
                {
                  icon: Clock,
                  title: 'Fast Results',
                  description: 'Get verification results in seconds',
                },
                {
                  icon: Headphones,
                  title: 'Great Support',
                  description: 'Friendly support team ready to help',
                },
              ].map((feature, i) => (
                <div key={i} className="text-center">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold text-dark mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl font-bold text-dark mb-4">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: 'What is a credit?',
                  a: 'A credit is used each time you verify content. Text verification costs 1 credit, images cost 2, audio costs 3, and video costs 5 credits.',
                },
                {
                  q: 'Do credits expire?',
                  a: 'Credits from one-time purchases never expire. Subscription credits reset monthly on your billing date.',
                },
                {
                  q: 'Can I cancel my subscription?',
                  a: 'Yes, you can cancel anytime from your Settings page. You\'ll retain access until the end of your billing period.',
                },
                {
                  q: 'Is my payment secure?',
                  a: 'Yes, all payments are processed securely through Razorpay, a PCI-DSS compliant payment gateway.',
                },
              ].map((faq, i) => (
                <Card key={i}>
                  <h3 className="font-heading font-semibold text-dark mb-2">
                    {faq.q}
                  </h3>
                  <p className="text-gray text-sm">{faq.a}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="font-heading text-3xl font-bold text-dark mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-gray mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust Smoodle for AI content verification.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link to={ROUTES.DASHBOARD}>
                  <Button size="lg" icon={Zap}>
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to={ROUTES.SIGNUP}>
                    <Button size="lg" icon={Zap}>
                      Start Free
                    </Button>
                  </Link>
                  <Link to={ROUTES.LOGIN}>
                    <Button variant="outline" size="lg">
                      Login
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
