import { Link } from 'react-router-dom'
import { ROUTES } from '@utils/constants'
import logo from '@assets/logo.png'

/**
 * AuthLayout - Shared layout for all authentication pages
 * Centered card with logo, consistent styling
 */
export default function AuthLayout({
  children,
  title,
  subtitle,
  showBackToHome = true,
}) {
  return (
    <div className="min-h-screen bg-light flex flex-col">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to={ROUTES.HOME} className="inline-block">
              <img
                src={logo}
                alt="Smoodle"
                className="h-12 w-auto mx-auto rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200"
              />
            </Link>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Title */}
            {title && (
              <h1 className="font-heading text-2xl font-bold text-dark text-center mb-2">
                {title}
              </h1>
            )}

            {/* Subtitle */}
            {subtitle && (
              <p className="text-gray text-center mb-6">{subtitle}</p>
            )}

            {/* Form content */}
            {children}
          </div>

          {/* Back to home link */}
          {showBackToHome && (
            <p className="text-center mt-6 text-sm text-gray">
              <Link
                to={ROUTES.HOME}
                className="hover:text-primary transition-colors"
              >
                ← Back to home
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
