import { Chess, type Square } from 'chess.js'
import bB from '../assets/pieces/bB.svg'
import bK from '../assets/pieces/bK.svg'
import bN from '../assets/pieces/bN.svg'
import bP from '../assets/pieces/bP.svg'
import bQ from '../assets/pieces/bQ.svg'
import bR from '../assets/pieces/bR.svg'
import wB from '../assets/pieces/wB.svg'
import wK from '../assets/pieces/wK.svg'
import wN from '../assets/pieces/wN.svg'
import wP from '../assets/pieces/wP.svg'
import wQ from '../assets/pieces/wQ.svg'
import wR from '../assets/pieces/wR.svg'

export type PieceColor = 'w' | 'b'
export type PieceKind = 'P' | 'N' | 'B' | 'R' | 'Q' | 'K'
export type PieceCode = `${PieceColor}${PieceKind}`
export type BoardPieces = Partial<Record<Square, PieceCode>>
export type { Square }

export const PIECE_IMAGES: Record<PieceCode, string> = { bB, bK, bN, bP, bQ, bR, wB, wK, wN, wP, wQ, wR }

export const FILES = 'abcdefgh'

export const squareAt = (file: number, rank: number) => (FILES[file] + (rank + 1)) as Square
export const fileOf = (sq: Square) => sq.charCodeAt(0) - 97
export const rankOf = (sq: Square) => sq.charCodeAt(1) - 49
export const isLightSquare = (sq: Square) => (fileOf(sq) + rankOf(sq)) % 2 === 1

export const ALL_SQUARES: Square[] = Array.from({ length: 64 }, (_, i) => squareAt(i % 8, Math.floor(i / 8)))

export function piecesFromChess(chess: Chess): BoardPieces {
  const out: BoardPieces = {}
  for (const row of chess.board()) {
    for (const cell of row) {
      if (cell) out[cell.square] = `${cell.color}${cell.type.toUpperCase()}` as PieceCode
    }
  }
  return out
}

export const piecesFromFen = (fen: string) => piecesFromChess(new Chess(fen))

/** Finds the square of `color`'s king if it is in check. */
export function checkedKingSquare(chess: Chess): Square | null {
  if (!chess.inCheck()) return null
  const turn = chess.turn()
  for (const row of chess.board()) {
    for (const cell of row) if (cell && cell.type === 'k' && cell.color === turn) return cell.square
  }
  return null
}

/** Legal destination squares for the piece on `from` (chess.js position). */
export const chessTargets = (chess: Chess, from: Square): Square[] =>
  chess.moves({ square: from, verbose: true }).map((m) => m.to)

export const isPromotionMove = (chess: Chess, from: Square, to: Square) =>
  chess.moves({ square: from, verbose: true }).some((m) => m.to === to && m.promotion)

export const uciOf = (m: { from: string; to: string; promotion?: string }) => m.from + m.to + (m.promotion ?? '')
