/**
 * Razorpay Integration Utility
 * Handles dynamic script loading and checkout modal
 */

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js'
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID

let scriptLoaded = false
let scriptLoading = false
let loadPromise = null

/**
 * Dynamically load Razorpay checkout script
 * @returns {Promise<void>}
 */
export function loadRazorpayScript() {
  // Already loaded
  if (scriptLoaded && window.Razorpay) {
    return Promise.resolve()
  }

  // Currently loading, return existing promise
  if (scriptLoading && loadPromise) {
    return loadPromise
  }

  // Start loading
  scriptLoading = true
  loadPromise = new Promise((resolve, reject) => {
    // Check if script tag already exists
    const existingScript = document.querySelector(`script[src="${RAZORPAY_SCRIPT_URL}"]`)
    if (existingScript) {
      if (window.Razorpay) {
        scriptLoaded = true
        scriptLoading = false
        resolve()
        return
      }
      // Script exists but not loaded yet, wait for it
      existingScript.addEventListener('load', () => {
        scriptLoaded = true
        scriptLoading = false
        resolve()
      })
      existingScript.addEventListener('error', () => {
        scriptLoading = false
        reject(new Error('Failed to load Razorpay script'))
      })
      return
    }

    // Create and append script
    const script = document.createElement('script')
    script.src = RAZORPAY_SCRIPT_URL
    script.async = true

    script.onload = () => {
      scriptLoaded = true
      scriptLoading = false
      resolve()
    }

    script.onerror = () => {
      scriptLoading = false
      reject(new Error('Failed to load Razorpay script'))
    }

    document.body.appendChild(script)
  })

  return loadPromise
}

/**
 * Open Razorpay checkout modal
 * @param {object} options - Checkout options
 * @param {string} options.order_id - Razorpay order ID
 * @param {number} options.amount - Amount in paise (INR smallest unit)
 * @param {string} options.currency - Currency code (default: INR)
 * @param {string} options.name - Business name
 * @param {string} options.description - Payment description
 * @param {object} options.prefill - Prefill data
 * @param {string} options.prefill.email - User email
 * @param {string} options.prefill.name - User name
 * @param {function} options.onSuccess - Success callback (payment_id, order_id, signature)
 * @param {function} options.onError - Error callback (error)
 * @param {function} options.onDismiss - Modal dismiss callback
 * @returns {Promise<object>} Razorpay instance
 */
export async function openRazorpayCheckout(options) {
  // Ensure script is loaded
  await loadRazorpayScript()

  if (!window.Razorpay) {
    throw new Error('Razorpay not available')
  }

  if (!RAZORPAY_KEY_ID) {
    throw new Error('Razorpay key not configured')
  }

  const {
    order_id,
    amount,
    currency = 'INR',
    name = 'Smoodle Verified',
    description = 'Credits Purchase',
    prefill = {},
    onSuccess,
    onError,
    onDismiss,
  } = options

  return new Promise((resolve, reject) => {
    const razorpayOptions = {
      key: RAZORPAY_KEY_ID,
      amount,
      currency,
      name,
      description,
      order_id,
      prefill: {
        email: prefill.email || '',
        name: prefill.name || '',
        contact: prefill.phone || '',
      },
      theme: {
        color: '#E8453C', // Smoodle brand color
      },
      modal: {
        ondismiss: () => {
          onDismiss?.()
          resolve({ dismissed: true })
        },
      },
      handler: (response) => {
        // Payment successful
        const result = {
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
        }
        onSuccess?.(result)
        resolve(result)
      },
    }

    try {
      const razorpay = new window.Razorpay(razorpayOptions)

      razorpay.on('payment.failed', (response) => {
        const error = {
          code: response.error.code,
          description: response.error.description,
          source: response.error.source,
          step: response.error.step,
          reason: response.error.reason,
        }
        onError?.(error)
        reject(error)
      })

      razorpay.open()
    } catch (err) {
      onError?.(err)
      reject(err)
    }
  })
}

/**
 * Check if Razorpay is available
 * @returns {boolean}
 */
export function isRazorpayAvailable() {
  return scriptLoaded && !!window.Razorpay
}

export default {
  loadRazorpayScript,
  openRazorpayCheckout,
  isRazorpayAvailable,
}
