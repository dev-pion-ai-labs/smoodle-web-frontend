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
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-primary/5 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md">
          {/* Logo and branding */}
          <div className="text-center mb-8">
            <Link to={ROUTES.LOGIN} className="inline-block">
              <img
                src={logo}
                alt="Smoodle"
                className="h-10 w-auto mx-auto rounded-lg"
              />
            </Link>
            <p className="text-gray-500 text-sm mt-3">
              AI content verification platform
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Title */}
            {title && (
              <h1 className="font-heading text-xl font-semibold text-dark text-center mb-1">
                {title}
              </h1>
            )}

            {/* Subtitle */}
            {subtitle && (
              <p className="text-gray-500 text-sm text-center mb-6">{subtitle}</p>
            )}

            {/* Form content */}
            {children}
          </div>

          {/* Footer */}
          <p className="text-center mt-6 text-xs text-gray-400">
            Powered by advanced AI detection technology
          </p>
        </div>
      </div>
    </div>
  )
}
