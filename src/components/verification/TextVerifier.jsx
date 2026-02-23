import { useState, useRef, useCallback } from 'react'
import { FileText, Upload, Type, Coins, AlertCircle, X, File as FileIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@utils/cn'
import { CREDIT_COSTS } from '@utils/constants'
import { formatFileSize } from '@utils/helpers'
import { verifyText } from '@services/verifyService'
import { getCurrentUser } from '@services/authService'
import { useAuthStore } from '@store/authStore'
import { useVerifyStore } from '@store/verifyStore'
import { Textarea } from '@components/common/Input'
import Button from '@components/common/Button'

const MIN_CHARS = 50
const MAX_CHARS = 150000
const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB
const ACCEPTED_DOC_EXTENSIONS = '.txt, .pdf, .docx, .doc'
const ACCEPTED_DOC_MIMES = [
  'text/plain',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
]

/**
 * Extract text content from a document file (txt, pdf, docx, doc).
 * Libraries are lazy-loaded to keep the initial bundle small.
 */
async function extractTextFromFile(file) {
  const name = file.name.toLowerCase()

  // Plain text
  if (file.type === 'text/plain' || name.endsWith('.txt')) {
    return await file.text()
  }

  // PDF — lazy-load pdfjs-dist
  if (file.type === 'application/pdf' || name.endsWith('.pdf')) {
    const pdfjsLib = await import('pdfjs-dist')
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

    const pages = []
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const pageText = content.items.map((item) => item.str).join(' ')
      pages.push(pageText)
    }
    return pages.join('\n\n')
  }

  // DOCX / DOC — lazy-load mammoth
  if (
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.type === 'application/msword' ||
    name.endsWith('.docx') ||
    name.endsWith('.doc')
  ) {
    const mammoth = await import('mammoth')
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer })
    return result.value
  }

  throw new Error('Unsupported file type')
}

/**
 * TextVerifier - Text verification via paste or file upload
 */
