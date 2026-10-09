import { Chess, type Move } from 'chess.js'

export type Goal =
  | { type: 'mate' }
  | { type: 'check' }
  | { type: 'castle'; side?: 'k' | 'q' }
  | { type: 'enpassant' }
  | { type: 'promote'; piece?: 'q' | 'r' | 'b' | 'n'; capture?: boolean }
  | { type: 'capture'; piece?: 'p' | 'n' | 'b' | 'r' | 'q' }
  | { type: 'escape'; how: 'king' | 'capture' | 'block' }
  /** Any of these moves (UCI, e.g. "e2e4"). */
  | { type: 'moves'; moves: string[] }

export type GoalResult = 'success' | 'stalemate' | 'check-not-mate' | 'wrong'

function checkers(fen: string): string[] {
  const chess = new Chess(fen)
  const us = chess.turn()
  for (const row of chess.board()) {
    for (const cell of row) {
      if (cell?.type === 'k' && cell.color === us) return chess.attackers(cell.square, us === 'w' ? 'b' : 'w')
    }
  }
  return []
}

export function checkGoal(goal: Goal, move: Move): GoalResult {
  const after = new Chess(move.after)
  switch (goal.type) {
    case 'mate':
      if (after.isCheckmate()) return 'success'
      if (after.isStalemate()) return 'stalemate'
      return after.inCheck() ? 'check-not-mate' : 'wrong'
    case 'check':
      return after.inCheck() ? 'success' : 'wrong'
    case 'castle': {
      const ok =
        goal.side === 'k' ? move.isKingsideCastle() : goal.side === 'q' ? move.isQueensideCastle() : move.isKingsideCastle() || move.isQueensideCastle()
      return ok ? 'success' : 'wrong'
    }
    case 'enpassant':
      return move.isEnPassant() ? 'success' : 'wrong'
    case 'promote': {
      const ok =
        move.isPromotion() &&
        (!goal.piece || move.promotion === goal.piece) &&
        (!goal.capture || move.isCapture())
      return ok ? 'success' : 'wrong'
    }
    case 'capture':
      return move.isCapture() && (!goal.piece || move.captured === goal.piece) ? 'success' : 'wrong'
    case 'escape': {
      if (goal.how === 'king') return move.piece === 'k' ? 'success' : 'wrong'
      if (goal.how === 'capture') return move.isCapture() && checkers(move.before).includes(move.to) ? 'success' : 'wrong'
      return move.piece !== 'k' && !move.isCapture() ? 'success' : 'wrong'
    }
    case 'moves':
      return goal.moves.includes(move.from + move.to + (move.promotion ?? '')) ? 'success' : 'wrong'
  }
}
