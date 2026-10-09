import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { createPortal } from 'react-dom'
import { useI18n } from '../i18n'
import { PIECE_IMAGES, squareAt, type BoardPieces, type PieceCode, type Square } from '../chess/pieces'

export type PromotionPiece = 'q' | 'r' | 'b' | 'n'
export type MarkKind = 'star' | 'target' | 'highlight' | 'good' | 'bad' | 'hint'

export interface Arrow {
  from: Square
  to: Square
  color?: 'green' | 'red' | 'blue' | 'orange'
}

export interface BoardProps {
  pieces: BoardPieces
  orientation?: 'w' | 'b'
  /** Whether the user may pick up the piece on this square. */
  canSelect?: (sq: Square) => boolean
  /** Legal destinations for the selected piece. */
  getTargets?: (from: Square) => Square[]
  onMove?: (from: Square, to: Square, promotion?: PromotionPiece) => void
  /** When true for a move, the user is asked which piece to promote to. */
  isPromotion?: (from: Square, to: Square) => boolean
  /** Clicks on squares that don't select or move a piece. */
  onSquareClick?: (sq: Square) => void
  lastMove?: [Square, Square] | null
  checkSquare?: Square | null
  marks?: Partial<Record<Square, MarkKind>>
  arrows?: Arrow[]
  interactive?: boolean
  showCoordinates?: boolean
  /** Keep this square selected whenever the position changes (single-piece exercises). */
  autoSelect?: Square | null
}

interface PointerState {
  from: Square
  startX: number
  startY: number
  wasSelected: boolean
}

interface DragState {
  from: Square
  piece: PieceCode
  x: number
  y: number
  size: number
}

const ARROW_COLORS = { green: '#15803d', red: '#dc2626', blue: '#2563eb', orange: '#ea580c' }

