import { FILE_SIZE_LIMITS, ACCEPTED_FILE_TYPES } from './constants'

/**
 * Format file size in human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format date with time
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date and time string
 */
export function formatDateTime(date) {
  return new Date(date).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Get relative time (e.g., "2 hours ago")
 * @param {string|Date} date - Date to compare
 * @returns {string} Relative time string
 */
export function getTimeAgo(date) {
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now - past) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`

  return formatDate(date)
}

/**
 * Validate file type and size
 * @param {File} file - File to validate
 * @param {'image'|'audio'|'video'} type - Content type
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateFile(file, type) {
  const acceptedTypes = ACCEPTED_FILE_TYPES[type]
  const maxSize = FILE_SIZE_LIMITS[type]

  if (!acceptedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Accepted formats: ${acceptedTypes.join(', ')}`,
    }
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${formatFileSize(maxSize)}`,
    }
  }

  return { valid: true }
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

/**
 * Format currency in INR
 * @param {number} amount - Amount in rupees
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Get verdict display info (label, color class)
 * @param {string} verdict - Verdict type
 * @returns {{ label: string, colorClass: string }}
 */
export function getVerdictInfo(verdict) {
  const verdicts = {
    ai_generated: {
      label: 'AI Generated',
      colorClass: 'bg-error/10 text-error',
    },
    human_created: {
      label: 'Human Created',
      colorClass: 'bg-success/10 text-success',
    },
    mixed: {
      label: 'Mixed',
      colorClass: 'bg-warning/10 text-warning',
    },
    inconclusive: {
      label: 'Inconclusive',
      colorClass: 'bg-gray/10 text-gray',
    },
  }

  return verdicts[verdict] || verdicts.inconclusive
}

/**
 * Get score color class based on AI probability
 * @param {number} aiScore - AI score (0-1)
 * @returns {string} Color class
 */
export function getScoreColor(aiScore) {
  if (aiScore >= 0.7) return 'text-error'
  if (aiScore >= 0.3) return 'text-warning'
  return 'text-success'
}

/**
 * Get score background color class based on AI probability
 * @param {number} aiScore - AI score (0-1)
 * @returns {string} Background color class
 */
export function getScoreBgColor(aiScore) {
  if (aiScore >= 0.7) return 'bg-error'
  if (aiScore >= 0.3) return 'bg-warning'
  return 'bg-success'
}

/**
 * Debounce function execution
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
