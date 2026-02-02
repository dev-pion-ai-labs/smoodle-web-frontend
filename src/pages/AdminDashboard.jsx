import DashboardLayout from '@components/layout/DashboardLayout'

export default function AdminDashboard() {
  return (
    <DashboardLayout>
      <div className="page-enter">
        <h1 className="font-heading text-2xl font-bold text-dark mb-6">
          Admin Dashboard
        </h1>
        <p className="text-gray">Admin dashboard - Phase 6</p>
      </div>
    </DashboardLayout>
  )
}
