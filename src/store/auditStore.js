import { create } from 'zustand'

export const useAuditStore = create((set, get) => ({
  // Current audit state
  currentAudit: null,
  isSubmitting: false,
  isPolling: false,
  submitError: null,

  // History state
  history: [],
  historyLoading: false,
  historyError: null,
  historyPagination: {
    page: 1,
    limit: 20,
    total: 0,
  },
  historyVerdictFilter: null, // null | 'verified' | 'flagged'

  // Actions for current audit
  setCurrentAudit: (audit) => set({ currentAudit: audit, submitError: null }),

  clearCurrentAudit: () => set({ currentAudit: null, submitError: null, isPolling: false }),

  setSubmitting: (isSubmitting) => set({ isSubmitting }),

  setPolling: (isPolling) => set({ isPolling }),

  setSubmitError: (error) => set({ submitError: error, isSubmitting: false }),

  // Actions for history
  setHistory: (history) => set({ history }),

  setHistoryLoading: (loading) => set({ historyLoading: loading }),

  setHistoryError: (error) => set({ historyError: error, historyLoading: false }),

  setHistoryPagination: (pagination) => {
    set({
      historyPagination: {
        ...get().historyPagination,
        ...pagination,
      },
    })
  },

  setHistoryVerdictFilter: (verdict) => set({ historyVerdictFilter: verdict }),

  // Reset all state
  reset: () => {
    set({
      currentAudit: null,
      isSubmitting: false,
      isPolling: false,
      submitError: null,
      history: [],
      historyLoading: false,
      historyError: null,
      historyPagination: {
        page: 1,
        limit: 20,
        total: 0,
      },
      historyVerdictFilter: null,
    })
  },
}))

// Selector hooks
export const useCurrentAudit = () => useAuditStore((state) => state.currentAudit)
export const useIsAuditSubmitting = () => useAuditStore((state) => state.isSubmitting)
export const useIsAuditPolling = () => useAuditStore((state) => state.isPolling)
export const useAuditError = () => useAuditStore((state) => state.submitError)
