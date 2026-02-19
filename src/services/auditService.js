import api from './api'

/**
 * Audit Service
 * Handles all document audit API calls
 */

/**
 * Submit a document file for audit
 * @param {File} file - Document file (PDF, DOCX, TXT)
 * @param {function} onProgress - Upload progress callback (0-100)
 * @returns {Promise<object>} Audit submission response
 */
export async function submitAuditFile(file, onProgress) {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post('/audit/submit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000, // 2 minutes for upload
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    })
    return response.data
  } catch (error) {
    throw error.response?.data?.message || error.response?.data?.detail || 'Document audit submission failed'
  }
}

/**
 * Submit text content for audit
 * @param {string} text - Document text content
 * @param {string} documentName - Name for the document
 * @returns {Promise<object>} Audit submission response
 */
export async function submitAuditText(text, documentName) {
  try {
    const response = await api.post('/audit/submit/text', {
      text,
      document_name: documentName,
    })
    return response.data
  } catch (error) {
    throw error.response?.data?.message || error.response?.data?.detail || 'Text audit submission failed'
  }
}

/**
 * Get audit status or results
 * @param {string} auditId - Audit job ID
 * @returns {Promise<object>} Audit status/results
 */
export async function getAuditStatus(auditId) {
  try {
    const response = await api.get(`/audit/${auditId}`)
    return response.data
  } catch (error) {
    throw error.response?.data?.message || error.response?.data?.detail || 'Failed to fetch audit status'
  }
}

/**
 * Get audit PDF report download URL
 * @param {string} auditId - Audit job ID
 * @returns {Promise<object>} Report URL and expiry
 */
export async function getAuditReport(auditId) {
  try {
    const response = await api.get(`/audit/${auditId}/report`)
    return response.data
  } catch (error) {
    throw error.response?.data?.message || error.response?.data?.detail || 'Failed to fetch audit report'
  }
}

/**
 * Get audit history
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @param {string|null} verdict - Filter by verdict (verified/flagged)
 * @returns {Promise<object>} Paginated audit history
 */
export async function getAuditHistory(page = 1, limit = 20, verdict = null) {
  try {
    const params = { page, limit }
    if (verdict) {
      params.verdict = verdict
    }
    const response = await api.get('/audit/history', { params })
    return response.data
  } catch (error) {
    throw error.response?.data?.message || error.response?.data?.detail || 'Failed to fetch audit history'
  }
}

export default {
  submitAuditFile,
  submitAuditText,
  getAuditStatus,
  getAuditReport,
  getAuditHistory,
}
