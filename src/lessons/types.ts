import type { Arrow, MarkKind } from '../components/Board'
import type { BoardPieces, PieceCode, Square } from '../chess/pieces'
import type { Text } from '../i18n'
import type { Goal } from './goals'
import type { StarsSetup } from './hero'

interface BoardSetup {
  /** A real chess position... */
  fen?: string
  /** ...or a free arrangement of pieces (no kings needed). */
  pieces?: BoardPieces
  marks?: Partial<Record<Square, MarkKind>>
  arrows?: Arrow[]
  /** Show where the piece on this square can move. */
  showMoves?: Square
  orientation?: 'w' | 'b'
}

/** Explanation with an illustration. With `sandbox`, the user can move the white pieces freely. */
export interface InfoStep extends BoardSetup {
  kind: 'info'
  text: Text
  sandbox?: boolean
}

/** "Click the square e4" quiz. */
export interface SquaresStep {
  kind: 'squares'
  text: Text
  count: number
}

/** Move one piece around to collect stars / capture enemy pieces. */
export interface StarsStep extends StarsSetup {
  kind: 'stars'
  text: Text
}

/** A real chess position where the user must make a move that fulfils `goal`. */
export interface GoalStep {
  kind: 'goal'
  text: Text
  fen: string
  goal: Goal
  /** Opponent moves (UCI) played automatically before the user's turn. */
  setup?: string[]
}

export type Step = InfoStep | SquaresStep | StarsStep | GoalStep

export type SectionId = 'basics' | 'pieces' | 'special' | 'goal' | 'strategy'

export interface Lesson {
  id: string
  section: SectionId
  icon: PieceCode
  title: Text
  summary: Text
  steps: Step[]
}
