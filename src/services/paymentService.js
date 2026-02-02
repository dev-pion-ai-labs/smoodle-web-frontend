import api from './api'

/**
 * Payment Service
 * Handles payment and subscription API calls
 */

/**
 * Create a Razorpay order for credit pack or subscription
 * @param {object} data - Order data
 * @param {string} data.pack_id - Credit pack ID (for one-time purchase)
 * @param {string} data.plan_id - Subscription plan ID (for recurring)
 * @returns {Promise<object>} Razorpay order details
 */
export async function createOrder(data) {
  try {
    const response = await api.post('/payments/create-order', data)
    return response.data
  } catch (error) {
    throw error.response?.data?.message || error.response?.data?.detail || 'Failed to create order'
  }
}

/**
 * Verify Razorpay payment after successful checkout
 * @param {object} data - Payment verification data
 * @param {string} data.razorpay_payment_id - Payment ID from Razorpay
 * @param {string} data.razorpay_order_id - Order ID from Razorpay
 * @param {string} data.razorpay_signature - Signature from Razorpay
 * @returns {Promise<object>} Verification result with updated credits
 */
export async function verifyPayment(data) {
  try {
    const response = await api.post('/payments/verify', data)
    return response.data
  } catch (error) {
    throw error.response?.data?.message || error.response?.data?.detail || 'Payment verification failed'
  }
}

/**
 * Create a subscription
 * @param {string} planId - Subscription plan ID
 * @returns {Promise<object>} Subscription details
 */
export async function subscribe(planId) {
  try {
    const response = await api.post('/payments/subscribe', { plan_id: planId })
    return response.data
  } catch (error) {
    throw error.response?.data?.message || error.response?.data?.detail || 'Failed to create subscription'
  }
}

/**
 * Cancel active subscription
 * @returns {Promise<object>} Cancellation confirmation
 */
export async function cancelSubscription() {
  try {
    const response = await api.post('/payments/cancel-subscription')
    return response.data
  } catch (error) {
    throw error.response?.data?.message || error.response?.data?.detail || 'Failed to cancel subscription'
  }
}

/**
 * Get payment history
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<object>} Payment history with pagination
 */
export async function getPaymentHistory(page = 1, limit = 10) {
  try {
    const response = await api.get('/payments/history', {
      params: { page, limit },
    })
    return response.data
  } catch (error) {
    throw error.response?.data?.message || error.response?.data?.detail || 'Failed to fetch payment history'
  }
}

/**
 * Get available credit packs
 * @returns {Promise<array>} List of credit packs
 */
export async function getCreditPacks() {
  try {
    const response = await api.get('/payments/credit-packs')
    return response.data
  } catch (error) {
    // Return default packs if endpoint doesn't exist
    return [
      { id: 'starter', name: 'Starter Pack', credits: 50, price: 99 },
      { id: 'popular', name: 'Popular Pack', credits: 200, price: 299, popular: true },
      { id: 'pro', name: 'Pro Pack', credits: 500, price: 599 },
      { id: 'enterprise', name: 'Enterprise Pack', credits: 2000, price: 1999 },
    ]
  }
}

/**
 * Get subscription plans
 * @returns {Promise<array>} List of subscription plans
 */
export async function getSubscriptionPlans() {
  try {
    const response = await api.get('/payments/plans')
    return response.data
  } catch (error) {
    // Return default plans if endpoint doesn't exist
    return [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        credits: 10,
        period: 'one-time',
        features: [
          '10 credits on signup',
          'Text verification',
          'Image verification',
          'Basic support',
        ],
      },
      {
        id: 'pro',
        name: 'Pro',
        price: 499,
        credits: 500,
        period: 'month',
        popular: true,
        features: [
          '500 credits/month',
          'All verification types',
          'Priority processing',
          'Email support',
          'Verification history',
        ],
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 2499,
        credits: 5000,
        period: 'month',
        features: [
          '5000 credits/month',
          'All verification types',
          'API access',
          'Priority support',
          'Custom integrations',
          'Dedicated account manager',
        ],
      },
    ]
  }
}

export default {
  createOrder,
  verifyPayment,
  subscribe,
  cancelSubscription,
  getPaymentHistory,
  getCreditPacks,
  getSubscriptionPlans,
}
