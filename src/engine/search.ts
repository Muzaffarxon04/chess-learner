import {
  BISHOP,
  F_CAPTURE,
  F_PROMO,
  KING,
  PAWN,
  Position,
  WHITE,
  moveFlags,
  moveFrom,
  movePromo,
  moveTo,
  moveToUci,
} from './position'

export const MATE = 100000
const INF = 1000000
const MAX_PLY = 48

const VALUE = [0, 100, 320, 330, 500, 900, 0]

// Piece-square tables (Tomasz Michniewski's "simplified evaluation function"),
// written from White's point of view with a8 first.
const PST: number[][] = [
  [],
  // pawn
  [
    0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 50, 50, 50, 50, 10, 10, 20, 30, 30, 20, 10, 10, 5, 5, 10, 25, 25, 10, 5, 5,
    0, 0, 0, 20, 20, 0, 0, 0, 5, -5, -10, 0, 0, -10, -5, 5, 5, 10, 10, -20, -20, 10, 10, 5, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  // knight
  [
    -50, -40, -30, -30, -30, -30, -40, -50, -40, -20, 0, 0, 0, 0, -20, -40, -30, 0, 10, 15, 15, 10, 0, -30, -30, 5, 15,
    20, 20, 15, 5, -30, -30, 0, 15, 20, 20, 15, 0, -30, -30, 5, 10, 15, 15, 10, 5, -30, -40, -20, 0, 5, 5, 0, -20, -40,
    -50, -40, -30, -30, -30, -30, -40, -50,
  ],
  // bishop
  [
    -20, -10, -10, -10, -10, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 10, 10, 5, 0, -10, -10, 5, 5, 10, 10,
    5, 5, -10, -10, 0, 10, 10, 10, 10, 0, -10, -10, 10, 10, 10, 10, 10, 10, -10, -10, 5, 0, 0, 0, 0, 5, -10, -20, -10,
    -10, -10, -10, -10, -10, -20,
  ],
  // rook
  [
    0, 0, 0, 0, 0, 0, 0, 0, 5, 10, 10, 10, 10, 10, 10, 5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0,
    0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, 0, 0, 0, 5, 5, 0, 0, 0,
  ],
  // queen
  [
    -20, -10, -10, -5, -5, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 5, 5, 5, 0, -10, -5, 0, 5, 5, 5, 5, 0,
    -5, 0, 0, 5, 5, 5, 5, 0, -5, -10, 5, 5, 5, 5, 5, 0, -10, -10, 0, 5, 0, 0, 0, 0, -10, -20, -10, -10, -5, -5, -10,
    -10, -20,
  ],
  // king (middlegame)
  [
    -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40,
    -30, -30, -40, -40, -50, -50, -40, -40, -30, -20, -30, -30, -40, -40, -30, -30, -20, -10, -20, -20, -20, -20, -20,
    -20, -10, 20, 20, 0, 0, 0, 0, 20, 20, 20, 30, 10, 0, 0, 10, 30, 20,
  ],
]

const KING_ENDGAME = [
  -50, -40, -30, -20, -20, -30, -40, -50, -30, -20, -10, 0, 0, -10, -20, -30, -30, -10, 20, 30, 30, 20, -10, -30, -30,
  -10, 30, 40, 40, 30, -10, -30, -30, -10, 30, 40, 40, 30, -10, -30, -30, -10, 20, 30, 30, 20, -10, -30, -30, -30, 0, 0,
  0, 0, -30, -30, -50, -30, -30, -30, -30, -30, -30, -50,
]

const tableIndex = (sq: number, color: number) =>
  color === WHITE ? (7 - (sq >> 4)) * 8 + (sq & 7) : (sq >> 4) * 8 + (sq & 7)

const centerDistance = (sq: number) => {
  const f = sq & 7
  const r = sq >> 4
  return Math.max(3 - f, f - 4) + Math.max(3 - r, r - 4)
}

/** Static evaluation in centipawns from the side to move's point of view. */
export function evaluate(pos: Position): number {
  const b = pos.board
  let score = 0
  let nonPawn = 0
  const bishops = [0, 0]
  for (let sq = 0; sq < 128; sq++) {
    if (sq & 0x88) {
      sq += 7
      continue
    }
    const p = b[sq]
    if (!p) continue
    const type = p & 7
    if (type === KING) continue
    const color = p >> 3
    const v = VALUE[type] + PST[type][tableIndex(sq, color)]
    score += color === WHITE ? v : -v
    if (type !== PAWN) nonPawn += VALUE[type]
    if (type === BISHOP) bishops[color]++
  }
  if (bishops[0] >= 2) score += 30
  if (bishops[1] >= 2) score -= 30

  const endgame = nonPawn <= 1400
  const [wk, bk] = pos.kings
  if (wk >= 0 && bk >= 0) {
    const kingTable = endgame ? KING_ENDGAME : PST[KING]
    score += kingTable[tableIndex(wk, WHITE)] - kingTable[tableIndex(bk, 1)]
    // "Mop-up": when one side is clearly winning an endgame, drive the losing
    // king to the edge and bring the winning king closer. This lets the
    // computer actually finish off games like K+Q vs K.
    if (endgame && Math.abs(score) > 250) {
      const winnerKing = score > 0 ? wk : bk
      const loserKing = score > 0 ? bk : wk
      const kingDist = Math.abs((winnerKing & 7) - (loserKing & 7)) + Math.abs((winnerKing >> 4) - (loserKing >> 4))
      const bonus = 10 * centerDistance(loserKing) + 4 * (14 - kingDist)
      score += score > 0 ? bonus : -bonus
    }
  }
  return pos.side === WHITE ? score : -score
}

export interface SearchOptions {
  /** Maximum iterative-deepening depth (in plies). */
  depth: number
  /** Soft time limit in milliseconds. Depth 1 always completes. */
  timeMs?: number
  /** Random noise (centipawns) added to each root move's score, to make weaker levels play like humans. */
  noise?: number
  random?: () => number
}

export interface SearchResult {
  move: number
  uci: string
  score: number
  depth: number
}

const mvvLva = (pos: Position, m: number) => {
  const flags = moveFlags(m)
  let s = 0
  if (flags & F_CAPTURE) {
    const victim = pos.board[moveTo(m)] & 7 || PAWN
    const attacker = pos.board[moveFrom(m)] & 7
    s += 10000 + VALUE[victim] * 10 - VALUE[attacker] / 10
  }
  if (flags & F_PROMO) s += 9000 + VALUE[movePromo(m)]
  return s
}

class Searcher {
  nodes = 0
  stopped = false
  private deadline = Infinity
  private killers: number[][] = Array.from({ length: MAX_PLY + 1 }, () => [0, 0])
  private pos: Position

  constructor(pos: Position) {
    this.pos = pos
  }

  setDeadline(deadline: number) {
    this.deadline = deadline
  }

  private checkTime() {
    if ((++this.nodes & 1023) === 0 && performance.now() > this.deadline) this.stopped = true
  }

  private order(moves: number[], ply: number): number[] {
    const killers = this.killers[ply]
    const scored = moves.map((m) => {
      let s = mvvLva(this.pos, m)
      if (m === killers[0]) s += 5000
      else if (m === killers[1]) s += 4000
      return { m, s }
    })
    scored.sort((a, b) => b.s - a.s)
    return scored.map((x) => x.m)
  }

  quiesce(alpha: number, beta: number, ply: number): number {
    this.checkTime()
    if (this.stopped) return 0
    const stand = evaluate(this.pos)
    if (ply >= MAX_PLY || stand >= beta) return stand
    if (stand > alpha) alpha = stand
    const moves = this.order(this.pos.generate([], true), ply)
    for (const m of moves) {
      if (!this.pos.make(m)) continue
      const score = -this.quiesce(-beta, -alpha, ply + 1)
      this.pos.unmake()
      if (this.stopped) return 0
      if (score >= beta) return score
      if (score > alpha) alpha = score
    }
    return alpha
  }

  negamax(depth: number, alpha: number, beta: number, ply: number): number {
    this.checkTime()
    if (this.stopped) return 0
    const pos = this.pos
    if (pos.halfmove >= 100) return 0
    const inCheck = pos.inCheck()
    if (inCheck && ply < MAX_PLY - 8) depth++
    if (depth <= 0 || ply >= MAX_PLY) return this.quiesce(alpha, beta, ply)

    let best = -INF
    let legal = 0
    for (const m of this.order(pos.generate([]), ply)) {
      if (!pos.make(m)) continue
      legal++
      const score = -this.negamax(depth - 1, -beta, -alpha, ply + 1)
      pos.unmake()
      if (this.stopped) return 0
      if (score > best) best = score
      if (score > alpha) alpha = score
      if (alpha >= beta) {
        if (!(moveFlags(m) & F_CAPTURE)) {
          const k = this.killers[ply]
          if (k[0] !== m) {
            k[1] = k[0]
            k[0] = m
          }
        }
        break
      }
    }
    if (legal === 0) return inCheck ? -MATE + ply : 0
    return best
  }
}

/**
 * Finds a move for the side to move. Returns null when there are no legal moves.
 * With `noise` > 0 every root move gets an exact score and a random offset, so
 * weaker levels pick "reasonable but imperfect" moves.
 */
export function searchBestMove(fenOrPos: string | Position, opts: SearchOptions): SearchResult | null {
  const pos = typeof fenOrPos === 'string' ? Position.fromFen(fenOrPos) : fenOrPos
  const rootMoves = pos.legalMoves()
  if (rootMoves.length === 0) return null
  const random = opts.random ?? Math.random
  const noise = opts.noise ?? 0
  const searcher = new Searcher(pos)
  const start = performance.now()

  let ordered = rootMoves
    .map((m) => ({ m, s: mvvLva(pos, m) }))
    .sort((a, b) => b.s - a.s)
    .map((x) => x.m)
  let lastScores: Map<number, number> | null = null
  let completedDepth = 0

  for (let depth = 1; depth <= opts.depth; depth++) {
    searcher.setDeadline(depth === 1 ? Infinity : start + (opts.timeMs ?? Infinity))
    const scores = new Map<number, number>()
    let alpha = -INF
    for (const m of ordered) {
      pos.make(m)
      // With noise we need exact scores for every move, so we use a full window.
      const score = noise > 0 ? -searcher.negamax(depth - 1, -INF, INF, 1) : -searcher.negamax(depth - 1, -INF, -alpha, 1)
      pos.unmake()
      if (searcher.stopped) break
      scores.set(m, score)
      if (score > alpha) alpha = score
    }
    if (searcher.stopped) break
    lastScores = scores
    completedDepth = depth
    ordered = [...ordered].sort((a, b) => scores.get(b)! - scores.get(a)!)
    // A forced mate has been found: searching deeper won't change the choice.
    if (alpha >= MATE - 100) break
  }

  const scores = lastScores!
  let bestMove = ordered[0]
  let bestScore = -INF
  for (const m of ordered) {
    const exact = scores.get(m)!
    const noisy = exact + (noise > 0 && Math.abs(exact) < MATE - 100 ? (random() * 2 - 1) * noise : 0)
    if (noisy > bestScore) {
      bestScore = noisy
      bestMove = m
    }
  }
  return { move: bestMove, uci: moveToUci(bestMove), score: scores.get(bestMove)!, depth: completedDepth }
}

/** Difficulty levels offered in the "Play" section. */
export const LEVELS = {
  1: { depth: 1, noise: 250, blunder: 0.3 },
  2: { depth: 2, noise: 90, blunder: 0.05 },
  3: { depth: 3, noise: 25, blunder: 0 },
  4: { depth: 6, noise: 0, blunder: 0, timeMs: 1500 },
} as const

export type Level = keyof typeof LEVELS

export function pickMove(fen: string, level: Level, random: () => number = Math.random): string | null {
  const cfg = LEVELS[level]
  const pos = Position.fromFen(fen)
  const legal = pos.legalMoves()
  if (legal.length === 0) return null
  if (cfg.blunder > 0 && random() < cfg.blunder) return moveToUci(legal[Math.floor(random() * legal.length)])
  const res = searchBestMove(pos, {
    depth: cfg.depth,
    noise: cfg.noise,
    timeMs: 'timeMs' in cfg ? cfg.timeMs : undefined,
    random,
  })
  return res?.uci ?? null
}

// ---------------------------------------------------------------------------
// Forced-mate solver used by the puzzles (exact, so only for small n).

/** Can the side to move force checkmate within `n` of its own moves? */
export function canForceMate(pos: Position, n: number): boolean {
  return findMatingMove(pos, n) !== null
}

/** Returns a move that forces mate within `n` moves, or null. */
export function findMatingMove(pos: Position, n: number): number | null {
  if (n < 1) return null
  for (const m of pos.generate([])) {
    if (!pos.make(m)) continue
    const ok = defenderIsLost(pos, n - 1)
    pos.unmake()
    if (ok) return m
  }
  return null
}

/**
 * The side to move (the defender) is checkmated now, or the attacker can force
 * mate with at most `attackerMoves` more moves whatever the defender does.
 */
export function defenderIsLost(pos: Position, attackerMoves: number): boolean {
  const replies = pos.legalMoves()
  if (replies.length === 0) return pos.inCheck()
  if (attackerMoves < 1) return false
  for (const r of replies) {
    pos.make(r)
    const ok = canForceMate(pos, attackerMoves)
    pos.unmake()
    if (!ok) return false
  }
  return true
}
