import axios from 'axios'
import { API_BASE_URL } from '@utils/constants'
import { useAuthStore } from '@store/authStore'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
})

// Flag to prevent multiple refresh attempts
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

/**
 * Extract tokens from refresh response.
 * Handles both { data: { access_token, refresh_token } } and { access_token, refresh_token } formats.
 */
function extractTokens(responseData) {
  const tokenData = responseData?.data || responseData
  return {
    access_token: tokenData?.access_token,
    refresh_token: tokenData?.refresh_token,
  }
}

// Request interceptor - attach Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle 401 and token refresh
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // If error is not 401 or request already retried, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
        .catch((err) => {
          return Promise.reject(err)
        })
    }

    originalRequest._retry = true
    isRefreshing = true

    const refreshToken = localStorage.getItem('refresh_token')

    if (!refreshToken) {
      clearAuthAndRedirect()
      return Promise.reject(error)
    }

    try {
      // Attempt to refresh the token using raw axios (not the api instance, to avoid interceptor loop)
      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refresh_token: refreshToken,
      })

      const { access_token, refresh_token: newRefreshToken } = extractTokens(response.data)

      // Validate that we got a valid access token back
      if (!access_token) {
        throw new Error('No access token in refresh response')
      }

      // Store new tokens in localStorage
      localStorage.setItem('access_token', access_token)
      if (newRefreshToken) {
        localStorage.setItem('refresh_token', newRefreshToken)
      }

      // Sync tokens to Zustand store so UI components stay in sync
      useAuthStore.getState().setTokens(access_token, newRefreshToken || refreshToken)

      // Update authorization header
      api.defaults.headers.common.Authorization = `Bearer ${access_token}`
      originalRequest.headers.Authorization = `Bearer ${access_token}`

      // Process queued requests with new token
      processQueue(null, access_token)

      return api(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      clearAuthAndRedirect()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

// Clear auth state and redirect to login
function clearAuthAndRedirect() {
  // Clear Zustand store (also clears localStorage)
  try {
    useAuthStore.getState().logout()
  } catch {
    // Fallback to manual cleanup if store isn't available
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
  }

  // Only redirect if not already on auth pages
  const authPages = ['/login', '/signup', '/verify-otp', '/forgot-password', '/reset-password']
  if (!authPages.some((page) => window.location.pathname.startsWith(page))) {
    window.location.href = '/login'
  }
}

export default api
