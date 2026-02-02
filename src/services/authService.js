import api from './api'

/**
 * Authentication Service
 * Handles all auth-related API calls
 */

/**
 * Register a new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} full_name - User's full name
 */
export async function signup(email, password, full_name) {
  try {
    const response = await api.post('/auth/signup', {
      email,
      password,
      full_name,
    })
    return response.data
  } catch (error) {
    throw error.response?.data?.message || error.response?.data?.detail || 'Signup failed. Please try again.'
  }
}

/**
 * Login with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{access_token: string, refresh_token: string, user: object}>}
 */
export async function login(email, password) {
  try {
    const response = await api.post('/auth/login', {
      email,
      password,
    })
    return response.data
  } catch (error) {
    throw error.response?.data?.message || error.response?.data?.detail || 'Invalid email or password.'
  }
}

/**
 * Verify OTP for email verification
 * @param {string} email - User email
 * @param {string} otp - 6-digit OTP code
 */
export async function verifyOTP(email, otp) {
  try {
    const response = await api.post('/auth/verify-otp', {
      email,
      otp,
    })
    return response.data
  } catch (error) {
    throw error.response?.data?.message || error.response?.data?.detail || 'Invalid or expired OTP.'
  }
}

/**
 * Resend OTP to email
 * @param {string} email - User email
 */
export async function resendOTP(email) {
  try {
    const response = await api.post('/auth/resend-otp', {
      email,
    })
    return response.data
  } catch (error) {
    throw error.response?.data?.message || error.response?.data?.detail || 'Failed to resend OTP.'
  }
}

/**
 * Request password reset email
 * @param {string} email - User email
 */
export async function forgotPassword(email) {
  try {
    const response = await api.post('/auth/forgot-password', {
      email,
    })
    return response.data
  } catch (error) {
    throw error.response?.data?.message || error.response?.data?.detail || 'Failed to send reset email.'
  }
}

/**
 * Reset password with token
 * @param {string} token - Reset token from email
 * @param {string} new_password - New password
 */
export async function resetPassword(token, new_password) {
  try {
    const response = await api.post('/auth/reset-password', {
      token,
      new_password,
    })
    return response.data
  } catch (error) {
    throw error.response?.data?.message || error.response?.data?.detail || 'Failed to reset password.'
  }
}

/**
 * Get Google OAuth URL
 * Redirects user to Google consent screen
 */
export async function initiateGoogleAuth() {
  try {
    const response = await api.get('/auth/google')
    const authUrl = response.data.auth_url
    window.location.href = authUrl
  } catch (error) {
    throw error.response?.data?.message || 'Failed to initiate Google login.'
  }
}

/**
 * Refresh access token using refresh token
 * @param {string} refresh_token - Refresh token
 * @returns {Promise<{access_token: string, refresh_token?: string}>}
 */
export async function refreshToken(refresh_token) {
  try {
    const response = await api.post('/auth/refresh', {
      refresh_token,
    })
    return response.data
  } catch (error) {
    throw error.response?.data?.message || error.response?.data?.detail || 'Session expired. Please login again.'
  }
}

/**
 * Logout user (invalidate refresh token on backend)
 */
export async function logout() {
  try {
    const response = await api.post('/auth/logout')
    return response.data
  } catch (error) {
    // Even if logout fails on backend, we clear local state
    console.warn('Logout API call failed:', error)
    return { status: 'success' }
  }
}

/**
 * Get current user profile
 * @returns {Promise<object>} User profile data
 */
export async function getCurrentUser() {
  try {
    const response = await api.get('/users/me')
    const user = response.data
    // Normalize: backend uses 'name', frontend uses 'full_name'
    return {
      ...user,
      full_name: user.name || user.full_name,
    }
  } catch (error) {
    throw error.response?.data?.message || error.response?.data?.detail || 'Failed to fetch user profile.'
  }
}

export default {
  signup,
  login,
  verifyOTP,
  resendOTP,
  forgotPassword,
  resetPassword,
  initiateGoogleAuth,
  refreshToken,
  logout,
  getCurrentUser,
}
