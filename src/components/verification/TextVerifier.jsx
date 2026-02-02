import { useState } from 'react'
import { FileText, Coins, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@utils/cn'
import { CREDIT_COSTS } from '@utils/constants'
import { verifyText } from '@services/verifyService'
import { getCurrentUser } from '@services/authService'
import { useAuthStore } from '@store/authStore'
import { useVerifyStore } from '@store/verifyStore'
import { Textarea } from '@components/common/Input'
import Button from '@components/common/Button'

const MIN_CHARS = 50
const MAX_CHARS = 150000

/**
 * TextVerifier - Text verification input and submission
 */
export default function TextVerifier({ onInsufficientCredits }) {
  const [text, setText] = useState('')
  const credits = useAuthStore((state) => state.user?.credits ?? 0)
  const updateCredits = useAuthStore((state) => state.updateCredits)

  const { isVerifying, setVerifying, setCurrentResult, setVerifyError, addToHistory } = useVerifyStore()

  const charCount = text.length
  const isValid = charCount >= MIN_CHARS && charCount <= MAX_CHARS
  const creditCost = CREDIT_COSTS.text

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Check credits
    if (credits < creditCost) {
      onInsufficientCredits?.()
      return
    }

    // Validate text
    if (!isValid) {
      toast.error(`Text must be between ${MIN_CHARS} and ${MAX_CHARS.toLocaleString()} characters`)
      return
    }

    setVerifying(true)
    setVerifyError(null)

    try {
      // verifyText returns the result directly (not wrapped)
      const result = await verifyText(text)

      // Update local state
      setCurrentResult(result)
      addToHistory(result)

      // Fetch updated user to get accurate credits from backend
      try {
        const updatedUser = await getCurrentUser()
        updateCredits(updatedUser.credits)
      } catch {
        // Fallback: deduct locally if user fetch fails
        updateCredits(Math.max(0, credits - 1))
      }

      toast.success('Verification complete!')
    } catch (error) {
      setVerifyError(error)
      toast.error(error)
    } finally {
      setVerifying(false)
    }
  }

  const handleClear = () => {
    setText('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Textarea */}
      <div className="relative">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your text here to verify if it's AI-generated or human-written..."
          rows={10}
          disabled={isVerifying}
          className="resize-none"
        />

        {/* Character count */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <span
            className={cn(
              'text-xs font-mono',
              charCount < MIN_CHARS
                ? 'text-warning'
                : charCount > MAX_CHARS
                ? 'text-error'
                : 'text-gray'
            )}
          >
            {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Minimum characters hint */}
      {charCount > 0 && charCount < MIN_CHARS && (
        <div className="flex items-center gap-2 text-sm text-warning">
          <AlertCircle className="w-4 h-4" />
          <span>Minimum {MIN_CHARS} characters required ({MIN_CHARS - charCount} more needed)</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Credit cost badge */}
        <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 rounded-lg text-sm">
          <Coins className="w-4 h-4 text-primary" />
          <span className="text-dark">
            Costs <strong className="text-primary">{creditCost} credit</strong>
          </span>
        </div>

        <div className="flex-1" />

        {/* Clear button */}
        {text.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            onClick={handleClear}
            disabled={isVerifying}
          >
            Clear
          </Button>
        )}

        {/* Submit button */}
        <Button
          type="submit"
          loading={isVerifying}
          disabled={!isValid || isVerifying}
          icon={FileText}
        >
          {isVerifying ? 'Analyzing...' : 'Verify Text'}
        </Button>
      </div>

      {/* Credit warning */}
      {credits < creditCost && (
        <div className="flex items-center gap-2 p-3 bg-warning/10 rounded-xl text-sm text-warning">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>
            You need {creditCost} credit to verify text. You have {credits} credits.{' '}
            <button
              type="button"
              onClick={onInsufficientCredits}
              className="font-medium underline hover:no-underline"
            >
              Get more credits
            </button>
          </span>
        </div>
      )}
    </form>
  )
}
