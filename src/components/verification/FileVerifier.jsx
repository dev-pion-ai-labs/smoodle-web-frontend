import { useState } from 'react'
import { Image, Music, ScanFace, Video, Coins, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { CREDIT_COSTS } from '@utils/constants'
import { verifyImage, verifyAudio, verifyVideo, verifyDeepfake } from '@services/verifyService'
import { getCurrentUser } from '@services/authService'
import { useAuthStore } from '@store/authStore'
import { useVerifyStore } from '@store/verifyStore'
import FileUpload from '@components/common/FileUpload'
import Button from '@components/common/Button'

const typeConfig = {
  image: {
    icon: Image,
    label: 'Image',
    verifyFn: verifyImage,
  },
  deepfake: {
    icon: ScanFace,
    label: 'Deepfake',
    verifyFn: verifyDeepfake,
  },
  audio: {
    icon: Music,
    label: 'Music',
    verifyFn: verifyAudio,
  },
  video: {
    icon: Video,
    label: 'Video',
    verifyFn: verifyVideo,
  },
}

/**
 * FileVerifier - File upload and verification for image/audio/video
 */
export default function FileVerifier({ type, onInsufficientCredits }) {
  const [file, setFile] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const credits = useAuthStore((state) => state.user?.credits ?? 0)
  const updateCredits = useAuthStore((state) => state.updateCredits)

  const { isVerifying, setVerifying, setCurrentResult, setVerifyError, addToHistory } = useVerifyStore()

  const config = typeConfig[type]
  const Icon = config.icon
  const creditCost = CREDIT_COSTS[type]

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile)
    setUploadProgress(0)
  }

  const handleFileRemove = () => {
    setFile(null)
    setUploadProgress(0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!file) {
      toast.error(`Please select a ${config.label.toLowerCase()} file`)
      return
    }

    // Check credits
    if (credits < creditCost) {
      onInsufficientCredits?.()
      return
    }

    setVerifying(true)
    setVerifyError(null)
    setUploadProgress(0)

    try {
      // verifyFn returns the result directly (not wrapped)
      const result = await config.verifyFn(file, (progress) => {
        setUploadProgress(progress)
      })

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

      // Clear file
      setFile(null)
      setUploadProgress(0)

      toast.success('Verification complete!')
    } catch (error) {
      setVerifyError(error)
      toast.error(error)
    } finally {
      setVerifying(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* File upload */}
      <FileUpload
        type={type}
        file={file}
        onFileSelect={handleFileSelect}
        onFileRemove={handleFileRemove}
        disabled={isVerifying}
      />

      {/* Upload progress */}
      {isVerifying && uploadProgress > 0 && uploadProgress < 100 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray">Uploading...</span>
            <span className="font-mono text-primary">{uploadProgress}%</span>
          </div>
          <div className="h-2 bg-gray/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Analyzing state */}
      {isVerifying && uploadProgress >= 100 && (
        <div className="flex items-center justify-center gap-2 p-4 bg-primary/5 rounded-xl">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-primary font-medium">Analyzing {config.label.toLowerCase()}...</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Credit cost badge */}
        <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 rounded-lg text-sm">
          <Coins className="w-4 h-4 text-primary" />
          <span className="text-dark">
            Costs <strong className="text-primary">{creditCost} credits</strong>
          </span>
        </div>

        <div className="flex-1" />

        {/* Submit button */}
        <Button
          type="submit"
          loading={isVerifying}
          disabled={!file || isVerifying}
          icon={Icon}
        >
          {isVerifying
            ? uploadProgress < 100
              ? 'Uploading...'
              : 'Analyzing...'
            : `Verify ${config.label}`}
        </Button>
      </div>

      {/* Credit warning */}
      {credits < creditCost && (
        <div className="flex items-center gap-2 p-3 bg-warning/10 rounded-xl text-sm text-warning">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>
            You need {creditCost} credits to verify {config.label.toLowerCase()}. You have {credits} credits.{' '}
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
