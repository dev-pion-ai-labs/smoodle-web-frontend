import { useEffect, useState } from 'react'
import {
  Users,
  FileCheck,
  IndianRupee,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  RefreshCw,
  FileText,
  Image,
  ScanFace,
  Video,
  Music,
} from 'lucide-react'
// Charts removed - backend doesn't have chart endpoints yet
// import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'
import { cn } from '@utils/cn'
import { formatDateTime, truncateText } from '@utils/helpers'
import {
  getStats,
  getUsers,
  adjustCredits,
  getVerifications,
  getPayments,
} from '@services/adminService'
import DashboardLayout from '@components/layout/DashboardLayout'
import Card, { StatsCard } from '@components/common/Card'
import Button from '@components/common/Button'
import { Input } from '@components/common/Input'
import { Skeleton, SkeletonTable } from '@components/common/Loader'
import { VerdictBadge, PlanBadge, StatusBadge } from '@components/common/Badge'
import Modal from '@components/common/Modal'

const typeIcons = {
  text: FileText,
  image: Image,
  deepfake: ScanFace,
  video: Video,
  audio: Music,
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users')
  const [stats, setStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)


  // Users state
  const [users, setUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersPagination, setUsersPagination] = useState({ page: 1, limit: 10, total: 0 })
  const [usersSearch, setUsersSearch] = useState('')

  // Verifications state
  const [verifications, setVerifications] = useState([])
  const [verificationsLoading, setVerificationsLoading] = useState(false)
  const [verificationsPagination, setVerificationsPagination] = useState({ page: 1, limit: 10, total: 0 })

  // Payments state
  const [payments, setPayments] = useState([])
  const [paymentsLoading, setPaymentsLoading] = useState(false)
  const [paymentsPagination, setPaymentsPagination] = useState({ page: 1, limit: 10, total: 0 })

  // Adjust credits modal
  const [adjustModal, setAdjustModal] = useState({ open: false, user: null })
  const [adjustAmount, setAdjustAmount] = useState('')
  const [adjustReason, setAdjustReason] = useState('')
  const [adjusting, setAdjusting] = useState(false)

  // Update document title
  useEffect(() => {
    document.title = 'Admin Dashboard | Smoodle Verified'
  }, [])

  // Fetch stats
  useEffect(() => {
    fetchStats()
  }, [])

  // Fetch data based on active tab
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers()
    } else if (activeTab === 'verifications') {
      fetchVerifications()
    } else if (activeTab === 'payments') {
      fetchPayments()
    }
  }, [activeTab])

  const fetchStats = async () => {
    try {
      setStatsLoading(true)
      const data = await getStats()
      setStats(data)
    } catch (err) {
      // Use mock data matching backend structure if API fails
      setStats({
        users: { today: 0, week: 0, month: 0, total: 0 },
        verifications: { total: { today: 0, week: 0, month: 0, total: 0 } },
        revenue: { total: { today: 0, week: 0, month: 0, total: 0 } },
        subscriptions: { free: 0, pro: 0, enterprise: 0, total_active: 0 },
      })
    } finally {
      setStatsLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      setUsersLoading(true)
      const response = await getUsers(usersPagination.page, usersPagination.limit, usersSearch)
      // Backend returns { items, total, page, pages, limit }
      setUsers(response.items || response.data || response.users || [])
      setUsersPagination((prev) => ({
        ...prev,
        total: response.total || 0,
      }))
    } catch (err) {
      toast.error('Failed to fetch users')
    } finally {
      setUsersLoading(false)
    }
  }

  const fetchVerifications = async () => {
    try {
      setVerificationsLoading(true)
      const response = await getVerifications(verificationsPagination.page, verificationsPagination.limit)
      // Backend returns { items, total, page, pages, limit }
      setVerifications(response.items || response.data || response.verifications || [])
      setVerificationsPagination((prev) => ({
        ...prev,
        total: response.total || 0,
      }))
    } catch (err) {
      toast.error('Failed to fetch verifications')
    } finally {
      setVerificationsLoading(false)
    }
  }

  const fetchPayments = async () => {
    try {
      setPaymentsLoading(true)
      const response = await getPayments(paymentsPagination.page, paymentsPagination.limit)
      // Backend returns { items, total, page, pages, limit }
      setPayments(response.items || response.data || response.payments || [])
      setPaymentsPagination((prev) => ({
        ...prev,
        total: response.total || 0,
      }))
    } catch (err) {
      toast.error('Failed to fetch payments')
    } finally {
      setPaymentsLoading(false)
    }
  }

  const handleAdjustCredits = async () => {
    if (!adjustAmount || isNaN(parseInt(adjustAmount))) {
      toast.error('Please enter a valid amount')
      return
    }

    try {
      setAdjusting(true)
      await adjustCredits(adjustModal.user.id, parseInt(adjustAmount), adjustReason)
      toast.success('Credits adjusted successfully')
      setAdjustModal({ open: false, user: null })
      setAdjustAmount('')
      setAdjustReason('')
      fetchUsers()
    } catch (err) {
      toast.error(err || 'Failed to adjust credits')
    } finally {
      setAdjusting(false)
    }
  }

  const handleUserSearch = (e) => {
    e.preventDefault()
    setUsersPagination((prev) => ({ ...prev, page: 1 }))
    fetchUsers()
  }

  return (
    <DashboardLayout>
      <div className="page-enter">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-2xl font-bold text-dark">
              Admin Dashboard
            </h1>
            <p className="text-gray mt-1">
              Manage users and monitor platform activity
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={() => {
              fetchStats()
              if (activeTab === 'users') fetchUsers()
              else if (activeTab === 'verifications') fetchVerifications()
              else if (activeTab === 'payments') fetchPayments()
            }}
          >
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsLoading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <Skeleton className="h-16 w-full" />
                </Card>
              ))}
            </>
          ) : (
            <>
              <StatsCard
                title="Total Users"
                value={(stats?.users?.total || 0).toLocaleString()}
                icon={Users}
                trendLabel={`${stats?.users?.month || 0} this month`}
              />
              <StatsCard
                title="Verifications"
                value={(stats?.verifications?.total?.total || 0).toLocaleString()}
                icon={FileCheck}
                trendLabel={`${stats?.verifications?.total?.month || 0} this month`}
              />
              <StatsCard
                title="Revenue"
                value={`₹${((stats?.revenue?.total?.total || 0) / 100).toLocaleString()}`}
                icon={IndianRupee}
                trendLabel={`₹${((stats?.revenue?.total?.month || 0) / 100).toLocaleString()} this month`}
              />
              <StatsCard
                title="Active Subscriptions"
                value={(stats?.subscriptions?.total_active || 0).toLocaleString()}
                icon={CreditCard}
                trendLabel={`${stats?.subscriptions?.pro || 0} Pro, ${stats?.subscriptions?.enterprise || 0} Enterprise`}
              />
            </>
          )}
        </div>

        {/* Charts - Coming Soon */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Verifications Chart */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-semibold text-dark">Verifications Over Time</h3>
            </div>
            <div className="h-64 flex items-center justify-center bg-gray/5 rounded-lg">
              <div className="text-center">
                <FileCheck className="w-12 h-12 text-gray/30 mx-auto mb-2" />
                <p className="text-gray font-medium">Analytics Coming Soon</p>
                <p className="text-sm text-gray/60 mt-1">Verification trends will appear here</p>
              </div>
            </div>
          </Card>

          {/* Revenue Chart */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-semibold text-dark">Revenue Over Time</h3>
            </div>
            <div className="h-64 flex items-center justify-center bg-gray/5 rounded-lg">
              <div className="text-center">
                <IndianRupee className="w-12 h-12 text-gray/30 mx-auto mb-2" />
                <p className="text-gray font-medium">Analytics Coming Soon</p>
                <p className="text-sm text-gray/60 mt-1">Revenue trends will appear here</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray/10 mb-6">
          {[
            { id: 'users', label: 'Users' },
            { id: 'verifications', label: 'Verifications' },
            { id: 'payments', label: 'Payments' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-3 font-medium text-sm border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray hover:text-dark'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            {/* Search */}
            <form onSubmit={handleUserSearch} className="mb-4">
              <div className="flex gap-2 max-w-md">
                <Input
                  placeholder="Search by email or name..."
                  value={usersSearch}
                  onChange={(e) => setUsersSearch(e.target.value)}
                  icon={Search}
                />
                <Button type="submit" variant="outline">
                  Search
                </Button>
              </div>
            </form>

            {/* Users Table */}
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                {usersLoading ? (
                  <SkeletonTable rows={5} cols={6} />
                ) : users.length === 0 ? (
                  <div className="p-8 text-center text-gray">
                    No users found
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-gray/5">
                      <tr>
                        <th className="text-left p-4 font-medium text-dark">User</th>
                        <th className="text-left p-4 font-medium text-dark">Email</th>
                        <th className="text-left p-4 font-medium text-dark">Plan</th>
                        <th className="text-left p-4 font-medium text-dark">Credits</th>
                        <th className="text-left p-4 font-medium text-dark">Joined</th>
                        <th className="text-left p-4 font-medium text-dark">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-t border-gray/10 hover:bg-gray/5">
                          <td className="p-4">
                            <span className="font-medium text-dark">
                              {user.full_name || 'No name'}
                            </span>
                          </td>
                          <td className="p-4 text-gray">{user.email}</td>
                          <td className="p-4">
                            <PlanBadge plan={user.plan || 'free'} />
                          </td>
                          <td className="p-4 font-mono text-dark">{user.credits || 0}</td>
                          <td className="p-4 text-gray">
                            {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                          </td>
                          <td className="p-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setAdjustModal({ open: true, user })}
                            >
                              Adjust Credits
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Pagination */}
              {usersPagination.total > usersPagination.limit && (
                <div className="flex items-center justify-between p-4 border-t border-gray/10">
                  <span className="text-sm text-gray">
                    Showing {((usersPagination.page - 1) * usersPagination.limit) + 1} to{' '}
                    {Math.min(usersPagination.page * usersPagination.limit, usersPagination.total)} of{' '}
                    {usersPagination.total}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={usersPagination.page === 1}
                      onClick={() => {
                        setUsersPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                        fetchUsers()
                      }}
                      icon={ChevronLeft}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={usersPagination.page * usersPagination.limit >= usersPagination.total}
                      onClick={() => {
                        setUsersPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                        fetchUsers()
                      }}
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Verifications Tab */}
        {activeTab === 'verifications' && (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              {verificationsLoading ? (
                <SkeletonTable rows={5} cols={6} />
              ) : verifications.length === 0 ? (
                <div className="p-8 text-center text-gray">
                  No verifications found
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray/5">
                    <tr>
                      <th className="text-left p-4 font-medium text-dark">Type</th>
                      <th className="text-left p-4 font-medium text-dark">User</th>
                      <th className="text-left p-4 font-medium text-dark">Score</th>
                      <th className="text-left p-4 font-medium text-dark">Verdict</th>
                      <th className="text-left p-4 font-medium text-dark">Credits</th>
                      <th className="text-left p-4 font-medium text-dark">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verifications.map((v) => {
                      const Icon = typeIcons[v.content_type] || FileText
                      const score = v.ai_score ?? (1 - (v.human_score ?? 0.5))

                      return (
                        <tr key={v.id} className="border-t border-gray/10 hover:bg-gray/5">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4 text-gray" />
                              <span className="capitalize">{v.content_type}</span>
                            </div>
                          </td>
                          <td className="p-4 text-gray">{v.user_email || v.user?.email || '-'}</td>
                          <td className="p-4">
                            <span
                              className={cn(
                                'font-mono font-medium',
                                score >= 0.7 ? 'text-error' : score >= 0.3 ? 'text-warning' : 'text-success'
                              )}
                            >
                              {Math.round(score * 100)}%
                            </span>
                          </td>
                          <td className="p-4">
                            <VerdictBadge verdict={v.verdict} />
                          </td>
                          <td className="p-4 font-mono text-dark">{v.credits_used || 1}</td>
                          <td className="p-4 text-gray">
                            {v.created_at ? formatDateTime(v.created_at) : '-'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {verificationsPagination.total > verificationsPagination.limit && (
              <div className="flex items-center justify-between p-4 border-t border-gray/10">
                <span className="text-sm text-gray">
                  Showing {((verificationsPagination.page - 1) * verificationsPagination.limit) + 1} to{' '}
                  {Math.min(verificationsPagination.page * verificationsPagination.limit, verificationsPagination.total)} of{' '}
                  {verificationsPagination.total}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={verificationsPagination.page === 1}
                    onClick={() => {
                      setVerificationsPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                      fetchVerifications()
                    }}
                    icon={ChevronLeft}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={verificationsPagination.page * verificationsPagination.limit >= verificationsPagination.total}
                    onClick={() => {
                      setVerificationsPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                      fetchVerifications()
                    }}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              {paymentsLoading ? (
                <SkeletonTable rows={5} cols={6} />
              ) : payments.length === 0 ? (
                <div className="p-8 text-center text-gray">
                  No payments found
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray/5">
                    <tr>
                      <th className="text-left p-4 font-medium text-dark">User</th>
                      <th className="text-left p-4 font-medium text-dark">Amount</th>
                      <th className="text-left p-4 font-medium text-dark">Type</th>
                      <th className="text-left p-4 font-medium text-dark">Status</th>
                      <th className="text-left p-4 font-medium text-dark">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id} className="border-t border-gray/10 hover:bg-gray/5">
                        <td className="p-4 text-gray">{payment.user_email || payment.user?.email || '-'}</td>
                        <td className="p-4 font-mono font-medium text-dark">
                          ₹{(payment.amount || 0).toLocaleString()}
                        </td>
                        <td className="p-4 capitalize">{payment.type || payment.payment_type || '-'}</td>
                        <td className="p-4">
                          <StatusBadge status={payment.status || 'completed'} />
                        </td>
                        <td className="p-4 text-gray">
                          {payment.created_at ? formatDateTime(payment.created_at) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {paymentsPagination.total > paymentsPagination.limit && (
              <div className="flex items-center justify-between p-4 border-t border-gray/10">
                <span className="text-sm text-gray">
                  Showing {((paymentsPagination.page - 1) * paymentsPagination.limit) + 1} to{' '}
                  {Math.min(paymentsPagination.page * paymentsPagination.limit, paymentsPagination.total)} of{' '}
                  {paymentsPagination.total}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={paymentsPagination.page === 1}
                    onClick={() => {
                      setPaymentsPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                      fetchPayments()
                    }}
                    icon={ChevronLeft}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={paymentsPagination.page * paymentsPagination.limit >= paymentsPagination.total}
                    onClick={() => {
                      setPaymentsPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                      fetchPayments()
                    }}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Adjust Credits Modal */}
      <Modal
        isOpen={adjustModal.open}
        onClose={() => {
          setAdjustModal({ open: false, user: null })
          setAdjustAmount('')
          setAdjustReason('')
        }}
      >
        <h2 className="font-heading font-bold text-xl text-dark mb-4">
          Adjust Credits
        </h2>

        {adjustModal.user && (
          <div className="p-4 bg-gray/5 rounded-xl mb-4">
            <p className="font-medium text-dark">{adjustModal.user.full_name || 'No name'}</p>
            <p className="text-sm text-gray">{adjustModal.user.email}</p>
            <p className="text-sm mt-2">
              Current credits: <span className="font-mono font-medium">{adjustModal.user.credits || 0}</span>
            </p>
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Amount
            </label>
            <div className="flex gap-2">
              <Button
                variant={parseInt(adjustAmount) > 0 ? 'primary' : 'outline'}
                size="sm"
                icon={Plus}
                onClick={() => setAdjustAmount(Math.abs(parseInt(adjustAmount) || 0).toString())}
              >
                Add
              </Button>
              <Button
                variant={parseInt(adjustAmount) < 0 ? 'danger' : 'outline'}
                size="sm"
                icon={Minus}
                onClick={() => setAdjustAmount((-Math.abs(parseInt(adjustAmount) || 0)).toString())}
              >
                Remove
              </Button>
            </div>
            <Input
              type="number"
              value={adjustAmount}
              onChange={(e) => setAdjustAmount(e.target.value)}
              placeholder="Enter amount (e.g., 50 or -20)"
              className="mt-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Reason (optional)
            </label>
            <Input
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              placeholder="e.g., Customer support credit"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="ghost"
            fullWidth
            onClick={() => {
              setAdjustModal({ open: false, user: null })
              setAdjustAmount('')
              setAdjustReason('')
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            fullWidth
            loading={adjusting}
            disabled={!adjustAmount || adjustAmount === '0'}
            onClick={handleAdjustCredits}
          >
            {parseInt(adjustAmount) > 0 ? 'Add' : 'Remove'} Credits
          </Button>
        </div>
      </Modal>
    </DashboardLayout>
  )
}
