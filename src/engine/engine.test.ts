import { Chess } from 'chess.js'
import { describe, expect, it } from 'vitest'
import { Position, moveToUci } from './position'
import { findMatingMove, pickMove, searchBestMove } from './search'

// Reference perft counts from https://www.chessprogramming.org/Perft_Results
const PERFT: [string, number[]][] = [
  ['rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', [20, 400, 8902, 197281]],
  ['r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1', [48, 2039, 97862]],
  ['8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1', [14, 191, 2812, 43238]],
  ['r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1', [6, 264, 9467]],
  ['rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8', [44, 1486, 62379]],
  ['r4rk1/1pp1qppp/p1np1n2/2b1p1B1/2B1P1b1/P1NP1N2/1PP1QPPP/R4RK1 w - - 0 10', [46, 2079, 89890]],
]

describe('move generator', () => {
  for (const [fen, counts] of PERFT) {
    it(`perft ${fen}`, () => {
      const pos = Position.fromFen(fen)
      counts.forEach((n, i) => expect(pos.perft(i + 1)).toBe(n))
    })
  }

  it('agrees with chess.js on random games', () => {
    let seed = 7
    const rand = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff)
    for (let game = 0; game < 30; game++) {
      const chess = new Chess()
      for (let ply = 0; ply < 80 && !chess.isGameOver(); ply++) {
        const pos = Position.fromFen(chess.fen())
        const ours = pos.legalMoves().map(moveToUci).sort()
        const theirs = chess
          .moves({ verbose: true })
          .map((m) => m.from + m.to + (m.promotion ?? ''))
          .sort()
        expect(ours).toEqual(theirs)
        chess.move(theirs[Math.floor(rand() * theirs.length)] as string)
      }
    }
  })
})

describe('search', () => {
  it('finds mate in one', () => {
    expect(searchBestMove('6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1', { depth: 3 })?.uci).toBe('a1a8')
  })

  it('takes a free queen', () => {
    expect(searchBestMove('rnb1kbnr/ppp1pppp/8/3q4/8/2N5/PPPP1PPP/R1BQKBNR w KQkq - 0 3', { depth: 3 })?.uci).toBe('c3d5')
  })

  it('every level returns a legal move quickly', () => {
    const fen = 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3'
    const legal = new Chess(fen).moves({ verbose: true }).map((m) => m.from + m.to + (m.promotion ?? ''))
    for (const level of [1, 2, 3, 4] as const) {
      const t = performance.now()
      const move = pickMove(fen, level)
      expect(legal).toContain(move)
      expect(performance.now() - t).toBeLessThan(5000)
    }
  })

  it('wins K+Q vs K against itself', () => {
    const chess = new Chess('8/8/8/4k3/8/8/8/3QK3 w - - 0 1')
    for (let i = 0; i < 120 && !chess.isGameOver(); i++) chess.move(pickMove(chess.fen(), 4)!)
    expect(chess.isCheckmate()).toBe(true)
  }, 120_000)

  it('solves mate in two', () => {
    const pos = Position.fromFen('2r3k1/5ppp/8/8/8/8/4QPPP/4R1K1 w - - 0 1')
    const m = findMatingMove(pos, 2)
    expect(m && moveToUci(m)).toBe('e2e8')
    expect(findMatingMove(pos, 1)).toBeNull()
  })
})
