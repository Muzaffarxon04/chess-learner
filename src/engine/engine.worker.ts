import { pickMove, type Level } from './search'

export interface EngineRequest {
  id: number
  fen: string
  level: Level
}

export interface EngineResponse {
  id: number
  move: string | null
}

const ctx = self as unknown as Worker

ctx.onmessage = (e: MessageEvent<EngineRequest>) => {
  const { id, fen, level } = e.data
  ctx.postMessage({ id, move: pickMove(fen, level) } satisfies EngineResponse)
}
