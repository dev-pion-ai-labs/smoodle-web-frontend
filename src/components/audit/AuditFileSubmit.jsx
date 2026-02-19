import { useState, useRef, useCallback } from 'react'
import { Upload, FileText, X, Coins, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@utils/cn'
import { AUDIT_CREDIT_COST, FILE_SIZE_LIMITS, ACCEPTED_FILE_TYPES, FILE_EXTENSIONS } from '@utils/constants'
import { submitAuditFile } from '@services/auditService'
import { getCurrentUser } from '@services/authService'
import { useAuthStore } from '@store/authStore'
import Button from '@components/common/Button'

export default function AuditFileSubmit({ onSubmitSuccess, onInsufficientCredits }) {
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const inputRef = useRef(null)

  const credits = useAuthStore((state) => state.user?.credits ?? 0)
  const updateCredits = useAuthStore((state) => state.updateCredits)

  const validateFile = useCallback((f) => {
    if (!ACCEPTED_FILE_TYPES.audit.includes(f.type) && !f.name.match(/\.(pdf|docx|doc|txt)$/i)) {
      toast.error(`Invalid file type. Accepted: ${FILE_EXTENSIONS.audit}`)
      return false
    }
    if (f.size > FILE_SIZE_LIMITS.audit) {
      toast.error(`File too large. Maximum size is ${FILE_SIZE_LIMITS.audit / (1024 * 1024)}MB.`)
      return false
    }
    return true
  }, [])

  const handleFileSelect = (f) => {
    if (validateFile(f)) {
      setFile(f)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) handleFileSelect(droppedFile)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleInputChange = (e) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) handleFileSelect(selectedFile)
    e.target.value = ''
  }

  const handleRemoveFile = () => {
    setFile(null)
    setUploadProgress(0)
  }

  const handleSubmit = async () => {
    if (!file) return

    if (credits < AUDIT_CREDIT_COST) {
      onInsufficientCredits?.()
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      const result = await submitAuditFile(file, setUploadProgress)

      // Refresh credits
      try {
        const updatedUser = await getCurrentUser()
        updateCredits(updatedUser.credits)
      } catch {
        updateCredits(Math.max(0, credits - AUDIT_CREDIT_COST))
      }

      toast.success('Document submitted for audit!')
      onSubmitSuccess?.(result)
    } catch (error) {
      toast.error(error)
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      {!file ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200',
            dragOver
              ? 'border-primary bg-primary/5 scale-[1.01]'
              : 'border-gray/20 hover:border-primary/40 hover:bg-gray/5'
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={FILE_EXTENSIONS.audit}
            onChange={handleInputChange}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-3">
            <div className={cn(
              'w-14 h-14 rounded-2xl flex items-center justify-center transition-colors',
              dragOver ? 'bg-primary/10' : 'bg-gray/10'
            )}>
              <Upload className={cn('w-6 h-6', dragOver ? 'text-primary' : 'text-gray')} />
            </div>
            <div>
              <p className="font-medium text-dark">
                Drop your document here or <span className="text-primary">browse</span>
              </p>
              <p className="text-sm text-gray mt-1">
                {FILE_EXTENSIONS.audit} up to {FILE_SIZE_LIMITS.audit / (1024 * 1024)}MB
              </p>
            </div>
          </div>
        </div>
      ) : (
        // Selected file preview
        <div className="border border-gray/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-dark text-sm truncate">{file.name}</p>
              <p className="text-xs text-gray">{formatFileSize(file.size)}</p>
            </div>
            {!uploading && (
              <button
                onClick={handleRemoveFile}
                className="p-1.5 rounded-lg hover:bg-gray/10 text-gray hover:text-dark transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Upload progress */}
          {uploading && (
            <div className="mt-3">
              <div className="h-1.5 bg-gray/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray mt-1">{uploadProgress}% uploaded</p>
            </div>
          )}
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

        <Button
          onClick={handleSubmit}
          loading={uploading}
          disabled={!file || uploading}
          icon={FileText}
        >
          {uploading ? 'Submitting...' : 'Submit for Audit'}
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
    </div>
  )
}
