import { useEffect, useState } from 'react'
import axios from 'axios'
import { Toaster } from 'react-hot-toast'
import { HelmetProvider } from 'react-helmet-async'
import AppRouter from '@routes/AppRouter'
import { useAuthStore } from '@store/authStore'
import { getProfile, getSubscription } from '@services/userService'
import { API_BASE_URL } from '@utils/constants'

/**
 * Check if a JWT access token is expired or about to expire (within 60s).
 */
function isTokenExpired(token) {
  if (!token) return true
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 < Date.now() + 60000
  } catch {
    return true
  }
}

function App() {
  const accessToken = useAuthStore((state) => state.accessToken)
  const updateUser = useAuthStore((state) => state.updateUser)
  const [isAuthReady, setIsAuthReady] = useState(false)

  // Proactively refresh token on app load if access token is expired
  useEffect(() => {
    const initAuth = async () => {
      const storedAccessToken = localStorage.getItem('access_token')
      const storedRefreshToken = localStorage.getItem('refresh_token')

      // If we have a refresh token but the access token is expired/missing, refresh proactively
      if (storedRefreshToken && isTokenExpired(storedAccessToken)) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: storedRefreshToken,
          })

          const tokenData = response.data?.data || response.data
          const newAccessToken = tokenData?.access_token
          const newRefreshToken = tokenData?.refresh_token

          if (newAccessToken) {
            useAuthStore.getState().setTokens(newAccessToken, newRefreshToken || storedRefreshToken)
          } else {
            // Refresh returned no valid token — clear auth
            useAuthStore.getState().logout()
          }
        } catch {
          // Refresh failed (token expired/revoked) — clear auth
          useAuthStore.getState().logout()
        }
      }

      setIsAuthReady(true)
    }

    initAuth()
  }, [])

  // Fetch fresh profile + subscription once auth is ready and we have a valid token
  useEffect(() => {
    if (isAuthReady && accessToken) {
      Promise.all([
        getProfile().catch(() => null),
        getSubscription().catch(() => null),
      ]).then(([profile, sub]) => {
        const updates = { plan: sub?.plan || 'free' }
        if (profile?.credits !== undefined) {
          updates.credits = profile.credits
        }
        updateUser(updates)
      })
    }
  }, [isAuthReady, accessToken])

  // Don't render routes until auth state is resolved
  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <HelmetProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: 'DM Sans, sans-serif',
            borderRadius: '12px',
            padding: '12px 16px',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
            style: {
              border: '1px solid #10B98120',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
            style: {
              border: '1px solid #EF444420',
            },
          },
        }}
      />
      <AppRouter />
    </HelmetProvider>
  )
}

export default App
