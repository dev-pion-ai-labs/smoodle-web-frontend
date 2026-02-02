import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { HelmetProvider } from 'react-helmet-async'
import AppRouter from '@routes/AppRouter'
import { useAuthStore } from '@store/authStore'

function App() {
  const rehydrate = useAuthStore((state) => state.rehydrate)

  // Rehydrate auth state on app load
  useEffect(() => {
    rehydrate()
  }, [rehydrate])

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
