import Navbar from './Navbar'

/**
 * DashboardLayout - Wraps authenticated pages with Navbar and main content area
 */
export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-light">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
