import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  History,
  CreditCard,
  Settings,
  LogOut,
  Shield,
  ShieldCheck,
} from 'lucide-react'
import { useAuthStore } from '@store/authStore'
import { useUIStore } from '@store/uiStore'
import { ROUTES } from '@utils/constants'
import { cn } from '@utils/cn'
import logo from '@assets/logo.png'

// Navigation links
const navLinks = [
  { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: 'History', path: ROUTES.HISTORY, icon: History },
  { label: 'Pricing', path: ROUTES.PRICING, icon: CreditCard },
]

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const isAuthenticated = useAuthStore((state) => !!state.accessToken)
  const credits = user?.credits ?? 0
  const isAdmin = user?.role === 'admin' || user?.is_admin
  const isEnterprise = user?.plan === 'enterprise'

  const { mobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUIStore()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    closeMobileMenu()
  }, [location.pathname, closeMobileMenu])

  const handleLogout = () => {
    logout()
    setDropdownOpen(false)
    navigate(ROUTES.LOGIN)
  }

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/80 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.HOME} className="flex-shrink-0">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Smoodle" className="h-7 w-auto rounded-md" />
              <span className="font-heading font-semibold text-dark hidden sm:block">
                smoodle
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-0.5">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={cn(
                      'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'text-dark bg-gray-100'
                        : 'text-gray-600 hover:text-dark hover:bg-gray-50'
                    )}
                  >
                    {link.label}
                  </Link>
                )
              })}
              {isEnterprise && (
                <Link
                  to={ROUTES.AUDIT}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                    location.pathname.startsWith('/audit')
                      ? 'text-dark bg-gray-100'
                      : 'text-gray-600 hover:text-dark hover:bg-gray-50'
                  )}
                >
                  Audit
                </Link>
              )}
              {isAdmin && (
                <Link
                  to={ROUTES.ADMIN}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                    location.pathname === ROUTES.ADMIN
                      ? 'text-dark bg-gray-100'
                      : 'text-gray-600 hover:text-dark hover:bg-gray-50'
                  )}
                >
                  Admin
                </Link>
              )}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {/* Credits badge */}
                <div className="hidden sm:flex items-center px-2.5 py-1 bg-gray-100 rounded-md">
                  <span className="text-xs font-medium text-gray-700 font-mono">
                    {credits} credits
                  </span>
                </div>

                {/* User dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className={cn(
                      'flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-md transition-colors',
                      'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200',
                      dropdownOpen && 'bg-gray-50'
                    )}
                  >
                    {/* Avatar */}
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                      <span className="text-xs font-medium text-white">
                        {user?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <ChevronDown
                      className={cn(
                        'w-3.5 h-3.5 text-gray-500 transition-transform',
                        dropdownOpen && 'rotate-180'
                      )}
                    />
                  </button>

                  {/* Dropdown menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-lg shadow-lg border border-gray-200 py-1 animate-in fade-in slide-in-from-top-1 duration-150">
                      {/* User info */}
                      <div className="px-3 py-2 border-b border-gray-100">
                        <p className="font-medium text-sm text-dark truncate">
                          {user?.full_name || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>

                      {/* Credits (mobile) */}
                      <div className="sm:hidden px-3 py-2 border-b border-gray-100">
                        <p className="text-xs font-medium text-gray-700 font-mono">
                          {credits} credits
                        </p>
                      </div>

                      {/* Menu items */}
                      <div className="py-1">
                        <Link
                          to={ROUTES.SETTINGS}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-dark hover:bg-gray-50 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          Settings
                        </Link>
                        {isEnterprise && (
                          <Link
                            to={ROUTES.AUDIT}
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-dark hover:bg-gray-50 transition-colors"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            Document Audit
                          </Link>
                        )}
                        {isAdmin && (
                          <Link
                            to={ROUTES.ADMIN}
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-dark hover:bg-gray-50 transition-colors"
                          >
                            <Shield className="w-4 h-4" />
                            Admin Panel
                          </Link>
                        )}
                      </div>

                      {/* Logout */}
                      <div className="border-t border-gray-100 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Log out
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile menu button */}
                <button
                  onClick={toggleMobileMenu}
                  className="md:hidden p-1.5 rounded-md hover:bg-gray-50 transition-colors"
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? (
                    <X className="w-5 h-5 text-dark" />
                  ) : (
                    <Menu className="w-5 h-5 text-dark" />
                  )}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-1">
                <Link
                  to={ROUTES.LOGIN}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-dark rounded-md hover:bg-gray-50 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to={ROUTES.SIGNUP}
                  className="px-3 py-1.5 bg-dark text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isAuthenticated && mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200/80 bg-white animate-in slide-in-from-top-1 duration-150">
          <div className="px-3 py-2 space-y-0.5">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path
              const Icon = link.icon
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-gray-100 text-dark'
                      : 'text-gray-600 hover:text-dark hover:bg-gray-50'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              )
            })}
            {isEnterprise && (
              <Link
                to={ROUTES.AUDIT}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  location.pathname.startsWith('/audit')
                    ? 'bg-gray-100 text-dark'
                    : 'text-gray-600 hover:text-dark hover:bg-gray-50'
                )}
              >
                <ShieldCheck className="w-4 h-4" />
                Audit
              </Link>
            )}
            {isAdmin && (
              <Link
                to={ROUTES.ADMIN}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  location.pathname === ROUTES.ADMIN
                    ? 'bg-gray-100 text-dark'
                    : 'text-gray-600 hover:text-dark hover:bg-gray-50'
                )}
              >
                <Shield className="w-4 h-4" />
                Admin
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
