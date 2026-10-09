// Movement rules for the "collect the stars" exercises. These boards have no
// kings, so instead of chess.js we use plain piece movement: no check rules.
import { fileOf, rankOf, squareAt, type BoardPieces, type PieceCode, type Square } from '../chess/pieces'

const ORTHOGONAL = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
]
const DIAGONAL = [
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
]
const KNIGHT = [
  [1, 2],
  [2, 1],
  [2, -1],
  [1, -2],
  [-1, -2],
  [-2, -1],
  [-2, 1],
  [-1, 2],
]

const onBoard = (f: number, r: number) => f >= 0 && f < 8 && r >= 0 && r < 8

export function heroTargets(piece: PieceCode, from: Square, pieces: BoardPieces): Square[] {
  const color = piece[0]
  const kind = piece[1]
  const f0 = fileOf(from)
  const r0 = rankOf(from)
  const out: Square[] = []
  const occupant = (f: number, r: number) => pieces[squareAt(f, r)]
  const isEnemy = (p: PieceCode | undefined) => !!p && p[0] !== color

  const slide = (dirs: number[][]) => {
    for (const [df, dr] of dirs) {
      let f = f0 + df
      let r = r0 + dr
      while (onBoard(f, r)) {
        const p = occupant(f, r)
        if (p) {
          if (isEnemy(p)) out.push(squareAt(f, r))
          break
        }
        out.push(squareAt(f, r))
        f += df
        r += dr
      }
    }
  }
  const step = (deltas: number[][]) => {
    for (const [df, dr] of deltas) {
      const f = f0 + df
      const r = r0 + dr
      if (!onBoard(f, r)) continue
      const p = occupant(f, r)
      if (!p || isEnemy(p)) out.push(squareAt(f, r))
    }
  }

  switch (kind) {
    case 'R':
      slide(ORTHOGONAL)
      break
    case 'B':
      slide(DIAGONAL)
      break
    case 'Q':
      slide([...ORTHOGONAL, ...DIAGONAL])
      break
    case 'K':
      step([...ORTHOGONAL, ...DIAGONAL])
      break
    case 'N':
      step(KNIGHT)
      break
    case 'P': {
      const dir = color === 'w' ? 1 : -1
      const start = color === 'w' ? 1 : 6
      if (onBoard(f0, r0 + dir) && !occupant(f0, r0 + dir)) {
        out.push(squareAt(f0, r0 + dir))
        if (r0 === start && !occupant(f0, r0 + 2 * dir)) out.push(squareAt(f0, r0 + 2 * dir))
      }
      for (const df of [-1, 1]) {
        const f = f0 + df
        const r = r0 + dir
        if (onBoard(f, r) && isEnemy(occupant(f, r))) out.push(squareAt(f, r))
      }
      break
    }
  }
  return out
}

/** A pawn that reaches the far rank becomes a queen in the star exercises. */
export const promoteIfNeeded = (piece: PieceCode, sq: Square): PieceCode =>
  piece[1] === 'P' && (rankOf(sq) === 7 || rankOf(sq) === 0) ? (`${piece[0]}Q` as PieceCode) : piece

export interface StarsSetup {
  hero: { square: Square; piece: PieceCode }
  stars?: Square[]
  /** Enemy pieces: capturing them counts like collecting a star. */
  enemies?: BoardPieces
  /** Friendly pieces that just stand in the way. */
  blockers?: BoardPieces
}

/** Minimum number of moves needed to collect every star and capture every enemy (BFS), or null if impossible. */
export function solveStars(setup: StarsSetup): number | null {
  const targets: Square[] = [...(setup.stars ?? []), ...(Object.keys(setup.enemies ?? {}) as Square[])]
  const full = (1 << targets.length) - 1
  const startMask = targets.reduce((m, sq, i) => (sq === setup.hero.square ? m | (1 << i) : m), 0)
  type State = { sq: Square; piece: PieceCode; mask: number }
  const key = (s: State) => `${s.sq}${s.piece}${s.mask}`
  let frontier: State[] = [{ sq: setup.hero.square, piece: setup.hero.piece, mask: startMask }]
  const seen = new Set(frontier.map(key))
  for (let depth = 0; depth <= 64; depth++) {
    const next: State[] = []
    for (const s of frontier) {
      if (s.mask === full) return depth
      const pieces: BoardPieces = { ...setup.blockers }
      targets.forEach((sq, i) => {
        const enemy = setup.enemies?.[sq]
        if (enemy && !(s.mask & (1 << i))) pieces[sq] = enemy
      })
      for (const to of heroTargets(s.piece, s.sq, pieces)) {
        const idx = targets.indexOf(to)
        const ns: State = { sq: to, piece: promoteIfNeeded(s.piece, to), mask: idx >= 0 ? s.mask | (1 << idx) : s.mask }
        const k = key(ns)
        if (!seen.has(k)) {
          seen.add(k)
          next.push(ns)
        }
      }
    }
    if (next.length === 0) return null
    frontier = next
  }
  return null
}
