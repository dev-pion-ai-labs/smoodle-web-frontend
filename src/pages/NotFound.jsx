import { Link } from 'react-router-dom'
import { Home, LayoutDashboard } from 'lucide-react'
import { ROUTES } from '@utils/constants'
import { useAuthStore } from '@store/authStore'
import Button from '@components/common/Button'

export default function NotFound() {
  const isAuthenticated = useAuthStore((state) => !!state.accessToken)

  return (
    <div className="min-h-screen bg-light flex items-center justify-center p-4">
      <div className="text-center page-enter">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-primary-light rounded-full mb-4">
            <span className="font-heading text-6xl font-bold text-primary">
              404
            </span>
          </div>
        </div>

        <h1 className="font-heading text-3xl font-bold text-dark mb-4">
          Page not found
        </h1>
        <p className="text-gray text-lg mb-8 max-w-md mx-auto">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex gap-4 justify-center">
          <Link to={ROUTES.HOME}>
            <Button variant="outline" icon={Home}>
              Go Home
            </Button>
          </Link>
          {isAuthenticated && (
            <Link to={ROUTES.DASHBOARD}>
              <Button icon={LayoutDashboard}>
                Dashboard
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
