import { create } from 'zustand'

export const useVerifyStore = create((set, get) => ({
  // Current verification state
  currentResult: null,
  isVerifying: false,
  verifyError: null,

  // History state
  history: [],
  historyLoading: false,
  historyError: null,
  historyPagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },

  // Filter state
  historyFilter: {
    type: 'all', // 'all' | 'text' | 'image' | 'audio' | 'video'
    sort: 'newest', // 'newest' | 'oldest'
  },

  // Actions for current verification
  setCurrentResult: (result) => set({ currentResult: result, verifyError: null }),

  clearCurrentResult: () => set({ currentResult: null, verifyError: null }),

  setVerifying: (isVerifying) => set({ isVerifying }),

  setVerifyError: (error) => set({ verifyError: error, isVerifying: false }),

  // Actions for history
  setHistory: (history) => set({ history }),

  addToHistory: (verification) => {
    const current = get().history
    set({ history: [verification, ...current].slice(0, 50) }) // Keep last 50
  },

  removeFromHistory: (id) => {
    const current = get().history
    set({ history: current.filter((item) => item.id !== id) })
  },

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

  // Filter actions
  setHistoryFilter: (filter) => {
    set({
      historyFilter: {
        ...get().historyFilter,
        ...filter,
      },
    })
  },

  resetHistoryFilter: () => {
    set({
      historyFilter: {
        type: 'all',
        sort: 'newest',
      },
    })
  },

  // Reset all state
  reset: () => {
    set({
      currentResult: null,
      isVerifying: false,
      verifyError: null,
      history: [],
      historyLoading: false,
      historyError: null,
      historyPagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
      historyFilter: {
        type: 'all',
        sort: 'newest',
      },
    })
  },
}))

// Selector hooks
export const useCurrentResult = () => useVerifyStore((state) => state.currentResult)
export const useIsVerifying = () => useVerifyStore((state) => state.isVerifying)
export const useVerifyError = () => useVerifyStore((state) => state.verifyError)
export const useVerificationHistory = () => useVerifyStore((state) => state.history)
