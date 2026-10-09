// A compact 0x88 board used by the computer opponent and the puzzle solver.
// chess.js is great for the UI, but it computes SAN and FENs for every move,
// which is far too slow for searching thousands of positions.

export const WHITE = 0
export const BLACK = 1

export const PAWN = 1
export const KNIGHT = 2
export const BISHOP = 3
export const ROOK = 4
export const QUEEN = 5
export const KING = 6

// Move flags
export const F_CAPTURE = 1
export const F_EP = 2
export const F_CASTLE = 4
export const F_DOUBLE = 8
export const F_PROMO = 16

// A move is packed into one integer: from | to << 7 | promo << 14 | flags << 17
export const makeMoveCode = (from: number, to: number, promo: number, flags: number) =>
  from | (to << 7) | (promo << 14) | (flags << 17)
export const moveFrom = (m: number) => m & 127
export const moveTo = (m: number) => (m >> 7) & 127
export const movePromo = (m: number) => (m >> 14) & 7
export const moveFlags = (m: number) => m >> 17

export const KNIGHT_OFFSETS = [33, 31, 18, 14, -14, -18, -31, -33]
export const KING_OFFSETS = [1, -1, 16, -16, 15, 17, -15, -17]
const BISHOP_DIRS = [15, 17, -15, -17]
const ROOK_DIRS = [1, -1, 16, -16]

const PIECE_CHARS = ' pnbrqk'

// Castling rights: 1 = white king side, 2 = white queen side, 4 = black king side, 8 = black queen side
const CASTLE_MASK = new Uint8Array(128).fill(15)
CASTLE_MASK[0] = 15 & ~2 // a1
CASTLE_MASK[7] = 15 & ~1 // h1
CASTLE_MASK[4] = 15 & ~3 // e1
CASTLE_MASK[112] = 15 & ~8 // a8
CASTLE_MASK[119] = 15 & ~4 // h8
CASTLE_MASK[116] = 15 & ~12 // e8

export const squareIndex = (name: string) => (name.charCodeAt(1) - 49) * 16 + (name.charCodeAt(0) - 97)
export const squareName = (sq: number) => 'abcdefgh'[sq & 7] + ((sq >> 4) + 1)

export function moveToUci(m: number): string {
  const promo = movePromo(m)
  return squareName(moveFrom(m)) + squareName(moveTo(m)) + (promo ? PIECE_CHARS[promo] : '')
}

export class Position {
  board = new Int8Array(128)
  side = WHITE
  castling = 0
  ep = -1
  halfmove = 0
  fullmove = 1
  kings = [-1, -1]
  private stack: number[] = []

  static fromFen(fen: string): Position {
    const pos = new Position()
    const [placement, side, castling, ep, half, full] = fen.trim().split(/\s+/)
    let rank = 7
    let file = 0
    for (const ch of placement) {
      if (ch === '/') {
        rank--
        file = 0
      } else if (ch >= '1' && ch <= '8') {
        file += Number(ch)
      } else {
        const lower = ch.toLowerCase()
        const type = PIECE_CHARS.indexOf(lower)
        const color = ch === lower ? BLACK : WHITE
        const sq = rank * 16 + file
        pos.board[sq] = type | (color << 3)
        if (type === KING) pos.kings[color] = sq
        file++
      }
    }
    pos.side = side === 'b' ? BLACK : WHITE
    pos.castling =
      (castling?.includes('K') ? 1 : 0) |
      (castling?.includes('Q') ? 2 : 0) |
      (castling?.includes('k') ? 4 : 0) |
      (castling?.includes('q') ? 8 : 0)
    pos.ep = ep && ep !== '-' ? squareIndex(ep) : -1
    pos.halfmove = Number(half) || 0
    pos.fullmove = Number(full) || 1
    return pos
  }

