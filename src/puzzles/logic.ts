import { Position, moveToUci } from '../engine/position'
import { defenderIsLost, findMatingMove, searchBestMove } from '../engine/search'
import { solverMoves, type Puzzle } from './data'

export interface PuzzleProgress {
  /** Index in `solution` of the solver's next move (only meaningful while `onLine`). */
  ply: number
  /** False once the solver found an alternative mate that leaves the stored line. */
  onLine: boolean
  /** Solver moves still allowed. */
  movesLeft: number
}

export type Verdict =
  | { verdict: 'wrong' }
  | { verdict: 'solved' }
  | { verdict: 'continue'; reply: string; progress: PuzzleProgress }

export const initialProgress = (p: Puzzle): PuzzleProgress => ({ ply: 0, onLine: true, movesLeft: solverMoves(p) })

/**
 * Judges the solver's move. The stored solution is always accepted; for mate
 * puzzles any other move that still forces mate in time is accepted too, so a
 * correct alternative is never marked wrong.
 */
export function judgePuzzleMove(p: Puzzle, fen: string, progress: PuzzleProgress, uci: string): Verdict {
  if (progress.onLine && uci === p.solution[progress.ply]) {
    if (progress.ply + 1 >= p.solution.length) return { verdict: 'solved' }
    return {
      verdict: 'continue',
      reply: p.solution[progress.ply + 1],
      progress: { ply: progress.ply + 2, onLine: true, movesLeft: progress.movesLeft - 1 },
    }
  }
  if (p.theme === 'tactics') return { verdict: 'wrong' }

  const pos = Position.fromFen(fen)
  const m = pos.findMove(uci)
  if (m === null || !pos.make(m)) return { verdict: 'wrong' }
  if (!defenderIsLost(pos, progress.movesLeft - 1)) return { verdict: 'wrong' }
  if (pos.legalMoves().length === 0) return { verdict: 'solved' }
  const reply = searchBestMove(pos, { depth: 3 })!.uci
  return {
    verdict: 'continue',
    reply,
    progress: { ply: progress.ply + 2, onLine: false, movesLeft: progress.movesLeft - 1 },
  }
}

/** The move the hint should point at. */
export function hintMove(p: Puzzle, fen: string, progress: PuzzleProgress): string | null {
  if (progress.onLine) return p.solution[progress.ply] ?? null
  const m = findMatingMove(Position.fromFen(fen), progress.movesLeft)
  return m === null ? null : moveToUci(m)
}
