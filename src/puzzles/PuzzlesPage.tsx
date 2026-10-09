import { Chess } from 'chess.js'
import { useEffect, useMemo, useRef, useState } from 'react'
import { chessTargets, checkedKingSquare, isPromotionMove, piecesFromChess, piecesFromFen, type Square } from '../chess/pieces'
import { Board, type Arrow, type PromotionPiece } from '../components/Board'
import { ProgressBar } from '../lessons/LessonsPage'
import { FeedbackBox, Stage } from '../lessons/steps'
import { useI18n } from '../i18n'
import { useProgress } from '../progress'
import { href, navigate } from '../router'
import { PUZZLES, THEMES, type Puzzle } from './data'
import { hintMove, initialProgress, judgePuzzleMove, type PuzzleProgress } from './logic'

export function PuzzlesPage() {
  const { t } = useI18n()
  const { puzzles: solved } = useProgress()
  return (
    <div className="page">
      <div className="page-head">
        <h1>{t('puzzles.title')}</h1>
        <p className="muted">{t('puzzles.intro')}</p>
        <p className="muted">{t('progress', { done: solved.length, total: PUZZLES.length })}</p>
        <ProgressBar value={solved.length / PUZZLES.length} />
      </div>
      {THEMES.map((theme) => (
        <section key={theme} className="lesson-section">
          <h2>{t(`theme.${theme}`)}</h2>
          <div className="puzzle-grid">
            {PUZZLES.filter((p) => p.theme === theme).map((p) => (
              <a key={p.id} href={href('puzzles', p.id)} className={`puzzle-card${solved.includes(p.id) ? ' done' : ''}`}>
                <div className="mini-board">
                  <Board
                    pieces={piecesFromFen(p.fen)}
                    orientation={new Chess(p.fen).turn()}
                    interactive={false}
                    showCoordinates={false}
                  />
                </div>
                <div className="puzzle-card-title">
                  {t('puzzle.title', { n: PUZZLES.indexOf(p) + 1 })}
                  {solved.includes(p.id) && <span className="check">✓</span>}
                </div>
              </a>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

type Phase = 'play' | 'opponent' | 'wrong' | 'solved' | 'shown'

const parseUci = (uci: string) => ({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] })

export function PuzzleView({ id }: { id: string }) {
  const { t, tx } = useI18n()
  const { puzzles: solvedIds, solvePuzzle } = useProgress()
  const puzzle = PUZZLES.find((p) => p.id === id)
  if (!puzzle) {
    return (
      <div className="page">
        <a href={href('puzzles')}>{t('puzzle.back')}</a>
      </div>
    )
  }
  const index = PUZZLES.indexOf(puzzle)
  const nextUnsolved =
    PUZZLES.slice(index + 1).find((p) => !solvedIds.includes(p.id)) ??
    PUZZLES.slice(0, index).find((p) => !solvedIds.includes(p.id))
  const goNext = () => (nextUnsolved ? navigate('puzzles', nextUnsolved.id) : navigate('play'))

  return (
    <div className="page">
      <div className="lesson-head">
        <a href={href('puzzles')} className="back-link">
          {t('puzzle.back')}
        </a>
        <h1>
          {t('puzzle.title', { n: index + 1 })} · <span className="muted">{t(`theme.${puzzle.theme}`)}</span>
        </h1>
      </div>
      <PuzzleBoard
        key={puzzle.id}
        puzzle={puzzle}
        onSolved={() => solvePuzzle(puzzle.id)}
        onNext={goNext}
        nextLabel={nextUnsolved ? t('puzzle.next') : t('lesson.playNow')}
        hintText={tx(puzzle.hint)}
      />
    </div>
  )
}

function PuzzleBoard({
  puzzle,
  onSolved,
  onNext,
  nextLabel,
  hintText,
}: {
  puzzle: Puzzle
  onSolved: () => void
  onNext: () => void
  nextLabel: string
  hintText: string
}) {
  const { t } = useI18n()
  const chessRef = useRef<Chess>(null as unknown as Chess)
  chessRef.current ??= new Chess(puzzle.fen)
  const chess = chessRef.current
  const [, setVersion] = useState(0)
  const rerender = () => setVersion((v) => v + 1)
  const [progress, setProgress] = useState<PuzzleProgress>(() => initialProgress(puzzle))
  const [phase, setPhase] = useState<Phase>('play')
  const [lastMove, setLastMove] = useState<[Square, Square] | null>(null)
  const [hintLevel, setHintLevel] = useState(0)
  const [message, setMessage] = useState<{ kind: 'success' | 'error' | 'info'; key: 'puzzle.good' | 'puzzle.wrong' | 'puzzle.solved' | 'puzzle.solutionShown' } | null>(null)
  const timers = useRef<number[]>([])
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms))
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const solverColor = useMemo(() => new Chess(puzzle.fen).turn(), [puzzle.fen])

  const reset = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    chessRef.current = new Chess(puzzle.fen)
    setProgress(initialProgress(puzzle))
    setPhase('play')
    setLastMove(null)
    setHintLevel(0)
    setMessage(null)
    rerender()
  }

  const handleMove = (from: Square, to: Square, promotion?: PromotionPiece) => {
    const fenBefore = chess.fen()
    let move
    try {
      move = chess.move({ from, to, promotion })
    } catch {
      return
    }
    const verdict = judgePuzzleMove(puzzle, fenBefore, progress, move.from + move.to + (move.promotion ?? ''))
    setLastMove([from, to])
    setHintLevel(0)
    if (verdict.verdict === 'wrong') {
      setPhase('wrong')
      setMessage({ kind: 'error', key: 'puzzle.wrong' })
      later(() => {
        chess.undo()
        setLastMove(null)
        setPhase('play')
        rerender()
      }, 1300)
    } else if (verdict.verdict === 'solved') {
      setPhase('solved')
      setMessage({ kind: 'success', key: 'puzzle.solved' })
      onSolved()
    } else {
      setPhase('opponent')
      setMessage({ kind: 'success', key: 'puzzle.good' })
      setProgress(verdict.progress)
      later(() => {
        const reply = chess.move(parseUci(verdict.reply))
        setLastMove([reply.from, reply.to])
        setPhase('play')
        rerender()
      }, 700)
    }
    rerender()
  }

  const showSolution = () => {
    reset()
    const fresh = chessRef.current
    setPhase('shown')
    puzzle.solution.forEach((uci, i) =>
      later(() => {
        const m = fresh.move(parseUci(uci))
        setLastMove([m.from, m.to])
        if (i === puzzle.solution.length - 1) setMessage({ kind: 'info', key: 'puzzle.solutionShown' })
        rerender()
      }, 800 * (i + 1)),
    )
  }

  const hint = phase === 'play' && hintLevel > 0 ? hintMove(puzzle, chess.fen(), progress) : null
  const arrows: Arrow[] = hint && hintLevel >= 2 ? [{ from: hint.slice(0, 2) as Square, to: hint.slice(2, 4) as Square }] : []
  const marks = hint && hintLevel === 1 ? { [hint.slice(0, 2)]: 'hint' as const } : undefined
  const finished = phase === 'solved' || phase === 'shown'

  return (
    <Stage
      board={
        <Board
          pieces={piecesFromChess(chess)}
          orientation={solverColor}
          interactive={phase === 'play'}
          canSelect={(sq) => chess.get(sq)?.color === solverColor && chess.turn() === solverColor}
          getTargets={(from) => chessTargets(chess, from)}
          isPromotion={(from, to) => isPromotionMove(chess, from, to)}
          onMove={handleMove}
          lastMove={lastMove}
          checkSquare={checkedKingSquare(chess)}
          marks={marks}
          arrows={arrows}
        />
      }
    >
      <div className={`turn-badge ${solverColor}`}>{t(solverColor === 'w' ? 'puzzle.whiteToMove' : 'puzzle.blackToMove')}</div>
      <p className="task">{t(`theme.${puzzle.theme}.task`)}</p>
      {hintLevel > 0 && !finished && (
        <div className="hint-box">
          💡 {hintText}
          {hintLevel === 1 && <div className="small">{t('puzzle.hintPiece')}</div>}
        </div>
      )}
      <FeedbackBox feedback={message && { kind: message.kind, text: t(message.key) }} />
      <div className="button-row">
        {!finished && (
          <>
            <button type="button" className="btn" disabled={phase !== 'play' || hintLevel >= 2} onClick={() => setHintLevel(hintLevel + 1)}>
              💡 {hintLevel === 0 ? t('puzzle.hint') : t('puzzle.hintMore')}
            </button>
            <button type="button" className="btn" onClick={showSolution}>
              {t('puzzle.showSolution')}
            </button>
          </>
        )}
        <button type="button" className="btn" onClick={reset}>
          {t('puzzle.retry')} ↺
        </button>
      </div>
      {finished && (
        <div className="step-nav">
          <span />
          <button type="button" className="btn primary pulse" onClick={onNext}>
            {nextLabel}
          </button>
        </div>
      )}
    </Stage>
  )
}
