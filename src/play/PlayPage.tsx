import { Chess } from 'chess.js'
import { useEffect, useRef, useState } from 'react'
import {
  PIECE_IMAGES,
  chessTargets,
  checkedKingSquare,
  isPromotionMove,
  piecesFromChess,
  type PieceCode,
  type Square,
} from '../chess/pieces'
import { Board, type Arrow, type PromotionPiece } from '../components/Board'
import { FeedbackBox } from '../lessons/steps'
import type { Level } from '../engine/search'
import { useEngine } from '../engine/useEngine'
import { useI18n } from '../i18n'
import type { UiKey } from '../i18n/ui'
import { storage } from '../storage'

type ColorChoice = 'w' | 'b' | 'random'
interface Settings {
  color: ColorChoice
  level: Level
}

const VALUES: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 }
const START_COUNT: Record<string, number> = { p: 8, n: 2, b: 2, r: 2, q: 1 }

/** Pieces each side has lost, plus the material balance from White's view. */
function materialInfo(chess: Chess) {
  const count = { w: { p: 0, n: 0, b: 0, r: 0, q: 0 }, b: { p: 0, n: 0, b: 0, r: 0, q: 0 } } as Record<'w' | 'b', Record<string, number>>
  let balance = 0
  for (const row of chess.board())
    for (const cell of row) {
      if (!cell || cell.type === 'k') continue
      count[cell.color][cell.type]++
      balance += cell.color === 'w' ? VALUES[cell.type] : -VALUES[cell.type]
    }
  const lost = (color: 'w' | 'b') =>
    (['q', 'r', 'b', 'n', 'p'] as const).flatMap((type) =>
      Array.from({ length: Math.max(0, START_COUNT[type] - count[color][type]) }, () => `${color}${type.toUpperCase()}` as PieceCode),
    )
  return { lostWhite: lost('w'), lostBlack: lost('b'), balance }
}

function gameResult(chess: Chess, player: 'w' | 'b'): { key: UiKey; kind: 'success' | 'error' | 'info' } | null {
  if (chess.isCheckmate()) return chess.turn() === player ? { key: 'play.lose', kind: 'error' } : { key: 'play.win', kind: 'success' }
  if (chess.isStalemate()) return { key: 'play.stalemate', kind: 'info' }
  if (chess.isInsufficientMaterial()) return { key: 'play.insufficient', kind: 'info' }
  if (chess.isThreefoldRepetition()) return { key: 'play.repetition', kind: 'info' }
  if (chess.isDrawByFiftyMoves()) return { key: 'play.fifty', kind: 'info' }
  return null
}

const parseUci = (uci: string) => ({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] })

