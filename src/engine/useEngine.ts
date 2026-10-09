import { useCallback, useEffect, useRef } from 'react'
import type { EngineRequest, EngineResponse } from './engine.worker'
import type { Level } from './search'

/** Runs the engine in a Web Worker so the UI never freezes while it thinks. */
export function useEngine() {
  const workerRef = useRef<Worker | null>(null)
  const pending = useRef(new Map<number, (move: string | null) => void>())
  const nextId = useRef(1)

  useEffect(() => {
    const worker = new Worker(new URL('./engine.worker.ts', import.meta.url), { type: 'module' })
    const waiting = pending.current
    worker.onmessage = (e: MessageEvent<EngineResponse>) => {
      waiting.get(e.data.id)?.(e.data.move)
      waiting.delete(e.data.id)
    }
    workerRef.current = worker
    return () => {
      worker.terminate()
      workerRef.current = null
      waiting.clear()
    }
  }, [])

  return useCallback(
    (fen: string, level: Level) =>
      new Promise<string | null>((resolve) => {
        const worker = workerRef.current
        if (!worker) return resolve(null)
        const id = nextId.current++
        pending.current.set(id, resolve)
        worker.postMessage({ id, fen, level } satisfies EngineRequest)
      }),
    [],
  )
}
