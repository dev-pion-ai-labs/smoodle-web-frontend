import { useState } from 'react'
import { FileText, Coins, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@utils/cn'
import { AUDIT_CREDIT_COST } from '@utils/constants'
import { submitAuditText } from '@services/auditService'
import { getCurrentUser } from '@services/authService'
import { useAuthStore } from '@store/authStore'
import { Input } from '@components/common/Input'
import { Textarea } from '@components/common/Input'
import Button from '@components/common/Button'

const MIN_CHARS = 100
const MAX_CHARS = 500000

export default function AuditTextSubmit({ onSubmitSuccess, onInsufficientCredits }) {
  const [documentName, setDocumentName] = useState('')
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const credits = useAuthStore((state) => state.user?.credits ?? 0)
  const updateCredits = useAuthStore((state) => state.updateCredits)

  const charCount = text.length
  const isValid = charCount >= MIN_CHARS && charCount <= MAX_CHARS && documentName.trim().length > 0

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (credits < AUDIT_CREDIT_COST) {
      onInsufficientCredits?.()
      return
    }

    if (!isValid) {
      if (!documentName.trim()) {
        toast.error('Document name is required')
      } else {
        toast.error(`Text must be between ${MIN_CHARS} and ${MAX_CHARS.toLocaleString()} characters`)
      }
      return
    }

    setSubmitting(true)

    try {
      const result = await submitAuditText(text, documentName.trim())

      // Refresh credits
      try {
        const updatedUser = await getCurrentUser()
        updateCredits(updatedUser.credits)
      } catch {
        updateCredits(Math.max(0, credits - AUDIT_CREDIT_COST))
      }

      toast.success('Text submitted for audit!')
      onSubmitSuccess?.(result)
    } catch (error) {
      toast.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Document name */}
      <Input
        label="Document Name"
        value={documentName}
        onChange={(e) => setDocumentName(e.target.value)}
        placeholder="e.g. Research Paper, Contract, Report"
        disabled={submitting}
      />

      {/* Text area */}
      <div className="relative">
        <Textarea
          label="Document Content"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your document text here for fact-checking..."
          rows={12}
          disabled={submitting}
          className="resize-none"
        />

        {/* Character count */}
        <div className="absolute bottom-3 right-3">
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
            Costs <strong className="text-primary">{AUDIT_CREDIT_COST} credits</strong>
          </span>
        </div>

        <div className="flex-1" />

        {/* Clear button */}
        {(text.length > 0 || documentName.length > 0) && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => { setText(''); setDocumentName('') }}
            disabled={submitting}
          >
            Clear
          </Button>
        )}

        <Button
          type="submit"
          loading={submitting}
          disabled={!isValid || submitting}
          icon={FileText}
        >
          {submitting ? 'Submitting...' : 'Submit for Audit'}
        </Button>
      </div>

      {/* Credit warning */}
      {credits < AUDIT_CREDIT_COST && (
        <div className="flex items-center gap-2 p-3 bg-warning/10 rounded-xl text-sm text-warning">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>
            You need {AUDIT_CREDIT_COST} credits for an audit. You have {credits} credits.{' '}
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
