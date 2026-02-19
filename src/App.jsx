import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { HelmetProvider } from 'react-helmet-async'
import AppRouter from '@routes/AppRouter'
import { useAuthStore } from '@store/authStore'
import { getProfile, getSubscription } from '@services/userService'

function App() {
  const rehydrate = useAuthStore((state) => state.rehydrate)
  const accessToken = useAuthStore((state) => state.accessToken)
  const updateUser = useAuthStore((state) => state.updateUser)

  // Rehydrate auth state on app load
  useEffect(() => {
    rehydrate()
  }, [rehydrate])

  // Fetch fresh profile + subscription on login / page load
  useEffect(() => {
    if (accessToken) {
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
  }, [accessToken])

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
