import api from './api'

/**
 * User Service
 * Handles user profile and account management API calls
 */

/**
 * Get current user profile
 * @returns {Promise<object>} User profile data
 */
export async function getProfile() {
  try {
    const response = await api.get('/users/me')
    return response.data
  } catch (error) {
    throw error.response?.data?.message || error.response?.data?.detail || 'Failed to fetch profile'
  }
}

/**
 * Update user profile
 * @param {object} data - Profile data to update
 * @param {string} data.full_name - User's full name
 * @returns {Promise<object>} Updated user data
 */
export async function updateProfile(data) {
  try {
    // Map full_name to name for backend compatibility
    const payload = {
      name: data.full_name || data.name,
    }
    const response = await api.patch('/users/me', payload)
    const user = response.data
    // Normalize: backend uses 'name', frontend uses 'full_name'
    return {
      ...user,
      full_name: user.name || user.full_name,
    }
  } catch (error) {
    throw error.response?.data?.message || error.response?.data?.detail || 'Failed to update profile'
  }
}

/**
 * Get user's credit balance
 * @returns {Promise<{credits: number}>}
 */
export async function getCredits() {
  try {
    const response = await api.get('/users/me/credits')
    return response.data
  } catch (error) {
    throw error.response?.data?.message || error.response?.data?.detail || 'Failed to fetch credits'
  }
}

/**
 * Get user's subscription details
 * @returns {Promise<object>} Subscription data
 */
export async function getSubscription() {
  try {
    const response = await api.get('/users/me/subscription')
    return response.data
  } catch (error) {
    throw error.response?.data?.message || error.response?.data?.detail || 'Failed to fetch subscription'
  }
}

/**
 * Delete user account
 * @returns {Promise<void>}
 */
export async function deleteAccount() {
  try {
    const response = await api.delete('/users/me')
    return response.data
  } catch (error) {
    throw error.response?.data?.message || error.response?.data?.detail || 'Failed to delete account'
  }
}

export default {
  getProfile,
  updateProfile,
  getCredits,
  getSubscription,
  deleteAccount,
}