export function PlayPage() {
  const { t } = useI18n()
  const askEngine = useEngine()
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = storage.get<Settings>('play-settings')
    return saved && [1, 2, 3, 4].includes(saved.level) ? saved : { color: 'w', level: 1 }
  })
  const [game, setGame] = useState<{ chess: Chess; player: 'w' | 'b'; level: Level } | null>(null)
  const [, setVersion] = useState(0)
  const rerender = () => setVersion((v) => v + 1)
  const [orientation, setOrientation] = useState<'w' | 'b'>('w')
  const [thinking, setThinking] = useState(false)
  const [hint, setHint] = useState<Arrow | null>(null)
  const [hintLoading, setHintLoading] = useState(false)
  const token = useRef(0)

  useEffect(() => storage.set('play-settings', settings), [settings])
  // Leaving the page cancels any pending engine reply.
  useEffect(() => () => void token.current++, [])

  const engineMove = async (chess: Chess, level: Level) => {
    const my = ++token.current
    setThinking(true)
    const fen = chess.fen()
    const [uci] = await Promise.all([askEngine(fen, level), new Promise((r) => setTimeout(r, 450))])
    if (my !== token.current) return
    setThinking(false)
    if (uci && chess.fen() === fen) chess.move(parseUci(uci))
    rerender()
  }

  const start = () => {
    const player = settings.color === 'random' ? (Math.random() < 0.5 ? 'w' : 'b') : settings.color
    const chess = new Chess()
    token.current++
    setGame({ chess, player, level: settings.level })
    setOrientation(player)
    setHint(null)
    setThinking(false)
    if (player === 'b') engineMove(chess, settings.level)
  }

  if (!game) {
    return (
      <div className="page">
        <div className="page-head">
          <h1>{t('play.title')}</h1>
        </div>
        <div className="setup-card">
          <div className="field">
            <div className="field-label">{t('play.color')}</div>
            <div className="segmented">
              {(['w', 'b', 'random'] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  className={settings.color === c ? 'active' : ''}
                  onClick={() => setSettings({ ...settings, color: c })}
                >
                  {c === 'w' && <img src={PIECE_IMAGES.wK} alt="" />}
                  {c === 'b' && <img src={PIECE_IMAGES.bK} alt="" />}
                  {c === 'random' && <span className="dice">?</span>}
                  {t(c === 'w' ? 'play.white' : c === 'b' ? 'play.black' : 'play.random')}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <div className="field-label">{t('play.level')}</div>
            <div className="segmented levels">
              {([1, 2, 3, 4] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  className={settings.level === l ? 'active' : ''}
                  onClick={() => setSettings({ ...settings, level: l })}
                >
                  <span className="level-stars">{'★'.repeat(l)}</span>
                  {t(`level.${l}`)}
                </button>
              ))}
            </div>
          </div>
          <button type="button" className="btn primary big" onClick={start}>
            {t('play.start')} →
          </button>
          <p className="muted small">{t('play.tip')}</p>
        </div>
      </div>
    )
  }

  const { chess, player, level } = game
  const result = gameResult(chess, player)
  const history = chess.history({ verbose: true })
  const last = history[history.length - 1]
  const playerMoves = history.filter((m) => m.color === player).length
  const { lostWhite, lostBlack, balance } = materialInfo(chess)
  const myBalance = player === 'w' ? balance : -balance

  const handleMove = (from: Square, to: Square, promotion?: PromotionPiece) => {
    try {
      chess.move({ from, to, promotion })
    } catch {
      return
    }
    setHint(null)
    rerender()
    if (!chess.isGameOver()) engineMove(chess, level)
  }

  const undo = () => {
    token.current++
    setThinking(false)
    setHint(null)
    chess.undo()
    while (chess.turn() !== player && chess.history().length > 0) chess.undo()
    rerender()
    if (chess.turn() !== player) engineMove(chess, level)
  }

  const showHint = async () => {
    setHintLoading(true)
    const fen = chess.fen()
    const uci = await askEngine(fen, 4)
    setHintLoading(false)
    if (uci && chess.fen() === fen) setHint({ from: uci.slice(0, 2) as Square, to: uci.slice(2, 4) as Square })
  }

  let status: { kind: 'success' | 'error' | 'info'; text: string }
  if (result) status = { kind: result.kind, text: t(result.key) }
  else if (thinking) status = { kind: 'info', text: t('play.thinking') }
  else if (chess.inCheck()) status = { kind: 'error', text: t('play.check') }
  else status = { kind: 'info', text: t('play.yourTurn') }

  const myTurn = chess.turn() === player && !result && !thinking
  const opponentLost = player === 'w' ? lostBlack : lostWhite
  const myLost = player === 'w' ? lostWhite : lostBlack

  const movePairs: [string, string | undefined][] = []
  for (let i = 0; i < history.length; i += 2) movePairs.push([history[i].san, history[i + 1]?.san])

  return (
    <div className="page">
      <div className="stage">
        <div className="stage-board">
          <PlayerBar label={`${t('play.computer')} · ${t(`level.${level}`)}`} captured={myLost} advantage={-myBalance} />
          <Board
            pieces={piecesFromChess(chess)}
            orientation={orientation}
            interactive={myTurn}
            canSelect={(sq) => chess.get(sq)?.color === player}
            getTargets={(from) => chessTargets(chess, from)}
            isPromotion={(from, to) => isPromotionMove(chess, from, to)}
            onMove={handleMove}
            lastMove={last ? [last.from, last.to] : null}
            checkSquare={checkedKingSquare(chess)}
            arrows={hint && myTurn ? [hint] : undefined}
          />
          <PlayerBar label={t('play.you')} captured={opponentLost} advantage={myBalance} />
        </div>
        <div className="stage-panel">
          <FeedbackBox feedback={status} />
          {hint && myTurn && <p className="muted small">{t('play.hintShown')}</p>}
          <div className="button-row">
            <button type="button" className="btn" disabled={!myTurn || hintLoading} onClick={showHint}>
              💡 {t('play.hint')}
            </button>
            <button type="button" className="btn" disabled={playerMoves === 0} onClick={undo}>
              ↩ {t('play.undo')}
            </button>
            <button type="button" className="btn" onClick={() => setOrientation(orientation === 'w' ? 'b' : 'w')}>
              ⇅ {t('play.flip')}
            </button>
          </div>
          <div className="move-list">
            <div className="field-label">{t('play.moves')}</div>
            {movePairs.length === 0 ? (
              <p className="muted small">{t('play.noMoves')}</p>
            ) : (
              <ol>
                {movePairs.map(([w, b], i) => (
                  <li key={i}>
                    <span className="move-no">{i + 1}.</span>
                    <span>{w}</span>
                    <span>{b ?? ''}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
          <button
            type="button"
            className={`btn${result ? ' primary pulse' : ''}`}
            onClick={() => {
              token.current++
              setGame(null)
            }}
          >
            {t('play.newGame')}
          </button>
          <p className="muted small">{t('play.tip')}</p>
        </div>
      </div>
    </div>
  )
}

function PlayerBar({ label, captured, advantage }: { label: string; captured: PieceCode[]; advantage: number }) {
  return (
    <div className="player-bar">
      <span className="player-name">{label}</span>
      <span className="captured">
        {captured.map((p, i) => (
          <img key={i} src={PIECE_IMAGES[p]} alt="" />
        ))}
        {advantage > 0 && <span className="advantage">+{advantage}</span>}
      </span>
    </div>
  )
}
