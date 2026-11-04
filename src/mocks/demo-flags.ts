import { createStore } from 'zustand/vanilla'

type DemoFlags = {
  isFailingRequests: boolean
  setFailingRequests: (isFailing: boolean) => void
}

export const demoFlags = createStore<DemoFlags>()((set) => ({
  isFailingRequests: false,
  setFailingRequests: (isFailingRequests) => set({ isFailingRequests }),
}))
