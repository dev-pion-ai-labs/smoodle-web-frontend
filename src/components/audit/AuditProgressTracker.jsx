import { useEffect, useRef, useState } from 'react'
import { Check, Loader2, Circle } from 'lucide-react'
import { cn } from '@utils/cn'
import { AUDIT_STEPS } from '@utils/constants'
import { getAuditStatus } from '@services/auditService'

const POLL_INTERVAL = 4000

export default function AuditProgressTracker({ auditId, onComplete, onFailed }) {
  const [currentStatus, setCurrentStatus] = useState('pending')
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!auditId) return

    const poll = async () => {
      try {
        const data = await getAuditStatus(auditId)
        const newStatus = data.status

        setCurrentStatus(newStatus)

        if (newStatus === 'complete') {
          clearInterval(intervalRef.current)
          onComplete?.(data)
        } else if (newStatus === 'failed') {
          clearInterval(intervalRef.current)
          onFailed?.(data)
        }
      } catch {
        // Don't stop polling on transient errors
      }
    }

    // Initial fetch
    poll()

    // Start polling
    intervalRef.current = setInterval(poll, POLL_INTERVAL)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [auditId])

  const currentStepIndex = AUDIT_STEPS.findIndex((s) => s.key === currentStatus)

  return (
    <div className="space-y-1">
      {AUDIT_STEPS.map((step, index) => {
        const isComplete = index < currentStepIndex || currentStatus === 'complete'
        const isActive = index === currentStepIndex && currentStatus !== 'complete' && currentStatus !== 'failed'
        const isPending = index > currentStepIndex

        return (
          <div key={step.key} className="flex items-start gap-3">
            {/* Step indicator + line */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300',
                  isComplete && 'bg-success text-white',
                  isActive && 'bg-primary/10 border-2 border-primary',
                  isPending && 'bg-gray/10 border border-gray/20'
                )}
              >
                {isComplete && <Check className="w-4 h-4" />}
                {isActive && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
                {isPending && <Circle className="w-3 h-3 text-gray/40" />}
              </div>

              {/* Connecting line */}
              {index < AUDIT_STEPS.length - 1 && (
                <div
                  className={cn(
                    'w-0.5 h-8 transition-colors duration-300',
                    isComplete ? 'bg-success' : 'bg-gray/15'
                  )}
                />
              )}
            </div>

            {/* Step label */}
            <div className="pt-1.5">
              <p
                className={cn(
                  'text-sm font-medium transition-colors duration-300',
                  isComplete && 'text-success',
                  isActive && 'text-dark',
                  isPending && 'text-gray/50'
                )}
              >
                {step.label}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
