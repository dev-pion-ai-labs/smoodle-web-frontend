import { useState, useRef, useCallback } from 'react'
import { Upload, X, File, Image, Music, ScanFace, Video, AlertCircle } from 'lucide-react'
import { cn } from '@utils/cn'
import { formatFileSize, validateFile } from '@utils/helpers'
import { FILE_EXTENSIONS, FILE_SIZE_LIMITS } from '@utils/constants'

/**
 * FileUpload component with drag-and-drop, preview, and validation
 *
 * @param {string} type - 'image' | 'audio' | 'video'
 * @param {function} onFileSelect - Callback when file is selected
 * @param {function} onFileRemove - Callback when file is removed
 * @param {File} file - Currently selected file
 * @param {string} error - External error message
 * @param {boolean} disabled - Disable upload
 */

const typeConfig = {
  image: {
    icon: Image,
    label: 'image',
    accept: 'image/jpeg,image/png,image/gif,image/webp',
    color: 'text-blue-500 bg-blue-50',
  },
  deepfake: {
    icon: ScanFace,
    label: 'image or video',
    accept: 'image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime,video/x-msvideo,video/x-matroska,video/webm',
    color: 'text-rose-500 bg-rose-50',
  },
  audio: {
    icon: Music,
    label: 'music file',
    accept: 'audio/mpeg,audio/wav,audio/ogg,audio/mp4,audio/x-m4a',
    color: 'text-amber-500 bg-amber-50',
  },
  video: {
    icon: Video,
    label: 'video',
    accept: 'video/mp4,video/quicktime,video/x-msvideo,video/x-matroska,video/webm',
    color: 'text-purple-500 bg-purple-50',
  },
}

export default function FileUpload({
  type = 'image',
  onFileSelect,
  onFileRemove,
  file,
  error: externalError,
  disabled = false,
  className,
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [internalError, setInternalError] = useState(null)
  const [preview, setPreview] = useState(null)
  const inputRef = useRef(null)

  const config = typeConfig[type]
  const Icon = config.icon
  const error = externalError || internalError
  const maxSize = FILE_SIZE_LIMITS[type]

  // Handle file validation and selection
  const handleFile = useCallback(
    (selectedFile) => {
      setInternalError(null)

      if (!selectedFile) return

      // Validate file
      const validation = validateFile(selectedFile, type)
      if (!validation.valid) {
        setInternalError(validation.error)
        return
      }

      // Create preview for images (including deepfake image uploads)
      if ((type === 'image' || (type === 'deepfake' && selectedFile.type.startsWith('image/'))) && selectedFile.type.startsWith('image/')) {
        const url = URL.createObjectURL(selectedFile)
        setPreview(url)
      } else {
        setPreview(null)
      }

      onFileSelect?.(selectedFile)
    },
    [type, onFileSelect]
  )

  // Handle drag events
  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) setIsDragging(true)
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

    if (disabled) return

    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      handleFile(droppedFile)
    }
  }

  // Handle file input change
  const handleInputChange = (e) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFile(selectedFile)
    }
    // Reset input to allow selecting same file again
    e.target.value = ''
  }

  // Handle file removal
  const handleRemove = () => {
    if (preview) {
      URL.revokeObjectURL(preview)
      setPreview(null)
    }
    setInternalError(null)
    onFileRemove?.()
  }

  // Trigger file input click
  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click()
    }
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Drop zone or preview */}
      {!file ? (
        // Drop zone
        <div
          onClick={handleClick}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={cn(
            // Base styles
            'relative flex flex-col items-center justify-center',
            'border-2 border-dashed rounded-xl p-8',
            'cursor-pointer transition-all duration-200',
            // Normal state
            'border-gray/30 bg-gray/5 hover:border-primary/50 hover:bg-primary/5',
            // Dragging state
            isDragging && 'border-primary bg-primary/10 scale-[1.02]',
            // Error state
            error && 'border-error/50 bg-error/5',
            // Disabled state
            disabled && 'opacity-50 cursor-not-allowed hover:border-gray/30 hover:bg-gray/5'
          )}
        >
          {/* Hidden file input */}
          <input
            ref={inputRef}
            type="file"
            accept={config.accept}
            onChange={handleInputChange}
            disabled={disabled}
            className="hidden"
          />

          {/* Icon */}
          <div
            className={cn(
              'w-14 h-14 rounded-full flex items-center justify-center mb-4',
              'transition-transform duration-200',
              isDragging && 'scale-110',
              config.color
            )}
          >
            <Icon className="w-7 h-7" />
          </div>

          {/* Text */}
          <p className="text-center">
            <span className="font-medium text-dark">
              {isDragging ? 'Drop file here' : 'Drop file here or'}
            </span>
            {!isDragging && (
              <span className="text-primary font-medium"> browse</span>
            )}
          </p>

          {/* Supported formats */}
          <p className="text-sm text-gray mt-2">
            Supported: {FILE_EXTENSIONS[type]}
          </p>

          {/* Size limit */}
          <p className="text-xs text-gray/70 mt-1">
            Max size: {formatFileSize(maxSize)}
          </p>
        </div>
      ) : (
        // File preview
        <div
          className={cn(
            'relative rounded-xl border border-gray/20 bg-white p-4',
            'transition-all duration-200'
          )}
        >
          <div className="flex items-start gap-4">
            {/* Thumbnail or icon */}
            {(type === 'image' || type === 'deepfake') && preview ? (
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray/10 flex-shrink-0">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div
                className={cn(
                  'w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0',
                  config.color
                )}
              >
                <Icon className="w-7 h-7" />
              </div>
            )}

            {/* File info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-dark truncate">{file.name}</p>
              <p className="text-sm text-gray mt-0.5">
                {formatFileSize(file.size)}
              </p>
            </div>

            {/* Remove button */}
            <button
              onClick={handleRemove}
              className={cn(
                'p-1.5 rounded-lg',
                'text-gray hover:text-error hover:bg-error/10',
                'transition-colors duration-200'
              )}
              aria-label="Remove file"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-error animate-in fade-in slide-in-from-top-1 duration-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

/**
 * Compact file upload button variant
 */
export function FileUploadButton({
  type = 'image',
  onFileSelect,
  disabled = false,
  children = 'Upload File',
  className,
}) {
  const inputRef = useRef(null)
  const config = typeConfig[type]

  const handleChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const validation = validateFile(file, type)
      if (validation.valid) {
        onFileSelect?.(file)
      }
    }
    e.target.value = ''
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={config.accept}
        onChange={handleChange}
        disabled={disabled}
        className="hidden"
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className={cn(
          'inline-flex items-center gap-2 px-4 py-2',
          'bg-white border border-gray/20 rounded-xl',
          'text-sm font-medium text-dark',
          'hover:border-primary hover:text-primary',
          'transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
      >
        <Upload className="w-4 h-4" />
        {children}
      </button>
    </>
  )
}
