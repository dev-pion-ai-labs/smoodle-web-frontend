import { useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@utils/cn'
import { IconButton } from './Button'

/**
 * Modal component with backdrop fade and content scale animation
 *
 * @param {boolean} isOpen - Whether modal is open
 * @param {function} onClose - Close handler
 * @param {string} title - Modal title
 * @param {string} size - 'sm' | 'md' | 'lg' | 'xl' | 'full'
 * @param {boolean} closeOnBackdrop - Close when clicking backdrop
 * @param {boolean} closeOnEscape - Close when pressing Escape
 * @param {boolean} showCloseButton - Show X close button
 */

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]',
}

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  children,
  footer,
  className,
}) {
  // Handle Escape key
  const handleEscape = useCallback(
    (e) => {
      if (closeOnEscape && e.key === 'Escape') {
        onClose()
      }
    },
    [closeOnEscape, onClose]
  )

  // Add/remove escape listener and lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleEscape])

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop */}
      <div
        className={cn(
          'absolute inset-0 bg-dark/50 backdrop-blur-sm',
          'animate-in fade-in duration-200'
        )}
      />

      {/* Modal content */}
      <div
        className={cn(
          'relative w-full bg-white rounded-2xl shadow-xl',
          'animate-in fade-in zoom-in-95 duration-200',
          sizes[size],
          className
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between p-6 pb-0">
            <div>
              {title && (
                <h2
                  id="modal-title"
                  className="font-heading text-xl font-semibold text-dark"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-sm text-gray mt-1">{description}</p>
              )}
            </div>
            {showCloseButton && (
              <IconButton
                icon={X}
                label="Close modal"
                onClick={onClose}
                className="-mt-1 -mr-1"
              />
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-6">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 pb-6 pt-0 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

/**
 * Confirm Modal - Pre-built confirmation dialog
 */
export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}) {
  const buttonVariants = {
    danger: 'bg-error text-white hover:bg-error/90',
    primary: 'bg-primary text-white hover:bg-primary-dark',
    warning: 'bg-warning text-white hover:bg-warning/90',
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray hover:text-dark transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
              'hover:scale-[0.98] active:scale-95 disabled:opacity-50 disabled:hover:scale-100',
              buttonVariants[variant]
            )}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </>
      }
    >
      <p className="text-gray">{message}</p>
    </Modal>
  )
}

/**
 * Alert Modal - Simple alert dialog
 */
export function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  buttonText = 'OK',
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <button
          onClick={onClose}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-lg',
            'bg-primary text-white hover:bg-primary-dark',
            'transition-all duration-200 hover:scale-[0.98] active:scale-95'
          )}
        >
          {buttonText}
        </button>
      }
    >
      <p className="text-gray">{message}</p>
    </Modal>
  )
}
