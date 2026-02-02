import api from './api'

/**
 * Admin Service
 * Handles admin-only API calls for dashboard and user management
 */

/**
 * Get dashboard statistics
 * @returns {Promise<object>} Stats data (users, verifications, revenue, subscriptions)
 */
export async function getStats() {
  try {
    const response = await api.get('/admin/stats')
    return response.data
  } catch (error) {
    throw error.response?.data?.message || error.response?.data?.detail || 'Failed to fetch stats'
  }
}

/**
 * Get paginated list of users
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @param {string} search - Search query (email or name)
 * @returns {Promise<object>} Users list with pagination
 */
export async function getUsers(page = 1, limit = 10, search = '') {
  try {
    const response = await api.get('/admin/users', {
      params: { page, limit, search: search || undefined },
    })
    return response.data
  } catch (error) {
    throw error.response?.data?.message || error.response?.data?.detail || 'Failed to fetch users'
  }
}

/**
 * Get single user details
 * @param {string} id - User ID
 * @returns {Promise<object>} User details
 */
export async function getUserDetails(id) {
  try {
    const response = await api.get(`/admin/users/${id}`)
    return response.data
  } catch (error) {
    throw error.response?.data?.message || error.response?.data?.detail || 'Failed to fetch user details'
  }
}

/**
 * Adjust user credits
 * @param {string} id - User ID
 * @param {number} amount - Credit amount (positive or negative)
 * @param {string} reason - Reason for adjustment
 * @returns {Promise<object>} Updated user data
 */
export async function adjustCredits(id, amount, reason) {
  try {
    const response = await api.patch(`/admin/users/${id}/credits`, {
      amount,
      reason,
    })
    return response.data
  } catch (error) {
    throw error.response?.data?.message || error.response?.data?.detail || 'Failed to adjust credits'
  }
}

/**
 * Get all verifications (admin view)
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @param {string} type - Filter by content type
 * @returns {Promise<object>} Verifications list with pagination
 */
export async function getVerifications(page = 1, limit = 10, type = null) {
  try {
    const response = await api.get('/admin/verifications', {
      params: { page, limit, type: type || undefined },
    })
    return response.data
  } catch (error) {
    throw error.response?.data?.message || error.response?.data?.detail || 'Failed to fetch verifications'
  }
}

/**
 * Get all payments (admin view)
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<object>} Payments list with pagination
 */
export async function getPayments(page = 1, limit = 10) {
  try {
    const response = await api.get('/admin/payments', {
      params: { page, limit },
    })
    return response.data
  } catch (error) {
    throw error.response?.data?.message || error.response?.data?.detail || 'Failed to fetch payments'
  }
}

/**
 * Get all subscriptions (admin view)
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<object>} Subscriptions list with pagination
 */
export async function getSubscriptions(page = 1, limit = 10) {
  try {
    const response = await api.get('/admin/subscriptions', {
      params: { page, limit },
    })
    return response.data
  } catch (error) {
    throw error.response?.data?.message || error.response?.data?.detail || 'Failed to fetch subscriptions'
  }
}

/**
 * Get chart data for verifications over time
 * @param {string} period - Time period (7d, 30d, 90d)
 * @returns {Promise<array>} Chart data points
 */
export async function getVerificationChartData(period = '30d') {
  try {
    const response = await api.get('/admin/stats/verifications-chart', {
      params: { period },
    })
    return response.data
  } catch (error) {
    // Return mock data if endpoint doesn't exist
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30
    return generateMockChartData(days, 'verifications')
  }
}

/**
 * Get chart data for revenue over time
 * @param {string} period - Time period (7d, 30d, 90d)
 * @returns {Promise<array>} Chart data points
 */
export async function getRevenueChartData(period = '30d') {
  try {
    const response = await api.get('/admin/stats/revenue-chart', {
      params: { period },
    })
    return response.data
  } catch (error) {
    // Return mock data if endpoint doesn't exist
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30
    return generateMockChartData(days, 'revenue')
  }
}

/**
 * Generate mock chart data for development
 */
function generateMockChartData(days, type) {
  const data = []
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    data.push({
      date: date.toISOString().split('T')[0],
      value: type === 'revenue'
        ? Math.floor(Math.random() * 5000) + 1000
        : Math.floor(Math.random() * 100) + 20,
    })
  }

  return data
}

export default {
  getStats,
  getUsers,
  getUserDetails,
  adjustCredits,
  getVerifications,
  getPayments,
  getSubscriptions,
  getVerificationChartData,
  getRevenueChartData,
}