  isAttacked(sq: number, by: number): boolean {
    const b = this.board
    const byBits = by << 3
    let s: number
    if (by === WHITE) {
      s = sq - 15
      if (!(s & 0x88) && b[s] === PAWN) return true
      s = sq - 17
      if (!(s & 0x88) && b[s] === PAWN) return true
    } else {
      s = sq + 15
      if (!(s & 0x88) && b[s] === (PAWN | 8)) return true
      s = sq + 17
      if (!(s & 0x88) && b[s] === (PAWN | 8)) return true
    }
    for (const d of KNIGHT_OFFSETS) {
      s = sq + d
      if (!(s & 0x88) && b[s] === (KNIGHT | byBits)) return true
    }
    for (const d of KING_OFFSETS) {
      s = sq + d
      if (!(s & 0x88) && b[s] === (KING | byBits)) return true
    }
    for (const d of BISHOP_DIRS) {
      s = sq + d
      while (!(s & 0x88)) {
        const p = b[s]
        if (p) {
          if (p >> 3 === by && ((p & 7) === BISHOP || (p & 7) === QUEEN)) return true
          break
        }
        s += d
      }
    }
    for (const d of ROOK_DIRS) {
      s = sq + d
      while (!(s & 0x88)) {
        const p = b[s]
        if (p) {
          if (p >> 3 === by && ((p & 7) === ROOK || (p & 7) === QUEEN)) return true
          break
        }
        s += d
      }
    }
    return false
  }

  inCheck(): boolean {
    const k = this.kings[this.side]
    return k >= 0 && this.isAttacked(k, this.side ^ 1)
  }

  /** Pseudo-legal moves; `make` rejects the ones that leave the king in check. */
  generate(out: number[], capturesOnly = false): number[] {
    const b = this.board
    const us = this.side
    const them = us ^ 1
    for (let sq = 0; sq < 128; sq++) {
      if (sq & 0x88) {
        sq += 7
        continue
      }
      const p = b[sq]
      if (!p || p >> 3 !== us) continue
      const type = p & 7
      if (type === PAWN) {
        const dir = us === WHITE ? 16 : -16
        const startRank = us === WHITE ? 1 : 6
        const lastRank = us === WHITE ? 7 : 0
        const to = sq + dir
        if (!(to & 0x88) && !b[to]) {
          if (to >> 4 === lastRank) {
            this.addPromotions(out, sq, to, F_PROMO)
          } else if (!capturesOnly) {
            out.push(makeMoveCode(sq, to, 0, 0))
            if (sq >> 4 === startRank && !b[to + dir]) out.push(makeMoveCode(sq, to + dir, 0, F_DOUBLE))
          }
        }
        for (const c of [to - 1, to + 1]) {
          if (c & 0x88) continue
          const q = b[c]
          if (q && q >> 3 === them) {
            if (c >> 4 === lastRank) this.addPromotions(out, sq, c, F_PROMO | F_CAPTURE)
            else out.push(makeMoveCode(sq, c, 0, F_CAPTURE))
          } else if (c === this.ep && !q) {
            out.push(makeMoveCode(sq, c, 0, F_CAPTURE | F_EP))
          }
        }
      } else if (type === KNIGHT || type === KING) {
        const offsets = type === KNIGHT ? KNIGHT_OFFSETS : KING_OFFSETS
        for (const d of offsets) {
          const to = sq + d
          if (to & 0x88) continue
          const q = b[to]
          if (!q) {
            if (!capturesOnly) out.push(makeMoveCode(sq, to, 0, 0))
          } else if (q >> 3 === them) {
            out.push(makeMoveCode(sq, to, 0, F_CAPTURE))
          }
        }
      } else {
        const dirs = type === BISHOP ? BISHOP_DIRS : type === ROOK ? ROOK_DIRS : KING_OFFSETS
        for (const d of dirs) {
          let to = sq + d
          while (!(to & 0x88)) {
            const q = b[to]
            if (!q) {
              if (!capturesOnly) out.push(makeMoveCode(sq, to, 0, 0))
            } else {
              if (q >> 3 === them) out.push(makeMoveCode(sq, to, 0, F_CAPTURE))
              break
            }
            to += d
          }
        }
      }
    }
    if (!capturesOnly) this.addCastling(out)
    return out
  }

  private addPromotions(out: number[], from: number, to: number, flags: number) {
    for (const promo of [QUEEN, KNIGHT, ROOK, BISHOP]) out.push(makeMoveCode(from, to, promo, flags))
  }

