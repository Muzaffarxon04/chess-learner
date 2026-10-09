import { Chess } from 'chess.js'
import { describe, expect, it } from 'vitest'
import { Position, moveToUci } from '../engine/position'
import { defenderIsLost, findMatingMove, searchBestMove } from '../engine/search'
import { PUZZLES } from './data'
import { initialProgress, judgePuzzleMove } from './logic'

const play = (chess: Chess, uci: string) =>
  chess.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] })

describe('puzzles', () => {
  it('have unique ids and translated hints', () => {
    expect(new Set(PUZZLES.map((p) => p.id)).size).toBe(PUZZLES.length)
    for (const p of PUZZLES) for (const lang of ['uz', 'ru', 'en'] as const) expect(p.hint[lang].length).toBeGreaterThan(5)
  })

  for (const p of PUZZLES) {
    describe(p.id, () => {
      it('solution is legal and the start position is not over', () => {
        const chess = new Chess(p.fen)
        expect(chess.isGameOver()).toBe(false)
        for (const uci of p.solution) play(chess, uci)
      })

      if (p.theme === 'mate1') {
        it('ends in mate', () => {
          const chess = new Chess(p.fen)
          play(chess, p.solution[0])
          expect(chess.isCheckmate()).toBe(true)
        })
      }

      if (p.theme === 'mate2') {
        it('is a real mate in two (not one), and every defence loses', () => {
          const pos = Position.fromFen(p.fen)
          expect(findMatingMove(pos, 1)).toBeNull()
          const key = pos.findMove(p.solution[0])!
          pos.make(key)
          expect(defenderIsLost(pos, 1)).toBe(true)
          expect(defenderIsLost(pos, 0)).toBe(false)
          const chess = new Chess(p.fen)
          for (const uci of p.solution) play(chess, uci)
          expect(chess.isCheckmate()).toBe(true)
        })
      }

      if (p.theme === 'tactics') {
        it('engine agrees with the first move', () => {
          expect(searchBestMove(p.fen, { depth: 4 })?.uci).toBe(p.solution[0])
        })
      }
    })
  }

  it('accepts alternative mates and rejects bad moves', () => {
    const ladder = PUZZLES.find((p) => p.id === 'm2-two-rooks')!
    // 1.Ra7 also mates next move
    const alt = judgePuzzleMove(ladder, ladder.fen, initialProgress(ladder), 'a2a7')
    expect(alt.verdict).toBe('continue')
    // a quiet king move does not
    expect(judgePuzzleMove(ladder, ladder.fen, initialProgress(ladder), 'g1f2').verdict).toBe('wrong')

    const fork = PUZZLES.find((p) => p.id === 't-knight-fork')!
    expect(judgePuzzleMove(fork, fork.fen, initialProgress(fork), 'd5f6').verdict).toBe('wrong')
    expect(judgePuzzleMove(fork, fork.fen, initialProgress(fork), 'd5e7').verdict).toBe('continue')
  })

  it('reports how many mating first moves each mate puzzle has', () => {
    for (const p of PUZZLES.filter((x) => x.theme !== 'tactics')) {
      const pos = Position.fromFen(p.fen)
      const n = p.theme === 'mate1' ? 1 : 2
      const keys = pos.legalMoves().filter((m) => {
        pos.make(m)
        const ok = defenderIsLost(pos, n - 1)
        pos.unmake()
        return ok
      })
      console.log(p.id, keys.map(moveToUci).join(' '))
      expect(keys.map(moveToUci)).toContain(p.solution[0])
    }
  })
})
