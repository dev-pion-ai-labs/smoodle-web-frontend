import api from './api'

/**
 * Verification Service
 * Handles all content verification API calls
 */

/**
 * Verify text content
 * @param {string} text - Text content to verify
 * @returns {Promise<object>} Verification result
 */
export async function verifyText(text) {
  try {
    const response = await api.post('/verify/text', { text })
    return response.data
  } catch (error) {
    throw error.response?.data?.message || error.response?.data?.detail || 'Text verification failed'
  }
}

/**
 * Verify image file
 * @param {File} file - Image file to verify
 * @param {function} onProgress - Progress callback (0-100)
 * @returns {Promise<object>} Verification result
 */
export async function verifyImage(file, onProgress) {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post('/verify/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    })
    return response.data
  } catch (error) {
    throw error.response?.data?.message || error.response?.data?.detail || 'Image verification failed'
  }
}

/**
 * Verify audio file
 * @param {File} file - Audio file to verify
 * @param {function} onProgress - Progress callback (0-100)
 * @returns {Promise<object>} Verification result
 */
export async function verifyAudio(file, onProgress) {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post('/verify/audio', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000, // 2 minutes for audio
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    })
    return response.data
  } catch (error) {
    throw error.response?.data?.message || error.response?.data?.detail || 'Audio verification failed'
  }
}

/**
 * Verify video file
 * @param {File} file - Video file to verify
 * @param {function} onProgress - Progress callback (0-100)
 * @returns {Promise<object>} Verification result
 */
export async function verifyVideo(file, onProgress) {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post('/verify/video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 300000, // 5 minutes for video
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    })
    return response.data
  } catch (error) {
    throw error.response?.data?.message || error.response?.data?.detail || 'Video verification failed'
  }
}

/**
 * Get verification history
 * @param {number} page - Page number (1-indexed)
 * @param {number} limit - Items per page
 * @param {string} type - Filter by content type (all/text/image/audio/video)
 * @returns {Promise<{data: array, total: number, page: number, pages: number}>}
 */
export async function getHistory(page = 1, limit = 10, type = 'all') {
  try {
    const params = { page, limit }
    if (type && type !== 'all') {
      params.content_type = type
    }

    const response = await api.get('/verify/history', { params })
    return response.data
  } catch (error) {
    throw error.response?.data?.message || error.response?.data?.detail || 'Failed to fetch history'
  }
}

/**
 * Get a specific verification result
 * @param {string} id - Verification ID
 * @returns {Promise<object>} Verification details
 */
export async function getVerification(id) {
  try {
    const response = await api.get(`/verify/${id}`)
    return response.data
  } catch (error) {
    throw error.response?.data?.message || error.response?.data?.detail || 'Failed to fetch verification'
  }
}

/**
 * Delete a verification from history
 * @param {string} id - Verification ID
 */
export async function deleteVerification(id) {
  try {
    const response = await api.delete(`/verify/${id}`)
    return response.data
  } catch (error) {
    throw error.response?.data?.message || error.response?.data?.detail || 'Failed to delete verification'
  }
}

export default {
  verifyText,
  verifyImage,
  verifyAudio,
  verifyVideo,
  getHistory,
  getVerification,
  deleteVerification,
}