  private addCastling(out: number[]) {
    const b = this.board
    const us = this.side
    const them = us ^ 1
    const base = us === WHITE ? 0 : 112
    const king = KING | (us << 3)
    const rook = ROOK | (us << 3)
    if (b[base + 4] !== king) return
    const kingSide = us === WHITE ? 1 : 4
    const queenSide = us === WHITE ? 2 : 8
    if (
      this.castling & kingSide &&
      b[base + 7] === rook &&
      !b[base + 5] &&
      !b[base + 6] &&
      !this.isAttacked(base + 4, them) &&
      !this.isAttacked(base + 5, them) &&
      !this.isAttacked(base + 6, them)
    ) {
      out.push(makeMoveCode(base + 4, base + 6, 0, F_CASTLE))
    }
    if (
      this.castling & queenSide &&
      b[base] === rook &&
      !b[base + 3] &&
      !b[base + 2] &&
      !b[base + 1] &&
      !this.isAttacked(base + 4, them) &&
      !this.isAttacked(base + 3, them) &&
      !this.isAttacked(base + 2, them)
    ) {
      out.push(makeMoveCode(base + 4, base + 2, 0, F_CASTLE))
    }
  }

  /** Plays a pseudo-legal move. Returns false (and leaves the position unchanged) if it was illegal. */
  make(m: number): boolean {
    const b = this.board
    const from = moveFrom(m)
    const to = moveTo(m)
    const flags = moveFlags(m)
    const promo = movePromo(m)
    const us = this.side
    const piece = b[from]
    let captured = b[to]
    if (flags & F_EP) {
      const capSq = to + (us === WHITE ? -16 : 16)
      captured = b[capSq]
      b[capSq] = 0
    }
    this.stack.push(m, captured, this.castling, this.ep, this.halfmove)
    b[to] = promo ? promo | (us << 3) : piece
    b[from] = 0
    if (flags & F_CASTLE) {
      if (to > from) {
        b[from + 1] = b[from + 3]
        b[from + 3] = 0
      } else {
        b[from - 1] = b[from - 4]
        b[from - 4] = 0
      }
    }
    if ((piece & 7) === KING) this.kings[us] = to
    this.castling &= CASTLE_MASK[from] & CASTLE_MASK[to]
    this.ep = flags & F_DOUBLE ? (from + to) >> 1 : -1
    this.halfmove = (piece & 7) === PAWN || captured ? 0 : this.halfmove + 1
    if (us === BLACK) this.fullmove++
    this.side = us ^ 1
    if (this.kings[us] >= 0 && this.isAttacked(this.kings[us], us ^ 1)) {
      this.unmake()
      return false
    }
    return true
  }

  unmake() {
    const s = this.stack
    const halfmove = s.pop()!
    const ep = s.pop()!
    const castling = s.pop()!
    const captured = s.pop()!
    const m = s.pop()!
    this.side ^= 1
    const us = this.side
    const b = this.board
    const from = moveFrom(m)
    const to = moveTo(m)
    const flags = moveFlags(m)
    b[from] = movePromo(m) ? PAWN | (us << 3) : b[to]
    if (flags & F_EP) {
      b[to] = 0
      b[to + (us === WHITE ? -16 : 16)] = captured
    } else {
      b[to] = captured
    }
    if (flags & F_CASTLE) {
      if (to > from) {
        b[from + 3] = b[from + 1]
        b[from + 1] = 0
      } else {
        b[from - 4] = b[from - 1]
        b[from - 1] = 0
      }
    }
    if ((b[from] & 7) === KING) this.kings[us] = from
    this.castling = castling
    this.ep = ep
    this.halfmove = halfmove
    if (us === BLACK) this.fullmove--
  }

  legalMoves(): number[] {
    const legal: number[] = []
    for (const m of this.generate([])) {
      if (this.make(m)) {
        legal.push(m)
        this.unmake()
      }
    }
    return legal
  }

  findMove(uci: string): number | null {
    return this.legalMoves().find((m) => moveToUci(m) === uci) ?? null
  }

  perft(depth: number): number {
    if (depth === 0) return 1
    let nodes = 0
    for (const m of this.generate([])) {
      if (this.make(m)) {
        nodes += this.perft(depth - 1)
        this.unmake()
      }
    }
    return nodes
  }
}
