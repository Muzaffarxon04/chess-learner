import { Chess } from 'chess.js'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  ALL_SQUARES,
  chessTargets,
  checkedKingSquare,
  isPromotionMove,
  piecesFromChess,
  piecesFromFen,
  type BoardPieces,
  type Square,
} from '../chess/pieces'
import { Board, type MarkKind, type PromotionPiece } from '../components/Board'
import { RichText } from '../components/RichText'
import { useI18n } from '../i18n'
import type { UiKey } from '../i18n/ui'
import { checkGoal, type GoalResult } from './goals'
import { heroTargets, promoteIfNeeded, solveStars } from './hero'
import type { GoalStep, InfoStep, SquaresStep, StarsStep } from './types'

export interface StepProps<S> {
  step: S
  onComplete: () => void
  /** Navigation buttons, rendered at the bottom of the side panel. */
  nav: ReactNode
}

type Feedback = { kind: 'success' | 'error' | 'info'; text: string } | null

export function Stage({ board, children }: { board: ReactNode; children: ReactNode }) {
  return (
    <div className="stage">
      <div className="stage-board">{board}</div>
      <div className="stage-panel">{children}</div>
    </div>
  )
}

export function FeedbackBox({ feedback }: { feedback: Feedback }) {
  if (!feedback) return null
  return (
    <div className={`feedback ${feedback.kind}`} role="status">
      {feedback.text}
    </div>
  )
}

/** Runs callbacks later and cancels them all on unmount. */
function useTimers() {
  const timers = useRef<number[]>([])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  return useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms))
  }, [])
}

// ---------------------------------------------------------------------------

export function InfoStepView({ step, nav }: StepProps<InfoStep>) {
  const { t, tx } = useI18n()
  const initial = useMemo(() => step.pieces ?? piecesFromFen(step.fen!), [step])
  const [pieces, setPieces] = useState<BoardPieces>(initial)
  const [active, setActive] = useState<Square | null>(step.showMoves ?? null)
  const sandbox = !!(step.sandbox && step.pieces)
  const moved = pieces !== initial

  const marks = useMemo(() => {
    const m: Partial<Record<Square, MarkKind>> = { ...step.marks }
    if (step.showMoves && !moved) {
      const from = step.showMoves
      const targets = step.pieces ? heroTargets(step.pieces[from]!, from, step.pieces) : chessTargets(new Chess(step.fen), from)
      for (const sq of targets) m[sq] ??= 'target'
    }
    return m
  }, [step, moved])

  const checkSquare = useMemo(() => (step.fen ? checkedKingSquare(new Chess(step.fen)) : null), [step.fen])

  return (
    <Stage
      board={
        <Board
          pieces={pieces}
          orientation={step.orientation}
          interactive={sandbox}
          autoSelect={sandbox ? active : null}
          canSelect={(sq) => pieces[sq]?.[0] === 'w'}
          getTargets={(from) => heroTargets(pieces[from]!, from, pieces)}
          onMove={(from, to) => {
            const next = { ...pieces }
            const piece = next[from]!
            delete next[from]
            next[to] = promoteIfNeeded(piece, to)
            setPieces(next)
            setActive(to)
          }}
          marks={moved ? undefined : marks}
          arrows={moved ? undefined : step.arrows}
          checkSquare={checkSquare}
        />
      }
    >
      <RichText text={tx(step.text)} />
      {sandbox && (
        <p className="muted">
          {t('lesson.sandbox')}{' '}
          {moved && (
            <button
              type="button"
              className="link"
              onClick={() => {
                setPieces(initial)
                setActive(step.showMoves ?? null)
              }}
            >
              {t('lesson.retry')} ↺
            </button>
          )}
        </p>
      )}
      {nav}
    </Stage>
  )
}

// ---------------------------------------------------------------------------

function randomSquares(count: number): Square[] {
  const pool = [...ALL_SQUARES]
  const out: Square[] = []
  while (out.length < count && pool.length) out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0])
  return out
}

