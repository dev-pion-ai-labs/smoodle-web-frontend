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
  Coins,
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
    <nav className="bg-white border-b border-gray/10 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.HOME} className="flex-shrink-0">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Smoodle" className="h-8 w-auto rounded-lg" />
              <span className="font-heading font-bold text-lg text-dark hidden sm:block">
                smoodle
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-gray hover:text-dark hover:bg-gray/5'
                    )}
                  >
                    {link.label}
                  </Link>
                )
              })}
              {isAdmin && (
                <Link
                  to={ROUTES.ADMIN}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    location.pathname === ROUTES.ADMIN
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray hover:text-dark hover:bg-gray/5'
                  )}
                >
                  Admin
                </Link>
              )}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Credits badge */}
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-primary-light rounded-full">
                  <Coins className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-primary font-mono">
                    {credits}
                  </span>
                </div>

                {/* User dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className={cn(
                      'flex items-center gap-2 p-1.5 rounded-lg transition-all duration-200',
                      'hover:bg-gray/5 focus:outline-none focus:ring-2 focus:ring-primary/50',
                      dropdownOpen && 'bg-gray/5'
                    )}
                  >
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        {user?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <ChevronDown
                      className={cn(
                        'w-4 h-4 text-gray transition-transform duration-200 hidden sm:block',
                        dropdownOpen && 'rotate-180'
                      )}
                    />
                  </button>

                  {/* Dropdown menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray/10 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* User info */}
                      <div className="px-4 py-2 border-b border-gray/10">
                        <p className="font-medium text-dark truncate">
                          {user?.full_name || 'User'}
                        </p>
                        <p className="text-sm text-gray truncate">{user?.email}</p>
                      </div>

                      {/* Credits (mobile) */}
                      <div className="sm:hidden px-4 py-2 border-b border-gray/10">
                        <div className="flex items-center gap-2 text-sm">
                          <Coins className="w-4 h-4 text-primary" />
                          <span className="font-semibold text-primary font-mono">
                            {credits} credits
                          </span>
                        </div>
                      </div>

                      {/* Menu items */}
                      <div className="py-1">
                        <Link
                          to={ROUTES.SETTINGS}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray hover:text-dark hover:bg-gray/5 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          Settings
                        </Link>
                        {isAdmin && (
                          <Link
                            to={ROUTES.ADMIN}
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray hover:text-dark hover:bg-gray/5 transition-colors"
                          >
                            <Shield className="w-4 h-4" />
                            Admin Panel
                          </Link>
                        )}
                      </div>

                      {/* Logout */}
                      <div className="border-t border-gray/10 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-error hover:bg-error/5 transition-colors"
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
                  className="md:hidden p-2 rounded-lg hover:bg-gray/5 transition-colors"
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
              <div className="flex items-center gap-2">
                <Link
                  to={ROUTES.LOGIN}
                  className="px-4 py-2 text-sm font-medium text-gray hover:text-dark transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to={ROUTES.SIGNUP}
                  className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-all duration-200 hover:scale-[0.98] active:scale-95"
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
        <div className="md:hidden border-t border-gray/10 bg-white animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path
              const Icon = link.icon
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray hover:text-dark hover:bg-gray/5'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {link.label}
                </Link>
              )
            })}
            {isAdmin && (
              <Link
                to={ROUTES.ADMIN}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                  location.pathname === ROUTES.ADMIN
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray hover:text-dark hover:bg-gray/5'
                )}
              >
                <Shield className="w-5 h-5" />
                Admin
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
