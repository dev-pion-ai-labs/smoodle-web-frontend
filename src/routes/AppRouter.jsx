import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ROUTES } from '@utils/constants'
import PrivateRoute from './PrivateRoute'
import AdminRoute from './AdminRoute'
import PageLoader from '@components/common/Loader'

// Lazy load all pages for better performance
const Landing = lazy(() => import('@pages/Landing'))
const Login = lazy(() => import('@pages/Login'))
const Signup = lazy(() => import('@pages/Signup'))
const VerifyOTP = lazy(() => import('@pages/VerifyOTP'))
const ForgotPassword = lazy(() => import('@pages/ForgotPassword'))
const ResetPassword = lazy(() => import('@pages/ResetPassword'))
const GoogleCallback = lazy(() => import('@pages/GoogleCallback'))
const Dashboard = lazy(() => import('@pages/Dashboard'))
const History = lazy(() => import('@pages/History'))
const Pricing = lazy(() => import('@pages/Pricing'))
const Settings = lazy(() => import('@pages/Settings'))
const AdminDashboard = lazy(() => import('@pages/AdminDashboard'))
const NotFound = lazy(() => import('@pages/NotFound'))

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
          <Route path={ROUTES.HOME} element={<Landing />} />
          <Route path={ROUTES.LOGIN} element={<Login />} />
          <Route path={ROUTES.SIGNUP} element={<Signup />} />
          <Route path={ROUTES.VERIFY_OTP} element={<VerifyOTP />} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
          <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
          <Route path={ROUTES.GOOGLE_CALLBACK} element={<GoogleCallback />} />
          <Route path={ROUTES.PRICING} element={<Pricing />} />

          {/* Protected routes */}
          <Route
            path={ROUTES.DASHBOARD}
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path={ROUTES.HISTORY}
            element={
              <PrivateRoute>
                <History />
              </PrivateRoute>
            }
          />
          <Route
            path={ROUTES.SETTINGS}
            element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path={ROUTES.ADMIN}
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          {/* Catch-all 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
