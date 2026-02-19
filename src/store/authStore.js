import { create } from 'zustand'

// Helper to safely parse JSON from localStorage
const getStoredUser = () => {
  try {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

// Helper to check if user is admin
const checkIsAdmin = (user) => {
  return user?.role === 'admin' || user?.is_admin === true
}

export const useAuthStore = create((set, get) => ({
  // State
  user: getStoredUser(),
  accessToken: localStorage.getItem('access_token'),
  refreshToken: localStorage.getItem('refresh_token'),
  isLoading: false,
  error: null,

  // Computed getters
  get isAuthenticated() {
    return !!get().accessToken
  },

  get isAdmin() {
    return checkIsAdmin(get().user)
  },

  get credits() {
    return get().user?.credits ?? 0
  },

  // Actions
  setUser: (user) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }
    set({ user })
  },

  setTokens: (accessToken, refreshToken) => {
    if (accessToken) {
      localStorage.setItem('access_token', accessToken)
    } else {
      localStorage.removeItem('access_token')
    }
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken)
    } else {
      localStorage.removeItem('refresh_token')
    }
    set({ accessToken, refreshToken })
  },

  login: (user, accessToken, refreshToken) => {
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('refresh_token', refreshToken)
    set({
      user,
      accessToken,
      refreshToken,
      error: null,
    })
  },

  logout: () => {
    localStorage.removeItem('user')
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      error: null,
    })
  },

  updateCredits: (credits) => {
    const user = get().user
    if (user) {
      const updatedUser = { ...user, credits }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      set({ user: updatedUser })
    }
  },

  updateUser: (updates) => {
    const user = get().user
    if (user) {
      const updatedUser = { ...user, ...updates }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      set({ user: updatedUser })
    }
  },

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),

  // Rehydrate auth state from localStorage (call on app init)
  rehydrate: () => {
    const user = getStoredUser()
    const accessToken = localStorage.getItem('access_token')
    const refreshToken = localStorage.getItem('refresh_token')
    set({ user, accessToken, refreshToken })
  },
}))

// Selector hooks for common use cases
export const useUser = () => useAuthStore((state) => state.user)
export const useIsAuthenticated = () => useAuthStore((state) => !!state.accessToken)
export const useIsAdmin = () => useAuthStore((state) => checkIsAdmin(state.user))
export const useCredits = () => useAuthStore((state) => state.user?.credits ?? 0)
export const useIsEnterprise = () => useAuthStore((state) => state.user?.plan === 'enterprise')
