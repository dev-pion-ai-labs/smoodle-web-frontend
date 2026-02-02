import { Link } from 'react-router-dom'
import { ROUTES } from '@utils/constants'

export default function Landing() {
  return (
    <div className="min-h-screen bg-light">
      {/* Placeholder - will be built in Phase 7 */}
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-5xl font-bold text-dark mb-4">
            Is it real or AI?
          </h1>
          <p className="text-xl text-gray mb-8">Find out in seconds.</p>
          <div className="flex gap-4 justify-center">
            <Link
              to={ROUTES.SIGNUP}
              className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-all duration-200"
            >
              Try Free
            </Link>
            <Link
              to={ROUTES.PRICING}
              className="px-6 py-3 bg-white text-dark border border-gray/20 rounded-xl font-medium hover:shadow-md transition-all duration-200"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