export function Board({
  pieces,
  orientation = 'w',
  canSelect,
  getTargets,
  onMove,
  isPromotion,
  onSquareClick,
  lastMove,
  checkSquare,
  marks,
  arrows,
  interactive = true,
  showCoordinates = true,
  autoSelect = null,
}: BoardProps) {
  const { t } = useI18n()
  const boardRef = useRef<HTMLDivElement>(null)
  const pointer = useRef<PointerState | null>(null)
  const [selected, setSelected] = useState<Square | null>(autoSelect)
  const [drag, setDrag] = useState<DragState | null>(null)
  const [promotion, setPromotion] = useState<{ from: Square; to: Square; color: 'w' | 'b' } | null>(null)

  // A new position (opponent moved, exercise reset...) cancels any selection.
  const positionKey = useMemo(
    () =>
      Object.entries(pieces)
        .map(([sq, p]) => sq + p)
        .sort()
        .join(),
    [pieces],
  )
  useEffect(() => {
    setSelected(autoSelect)
    setPromotion(null)
  }, [positionKey, autoSelect])

  const selectedPiece = selected ? pieces[selected] : undefined
  const targets = useMemo(
    () => (selected && selectedPiece && getTargets ? getTargets(selected) : []),
    // positionKey: targets depend on the position, which `pieces` describes
    [selected, selectedPiece, getTargets, positionKey],
  )

  const squareFromPoint = (x: number, y: number): Square | null => {
    const el = boardRef.current
    if (!el) return null
    const rect = el.getBoundingClientRect()
    const col = Math.floor(((x - rect.left) / rect.width) * 8)
    const row = Math.floor(((y - rect.top) / rect.height) * 8)
    if (col < 0 || col > 7 || row < 0 || row > 7) return null
    return orientation === 'w' ? squareAt(col, 7 - row) : squareAt(7 - col, row)
  }

  const tryMove = (from: Square, to: Square): boolean => {
    if (!targets.includes(to)) return false
    setSelected(null)
    if (isPromotion?.(from, to)) {
      setPromotion({ from, to, color: pieces[from]![0] as 'w' | 'b' })
    } else {
      onMove?.(from, to)
    }
    return true
  }

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!interactive || promotion || e.button !== 0) return
    const sq = squareFromPoint(e.clientX, e.clientY)
    if (!sq) return
    if (selected && sq !== selected && tryMove(selected, sq)) return
    if (pieces[sq] && canSelect?.(sq)) {
      e.preventDefault()
      pointer.current = { from: sq, startX: e.clientX, startY: e.clientY, wasSelected: selected === sq }
      setSelected(sq)
      boardRef.current?.setPointerCapture(e.pointerId)
      return
    }
    setSelected(null)
    onSquareClick?.(sq)
  }

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const p = pointer.current
    if (!p) return
    if (!drag) {
      if (Math.hypot(e.clientX - p.startX, e.clientY - p.startY) < 5) return
      const size = (boardRef.current?.getBoundingClientRect().width ?? 400) / 8
      setDrag({ from: p.from, piece: pieces[p.from]!, x: e.clientX, y: e.clientY, size })
    } else {
      setDrag({ ...drag, x: e.clientX, y: e.clientY })
    }
  }

  const handlePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const p = pointer.current
    pointer.current = null
    if (!p) return
    if (drag) {
      setDrag(null)
      const sq = squareFromPoint(e.clientX, e.clientY)
      if (sq && sq !== p.from && tryMove(p.from, sq)) return
      if (!sq) setSelected(null)
      return
    }
    // A plain click on the piece that was already selected deselects it.
    if (p.wasSelected && p.from !== autoSelect) setSelected(null)
  }

  const handlePointerCancel = () => {
    pointer.current = null
    setDrag(null)
  }

  const rows = [0, 1, 2, 3, 4, 5, 6, 7]
  const squareOf = (row: number, col: number) => (orientation === 'w' ? squareAt(col, 7 - row) : squareAt(7 - col, row))
  const center = (sq: Square) => {
    const f = sq.charCodeAt(0) - 97
    const r = sq.charCodeAt(1) - 49
    const col = orientation === 'w' ? f : 7 - f
    const row = orientation === 'w' ? 7 - r : r
    return { x: col * 100 + 50, y: row * 100 + 50 }
  }

  return (
    <div className="board-wrap">
      <div
        ref={boardRef}
        className={`board${interactive ? ' interactive' : ''}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        role="grid"
      >
        {rows.map((row) =>
          rows.map((col) => {
            const sq = squareOf(row, col)
            const piece = pieces[sq]
            const light = (row + col) % 2 === 0
            const mark = marks?.[sq]
            const isTarget = targets.includes(sq)
            const classes = ['sq', light ? 'light' : 'dark']
            if (lastMove && (lastMove[0] === sq || lastMove[1] === sq)) classes.push('last-move')
            if (selected === sq) classes.push('selected')
            if (checkSquare === sq) classes.push('in-check')
            if (mark && mark !== 'star' && mark !== 'target') classes.push(`mark-${mark}`)
            if (piece && canSelect?.(sq) && interactive) classes.push('movable')
            return (
              <div key={sq} className={classes.join(' ')} data-square={sq} aria-label={sq}>
                {piece && (
                  <img
                    className={`piece${drag?.from === sq ? ' dragging-source' : ''}`}
                    src={PIECE_IMAGES[piece]}
                    alt={piece}
                    draggable={false}
                  />
                )}
                {mark === 'star' && <StarIcon />}
                {mark === 'target' && !isTarget && <span className="dot" />}
                {isTarget && <span className={piece ? 'ring' : 'dot'} />}
                {showCoordinates && col === 0 && <span className="coord rank">{sq[1]}</span>}
                {showCoordinates && row === 7 && <span className="coord file">{sq[0]}</span>}
              </div>
            )
          }),
        )}
        {arrows && arrows.length > 0 && (
          <svg className="arrows" viewBox="0 0 800 800" aria-hidden>
            {arrows.map((a, i) => {
              const from = center(a.from)
              const to = center(a.to)
              const dx = to.x - from.x
              const dy = to.y - from.y
              const len = Math.hypot(dx, dy) || 1
              const ux = dx / len
              const uy = dy / len
              const head = 34
              const tipX = to.x - ux * 12
              const tipY = to.y - uy * 12
              const baseX = tipX - ux * head
              const baseY = tipY - uy * head
              const color = ARROW_COLORS[a.color ?? 'green']
              return (
                <g key={i} opacity={0.82}>
                  <line
                    x1={from.x + ux * 18}
                    y1={from.y + uy * 18}
                    x2={baseX}
                    y2={baseY}
                    stroke={color}
                    strokeWidth={16}
                    strokeLinecap="round"
                  />
                  <polygon
                    points={`${tipX},${tipY} ${baseX - uy * 22},${baseY + ux * 22} ${baseX + uy * 22},${baseY - ux * 22}`}
                    fill={color}
                  />
                </g>
              )
            })}
          </svg>
        )}
        {promotion && (
          <div className="promotion" onPointerDown={(e) => e.stopPropagation()}>
            <div className="promotion-box">
              <div className="promotion-title">{t('promotion.title')}</div>
              <div className="promotion-choices">
                {(['q', 'r', 'b', 'n'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      const { from, to } = promotion
                      setPromotion(null)
                      onMove?.(from, to, p)
                    }}
                  >
                    <img src={PIECE_IMAGES[`${promotion.color}${p.toUpperCase()}` as PieceCode]} alt={p} />
                  </button>
                ))}
              </div>
              <button type="button" className="link" onClick={() => setPromotion(null)}>
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
      {drag &&
        createPortal(
          <img
            className="drag-ghost"
            src={PIECE_IMAGES[drag.piece]}
            alt=""
            style={{ width: drag.size, height: drag.size, left: drag.x - drag.size / 2, top: drag.y - drag.size / 2 }}
          />,
          document.body,
        )}
    </div>
  )
}

function StarIcon() {
  return (
    <svg className="star" viewBox="0 0 24 24" aria-hidden>
      <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" />
    </svg>
  )
}
