import { create } from 'zustand'

type UIState = {
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  setCollapsed: (v: boolean) => void
}

export const useUIStore = create<UIState>((set: any) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s: UIState) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setCollapsed: (v: boolean) => set({ sidebarCollapsed: v }),
}))

export default useUIStore
