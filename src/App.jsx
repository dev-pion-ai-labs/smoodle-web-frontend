import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <div className="min-h-screen bg-light font-body text-dark">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: 'DM Sans, sans-serif',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />

      {/* Temporary placeholder - will be replaced with router */}
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-4xl font-bold text-dark mb-4">
            Smoodle <span className="text-primary">Verified</span>
          </h1>
          <p className="text-gray text-lg mb-8">
            AI Content Detection Platform
          </p>
          <div className="flex gap-4 justify-center">
            <button className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg">
              Get Started
            </button>
            <button className="px-6 py-3 bg-white text-dark border border-gray/20 rounded-xl font-medium hover:-translate-y-0.5 transition-all duration-200 shadow-sm hover:shadow-md">
              Learn More
            </button>
          </div>
          <p className="text-sm text-gray mt-8 font-mono">
            Phase 0 Complete - Ready for Phase 1
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
