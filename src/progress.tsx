import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { storage } from './storage'

interface ProgressData {
  lessons: string[]
  puzzles: string[]
}

interface Progress extends ProgressData {
  completeLesson: (id: string) => void
  solvePuzzle: (id: string) => void
}

const ProgressContext = createContext<Progress | null>(null)
const KEY = 'progress'

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ProgressData>(() => {
    const saved = storage.get<Partial<ProgressData>>(KEY)
    return { lessons: saved?.lessons ?? [], puzzles: saved?.puzzles ?? [] }
  })

  const update = useCallback((field: keyof ProgressData, id: string) => {
    setData((prev) => {
      if (prev[field].includes(id)) return prev
      const next = { ...prev, [field]: [...prev[field], id] }
      storage.set(KEY, next)
      return next
    })
  }, [])

  const value = useMemo<Progress>(
    () => ({
      ...data,
      completeLesson: (id) => update('lessons', id),
      solvePuzzle: (id) => update('puzzles', id),
    }),
    [data, update],
  )
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgress(): Progress {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used inside ProgressProvider')
  return ctx
}