export default function TextVerifier({ onInsufficientCredits }) {
  const [mode, setMode] = useState('paste') // 'paste' | 'upload'
  const [text, setText] = useState('')
  const [sourceFile, setSourceFile] = useState(null) // { name, size }
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractError, setExtractError] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const credits = useAuthStore((state) => state.user?.credits ?? 0)
  const updateCredits = useAuthStore((state) => state.updateCredits)
  const { isVerifying, setVerifying, setCurrentResult, setVerifyError, addToHistory } = useVerifyStore()

  const charCount = text.length
  const isValid = charCount >= MIN_CHARS && charCount <= MAX_CHARS
  const creditCost = CREDIT_COSTS.text

  // ── File handling ──────────────────────────────────────────────

  const handleFileSelect = useCallback(async (file) => {
    setExtractError(null)

    // Validate type
    if (!ACCEPTED_DOC_MIMES.includes(file.type) && !file.name.match(/\.(txt|pdf|docx|doc)$/i)) {
      setExtractError(`Unsupported file type. Accepted: ${ACCEPTED_DOC_EXTENSIONS}`)
      return
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      setExtractError(`File too large. Maximum size: ${formatFileSize(MAX_FILE_SIZE)}`)
      return
    }

    setIsExtracting(true)

    try {
      const extractedText = await extractTextFromFile(file)

      if (!extractedText || extractedText.trim().length === 0) {
        setExtractError('No text could be extracted from this file. The file may be empty or contain only images.')
        return
      }

      setText(extractedText.trim())
      setSourceFile({ name: file.name, size: file.size })
      setMode('paste')
      toast.success(`Text extracted from ${file.name}`)
    } catch (err) {
      console.error('Text extraction error:', err)
      setExtractError('Failed to extract text. Please try a different file or paste text directly.')
    } finally {
      setIsExtracting(false)
    }
  }, [])

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isExtracting) setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileSelect(file)
  }

  const handleInputChange = (e) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
    e.target.value = ''
  }

  // ── Verification ───────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (credits < creditCost) {
      onInsufficientCredits?.()
      return
    }

    if (!isValid) {
      toast.error(`Text must be between ${MIN_CHARS} and ${MAX_CHARS.toLocaleString()} characters`)
      return
    }

    setVerifying(true)
    setVerifyError(null)

    try {
      const result = await verifyText(text)
      setCurrentResult(result)
      addToHistory(result)

      try {
        const updatedUser = await getCurrentUser()
        updateCredits(updatedUser.credits)
      } catch {
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
    setSourceFile(null)
    setExtractError(null)
  }

  // ── Render ─────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Input Mode Toggle */}
      <div className="flex items-center gap-1 p-1 bg-gray/5 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setMode('paste')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
            mode === 'paste'
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray hover:text-dark'
          )}
        >
          <Type className="w-4 h-4" />
          Paste Text
        </button>
        <button
          type="button"
          onClick={() => { setMode('upload'); setExtractError(null) }}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
            mode === 'upload'
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray hover:text-dark'
          )}
        >
          <Upload className="w-4 h-4" />
          Upload File
        </button>
      </div>

      {/* Source file badge (shown when text was extracted from a file) */}
      {sourceFile && mode === 'paste' && (
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg text-sm animate-in fade-in duration-200">
          <FileIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
          <span className="text-blue-700 truncate">
            Extracted from <strong>{sourceFile.name}</strong> ({formatFileSize(sourceFile.size)})
          </span>
          <button
            type="button"
            onClick={() => setSourceFile(null)}
            className="ml-auto p-0.5 rounded hover:bg-blue-100 text-blue-400 hover:text-blue-600 transition-colors flex-shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── Paste Mode ──────────────────────────────────────────── */}
      {mode === 'paste' && (
        <>
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
        </>
      )}

      {/* ── Upload Mode ─────────────────────────────────────────── */}
      {mode === 'upload' && (
        <>
          {isExtracting ? (
            /* Extracting spinner */
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-primary/30 bg-primary/5 rounded-xl p-12">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mb-4" />
              <p className="text-sm font-medium text-dark">Extracting text...</p>
              <p className="text-xs text-gray mt-1">This may take a moment for large files</p>
            </div>
          ) : (
            /* Drop zone */
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={cn(
                'relative flex flex-col items-center justify-center',
                'border-2 border-dashed rounded-xl p-12',
                'cursor-pointer transition-all duration-200',
                'border-gray/30 bg-gray/5 hover:border-primary/50 hover:bg-primary/5',
                isDragging && 'border-primary bg-primary/10 scale-[1.02]',
                extractError && 'border-error/50 bg-error/5'
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.pdf,.docx,.doc"
                onChange={handleInputChange}
                className="hidden"
              />

              <div
                className={cn(
                  'w-14 h-14 rounded-full flex items-center justify-center mb-4',
                  'transition-transform duration-200',
                  isDragging && 'scale-110',
                  'text-primary bg-primary/10'
                )}
              >
                <Upload className="w-7 h-7" />
              </div>

              <p className="text-center">
                <span className="font-medium text-dark">
                  {isDragging ? 'Drop file here' : 'Drop your document here or'}
                </span>
                {!isDragging && (
                  <span className="text-primary font-medium"> browse</span>
                )}
              </p>

              <p className="text-sm text-gray mt-2">
                Supported: {ACCEPTED_DOC_EXTENSIONS}
              </p>
              <p className="text-xs text-gray/70 mt-1">
                Max size: {formatFileSize(MAX_FILE_SIZE)}
              </p>
            </div>
          )}

          {/* Extraction error */}
          {extractError && (
            <div className="flex items-center gap-2 text-sm text-error animate-in fade-in slide-in-from-top-1 duration-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{extractError}</span>
            </div>
          )}
        </>
      )}

      {/* ── Actions ─────────────────────────────────────────────── */}
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