export function SquaresStepView({ step, onComplete, nav }: StepProps<SquaresStep>) {
  const { t, tx } = useI18n()
  const [queue, setQueue] = useState(() => randomSquares(step.count))
  const [index, setIndex] = useState(0)
  const [flash, setFlash] = useState<{ sq: Square; ok: boolean } | null>(null)
  const [wrong, setWrong] = useState<Square | null>(null)
  const later = useTimers()
  const done = index >= queue.length

  const handleClick = (sq: Square) => {
    if (done) return
    if (sq === queue[index]) {
      setFlash({ sq, ok: true })
      setWrong(null)
      setIndex(index + 1)
      if (index + 1 >= queue.length) onComplete()
    } else {
      setFlash({ sq, ok: false })
      setWrong(sq)
    }
    later(() => setFlash((f) => (f?.sq === sq ? null : f)), 700)
  }

  return (
    <Stage
      board={
        <Board
          pieces={{}}
          onSquareClick={handleClick}
          interactive={!done}
          marks={flash ? { [flash.sq]: flash.ok ? 'good' : 'bad' } : undefined}
        />
      }
    >
      <RichText text={tx(step.text)} />
      {!done && <div className="big-prompt">{t('squares.find', { square: queue[index] })}</div>}
      <p className="muted">{t('squares.progress', { done: Math.min(index, queue.length), total: queue.length })}</p>
      <FeedbackBox
        feedback={
          done
            ? { kind: 'success', text: t('squares.done') }
            : wrong
              ? { kind: 'error', text: t('squares.wrong', { square: wrong }) }
              : null
        }
      />
      {done && (
        <button
          type="button"
          className="btn"
          onClick={() => {
            setQueue(randomSquares(step.count))
            setIndex(0)
            setWrong(null)
          }}
        >
          {t('lesson.retry')} ↺
        </button>
      )}
      {nav}
    </Stage>
  )
}

// ---------------------------------------------------------------------------

export function StarsStepView({ step, onComplete, nav }: StepProps<StarsStep>) {
  const { t, tx } = useI18n()
  const best = useMemo(() => solveStars(step) ?? 0, [step])
  const targets = useMemo(() => [...(step.stars ?? []), ...(Object.keys(step.enemies ?? {}) as Square[])], [step])
  const init = useCallback(
    () => ({ sq: step.hero.square, piece: step.hero.piece, remaining: targets.filter((s) => s !== step.hero.square), moves: 0 }),
    [step, targets],
  )
  const [state, setState] = useState(init)
  const done = state.remaining.length === 0
  const promoted = state.piece !== step.hero.piece

  const pieces = useMemo(() => {
    const p: BoardPieces = { ...step.blockers }
    for (const sq of state.remaining) {
      const enemy = step.enemies?.[sq]
      if (enemy) p[sq] = enemy
    }
    p[state.sq] = state.piece
    return p
  }, [step, state])

  const marks = useMemo(() => {
    const m: Partial<Record<Square, MarkKind>> = {}
    for (const sq of state.remaining) if (step.stars?.includes(sq)) m[sq] = 'star'
    return m
  }, [step, state.remaining])

  const handleMove = (_from: Square, to: Square) => {
    const remaining = state.remaining.filter((s) => s !== to)
    setState({ sq: to, piece: promoteIfNeeded(state.piece, to), remaining, moves: state.moves + 1 })
    if (remaining.length === 0) onComplete()
  }

  let feedback: Feedback = null
  if (done) {
    feedback =
      state.moves <= best
        ? { kind: 'success', text: t('stars.perfect', { n: state.moves }) }
        : { kind: 'success', text: t('stars.good', { n: state.moves, best }) }
  } else if (promoted) {
    feedback = { kind: 'info', text: t('stars.promoted') }
  }

  return (
    <Stage
      board={
        <Board
          pieces={pieces}
          interactive={!done}
          autoSelect={done ? null : state.sq}
          canSelect={(sq) => sq === state.sq}
          getTargets={(from) => heroTargets(state.piece, from, pieces)}
          onMove={handleMove}
          marks={marks}
        />
      }
    >
      <RichText text={tx(step.text)} />
      <div className="stat-row">
        <span>{t('stars.moves', { n: state.moves })}</span>
        <span className="muted">{t('stars.best', { n: best })}</span>
      </div>
      <FeedbackBox feedback={feedback} />
      {(state.moves > 0 || done) && (
        <button type="button" className="btn" onClick={() => setState(init())}>
          {t('lesson.retry')} ↺
        </button>
      )}
      {nav}
    </Stage>
  )
}

