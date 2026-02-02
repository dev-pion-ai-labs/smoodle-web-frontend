import { Link } from 'react-router-dom'
import { ArrowLeft, LayoutDashboard, LogIn } from 'lucide-react'
import { ROUTES } from '@utils/constants'
import { useAuthStore } from '@store/authStore'
import Button from '@components/common/Button'
import logo from '@assets/logo.png'

export default function NotFound() {
  const isAuthenticated = useAuthStore((state) => !!state.accessToken)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <Link to={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.LOGIN} className="mb-12">
        <img src={logo} alt="Smoodle" className="h-8 w-auto rounded-md" />
      </Link>

      {/* 404 Content */}
      <div className="text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
        {/* 404 Number */}
        <div className="mb-6">
          <span className="font-heading text-8xl font-bold text-gray-200">
            404
          </span>
        </div>

        <h1 className="font-heading text-2xl font-semibold text-dark mb-2">
          Page not found
        </h1>
        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex gap-3 justify-center">
          {isAuthenticated ? (
            <>
              <Button
                variant="outline"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Go back
              </Button>
              <Link to={ROUTES.DASHBOARD}>
                <Button>
                  <LayoutDashboard className="w-4 h-4 mr-1.5" />
                  Dashboard
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Go back
              </Button>
              <Link to={ROUTES.LOGIN}>
                <Button>
                  <LogIn className="w-4 h-4 mr-1.5" />
                  Log in
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
