import { create } from 'zustand'

export const useUIStore = create((set, get) => ({
  // Sidebar state
  sidebarOpen: false,
  sidebarCollapsed: false,

  // Modal states
  modals: {
    upgrade: false,
    confirmDelete: false,
    adjustCredits: false,
    verificationDetails: false,
  },

  // Modal data (for passing data to modals)
  modalData: null,

  // Mobile menu
  mobileMenuOpen: false,

  // Theme (future use)
  theme: 'light',

  // Sidebar actions
  toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
  openSidebar: () => set({ sidebarOpen: true }),
  closeSidebar: () => set({ sidebarOpen: false }),
  toggleSidebarCollapse: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),

  // Modal actions
  openModal: (modalName, data = null) => {
    set({
      modals: {
        ...get().modals,
        [modalName]: true,
      },
      modalData: data,
    })
  },

  closeModal: (modalName) => {
    set({
      modals: {
        ...get().modals,
        [modalName]: false,
      },
      modalData: null,
    })
  },

  closeAllModals: () => {
    set({
      modals: {
        upgrade: false,
        confirmDelete: false,
        adjustCredits: false,
        verificationDetails: false,
      },
      modalData: null,
    })
  },

  setModalData: (data) => set({ modalData: data }),

  // Mobile menu actions
  toggleMobileMenu: () => set({ mobileMenuOpen: !get().mobileMenuOpen }),
  openMobileMenu: () => set({ mobileMenuOpen: true }),
  closeMobileMenu: () => set({ mobileMenuOpen: false }),

  // Theme actions
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set({ theme: get().theme === 'light' ? 'dark' : 'light' }),
}))

// Selector hooks
export const useSidebarOpen = () => useUIStore((state) => state.sidebarOpen)
export const useMobileMenuOpen = () => useUIStore((state) => state.mobileMenuOpen)
export const useModal = (modalName) => useUIStore((state) => state.modals[modalName])
export const useModalData = () => useUIStore((state) => state.modalData)