// ---------------------------------------------------------------------------

const RESULT_MESSAGE: Record<Exclude<GoalResult, 'success'>, UiKey> = {
  wrong: 'goal.wrong',
  stalemate: 'goal.stalemate',
  'check-not-mate': 'goal.checkNotMate',
}

const parseUci = (uci: string) => ({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] })

export function GoalStepView({ step, onComplete, nav }: StepProps<GoalStep>) {
  const { t, tx } = useI18n()
  const chessRef = useRef<Chess>(null as unknown as Chess)
  chessRef.current ??= new Chess(step.fen)
  const [round, setRound] = useState(0)
  const [, setVersion] = useState(0)
  const [phase, setPhase] = useState<'setup' | 'play' | 'wait' | 'done'>('play')
  const [lastMove, setLastMove] = useState<[Square, Square] | null>(null)
  const [feedback, setFeedback] = useState<Feedback>(null)
  const later = useTimers()
  const rerender = () => setVersion((v) => v + 1)

  const userColor = useMemo(() => {
    const c = new Chess(step.fen)
    for (const uci of step.setup ?? []) c.move(parseUci(uci))
    return c.turn()
  }, [step])

  // (Re)start the exercise, playing the scripted opponent moves first.
  useEffect(() => {
    const chess = new Chess(step.fen)
    chessRef.current = chess
    setLastMove(null)
    setFeedback(null)
    const setup = step.setup ?? []
    if (setup.length === 0) {
      setPhase('play')
      rerender()
      return
    }
    setPhase('setup')
    setFeedback({ kind: 'info', text: t('goal.opponentMoving') })
    rerender()
    const timers = setup.map((uci, i) =>
      window.setTimeout(() => {
        const m = chess.move(parseUci(uci))
        setLastMove([m.from, m.to])
        if (i === setup.length - 1) {
          setPhase('play')
          setFeedback(null)
        }
        rerender()
      }, 900 * (i + 1)),
    )
    return () => timers.forEach(clearTimeout)
    // `t` is deliberately left out: switching language must not restart the exercise.
  }, [step, round])

  const chess = chessRef.current
  const pieces = piecesFromChess(chess)

  const handleMove = (from: Square, to: Square, promotion?: PromotionPiece) => {
    const before = lastMove
    let move
    try {
      move = chess.move({ from, to, promotion })
    } catch {
      return
    }
    setLastMove([from, to])
    const result = checkGoal(step.goal, move)
    if (result === 'success') {
      setPhase('done')
      setFeedback({ kind: 'success', text: t('lesson.correct') })
      onComplete()
    } else {
      setPhase('wait')
      setFeedback({ kind: 'error', text: t(RESULT_MESSAGE[result]) })
      later(() => {
        chess.undo()
        setLastMove(before)
        setPhase('play')
        rerender()
      }, 1600)
    }
    rerender()
  }

  return (
    <Stage
      board={
        <Board
          pieces={pieces}
          orientation={userColor}
          interactive={phase === 'play'}
          canSelect={(sq) => chess.get(sq)?.color === chess.turn()}
          getTargets={(from) => chessTargets(chess, from)}
          isPromotion={(from, to) => isPromotionMove(chess, from, to)}
          onMove={handleMove}
          lastMove={lastMove}
          checkSquare={checkedKingSquare(chess)}
        />
      }
    >
      <div className={`turn-badge ${userColor}`}>{t(userColor === 'w' ? 'goal.playWhite' : 'goal.playBlack')}</div>
      <RichText text={tx(step.text)} />
      <FeedbackBox feedback={feedback} />
      {phase === 'done' && (
        <button type="button" className="btn" onClick={() => setRound((r) => r + 1)}>
          {t('lesson.retry')} ↺
        </button>
      )}
      {nav}
    </Stage>
  )
}
