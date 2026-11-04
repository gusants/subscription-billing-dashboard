import { createStore } from 'zustand/vanilla'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { DemoDatabase } from '../demo-types'
import seed from '../seed.json'

export const DEMO_DB_STORAGE_KEY = 'cadencia-demo-db'
export const DEMO_DB_VERSION = 2

type DemoDbState = {
  db: DemoDatabase
  transact: <T>(change: (draft: DemoDatabase) => T) => T
  read: <T>(query: (db: DemoDatabase) => T) => T
  reset: () => void
}

function freshDatabase() {
  return structuredClone(seed as DemoDatabase)
}

export const demoDbStore = createStore<DemoDbState>()(
  persist(
    (set, get) => ({
      db: freshDatabase(),
      transact: (change) => {
        const draft = structuredClone(get().db)
        const result = change(draft)
        set({ db: draft })
        return result
      },
      read: (query) => query(get().db),
      reset: () => set({ db: freshDatabase() }),
    }),
    {
      name: DEMO_DB_STORAGE_KEY,
      version: DEMO_DB_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ db: state.db }),
      migrate: () => ({ db: freshDatabase() }),
    },
  ),
)
