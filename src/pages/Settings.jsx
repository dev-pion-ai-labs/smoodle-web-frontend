import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  User,
  Mail,
  Coins,
  CreditCard,
  Calendar,
  AlertTriangle,
  Trash2,
  Save,
  Crown,
  Zap,
  ExternalLink,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@utils/cn'
import { ROUTES } from '@utils/constants'
import { profileSchema } from '@utils/validators'
import { formatDateTime } from '@utils/helpers'
import { updateProfile, getSubscription, deleteAccount } from '@services/userService'
import { useAuthStore } from '@store/authStore'
import DashboardLayout from '@components/layout/DashboardLayout'
import Card from '@components/common/Card'
import Button from '@components/common/Button'
import { Input } from '@components/common/Input'
import { Skeleton } from '@components/common/Loader'
import { PlanBadge } from '@components/common/Badge'
import Modal, { ConfirmModal } from '@components/common/Modal'

export default function Settings() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const logout = useAuthStore((state) => state.logout)

  const [subscription, setSubscription] = useState(null)
  const [subLoading, setSubLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)

  // Cancel subscription state
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  // Profile form
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.full_name || '',
    },
  })

  // Update document title
  useEffect(() => {
    document.title = 'Settings | Smoodle Verified'
  }, [])

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      reset({ full_name: user.full_name || '' })
    }
  }, [user, reset])

  // Fetch subscription details
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setSubLoading(true)
        const data = await getSubscription()
        setSubscription(data)
      } catch (err) {
        // Subscription might not exist for free users
        setSubscription(null)
      } finally {
        setSubLoading(false)
      }
    }

    fetchSubscription()
  }, [])

  const onSubmitProfile = async (data) => {
    try {
      setSaving(true)
      const updated = await updateProfile(data)
      setUser({ ...user, ...updated })
      toast.success('Profile updated')
      reset(data)
    } catch (err) {
      toast.error(err || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelSubscription = async () => {
    try {
      setCancelling(true)
      // API call would go here
      toast.success('Subscription cancelled')
      setShowCancelModal(false)
      setSubscription((prev) => ({ ...prev, status: 'cancelled' }))
    } catch (err) {
      toast.error(err || 'Failed to cancel subscription')
    } finally {
      setCancelling(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm')
      return
    }

    try {
      setDeleting(true)
      await deleteAccount()
      toast.success('Account deleted')
      logout()
      navigate(ROUTES.HOME)
    } catch (err) {
      toast.error(err || 'Failed to delete account')
    } finally {
      setDeleting(false)
    }
  }

  const planDetails = {
    free: { name: 'Free', color: 'gray' },
    pro: { name: 'Pro', color: 'primary' },
    enterprise: { name: 'Enterprise', color: 'warning' },
  }

  const currentPlan = user?.plan || 'free'
  const credits = user?.credits ?? 0

  return (
    <DashboardLayout>
      <div className="page-enter max-w-3xl">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="font-heading text-2xl font-bold text-dark">
            Settings
          </h1>
          <p className="text-gray mt-1">
            Manage your account and preferences
          </p>
        </div>

        {/* Profile Section */}
        <Card className="mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-heading font-semibold text-dark">Profile</h2>
              <p className="text-sm text-gray">Your personal information</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="Enter your name"
              icon={User}
              error={errors.full_name?.message}
              {...register('full_name')}
            />

            <Input
              label="Email Address"
              value={user?.email || ''}
              icon={Mail}
              disabled
              className="bg-gray/5"
            />

            <div className="flex justify-end">
              <Button
                type="submit"
                loading={saving}
                disabled={!isDirty || saving}
                icon={Save}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Card>

        {/* Plan & Credits Section */}
        <Card className="mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Crown className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-heading font-semibold text-dark">Plan & Credits</h2>
              <p className="text-sm text-gray">Your current plan and credit balance</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Current Plan */}
            <div className="p-4 bg-gray/5 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray">Current Plan</span>
                <PlanBadge plan={currentPlan} />
              </div>
              <p className="font-heading font-bold text-xl text-dark">
                {planDetails[currentPlan]?.name || 'Free'}
              </p>
            </div>

            {/* Credits */}
            <div className="p-4 bg-gray/5 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="w-4 h-4 text-gray" />
                <span className="text-sm text-gray">Credits Balance</span>
              </div>
              <p className="font-heading font-bold text-xl text-primary">
                {credits.toLocaleString()}
              </p>
            </div>
          </div>

          <Link to={ROUTES.PRICING}>
            <Button variant="outline" fullWidth icon={Zap}>
              {currentPlan === 'free' ? 'Upgrade Plan' : 'Manage Plan'}
            </Button>
          </Link>
        </Card>

        {/* Subscription Section */}
        {subLoading ? (
          <Card className="mb-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-60" />
              <Skeleton className="h-10 w-full" />
            </div>
          </Card>
        ) : subscription && subscription.status === 'active' ? (
          <Card className="mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-heading font-semibold text-dark">Subscription</h2>
                <p className="text-sm text-gray">Manage your subscription</p>
              </div>
            </div>

            <div className="p-4 bg-gray/5 rounded-xl mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray">Plan</span>
                <span className="font-medium text-dark">
                  {subscription.plan_name || planDetails[currentPlan]?.name}
                </span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray">Status</span>
                <span className="px-2 py-1 text-xs font-medium bg-success/10 text-success rounded-full">
                  Active
                </span>
              </div>
              {subscription.next_billing_date && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray">Next Billing</span>
                  <span className="font-medium text-dark">
                    {formatDateTime(subscription.next_billing_date)}
                  </span>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              fullWidth
              onClick={() => setShowCancelModal(true)}
            >
              Cancel Subscription
            </Button>
          </Card>
        ) : null}

        {/* Danger Zone */}
        <Card className="border-error/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-error" />
            </div>
            <div>
              <h2 className="font-heading font-semibold text-dark">Danger Zone</h2>
              <p className="text-sm text-gray">Irreversible actions</p>
            </div>
          </div>

          <div className="p-4 bg-error/5 rounded-xl border border-error/10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="font-medium text-dark">Delete Account</p>
                <p className="text-sm text-gray">
                  Permanently delete your account and all data
                </p>
              </div>
              <Button
                variant="danger"
                icon={Trash2}
                onClick={() => setShowDeleteModal(true)}
              >
                Delete Account
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Cancel Subscription Modal */}
      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelSubscription}
        title="Cancel Subscription"
        message="Are you sure you want to cancel your subscription? You'll lose access to premium features at the end of your billing period."
        confirmText="Cancel Subscription"
        confirmVariant="danger"
        loading={cancelling}
      />

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setDeleteConfirmText('')
        }}
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-error" />
          </div>
          <h2 className="font-heading font-bold text-xl text-dark mb-2">
            Delete Account
          </h2>
          <p className="text-gray">
            This action is permanent and cannot be undone. All your data, including verification history, will be deleted.
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-dark mb-2">
            Type <span className="font-mono text-error">DELETE</span> to confirm
          </label>
          <Input
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="Type DELETE"
            className="font-mono"
          />
        </div>

        <div className="flex gap-3">
          <Button
            variant="ghost"
            fullWidth
            onClick={() => {
              setShowDeleteModal(false)
              setDeleteConfirmText('')
            }}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            fullWidth
            onClick={handleDeleteAccount}
            loading={deleting}
            disabled={deleteConfirmText !== 'DELETE'}
          >
            Delete My Account
          </Button>
        </div>
      </Modal>
    </DashboardLayout>
  )
}
