import { Chess } from 'chess.js'
import { describe, expect, it } from 'vitest'
import type { Text } from '../i18n'
import { LESSONS } from './data'
import { checkGoal } from './goals'
import { solveStars } from './hero'

const play = (chess: Chess, uci: string) =>
  chess.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] })

const expectText = (t: Text) => {
  for (const lang of ['uz', 'ru', 'en'] as const) expect(t[lang].trim().length).toBeGreaterThan(1)
}

describe('lessons', () => {
  it('have unique ids', () => {
    expect(new Set(LESSONS.map((l) => l.id)).size).toBe(LESSONS.length)
  })

  for (const lesson of LESSONS) {
    describe(lesson.id, () => {
      it('is fully translated', () => {
        expectText(lesson.title)
        expectText(lesson.summary)
        lesson.steps.forEach((s) => expectText(s.text))
      })

      lesson.steps.forEach((step, i) => {
        if (step.kind === 'info' && step.fen) {
          it(`step ${i + 1}: valid position`, () => {
            expect(() => new Chess(step.fen)).not.toThrow()
          })
        }
        if (step.kind === 'stars') {
          it(`step ${i + 1}: stars are reachable`, () => {
            const best = solveStars(step)
            expect(best).not.toBeNull()
            expect(best).toBeGreaterThan(0)
          })
        }
        if (step.kind === 'goal') {
          it(`step ${i + 1}: goal can be achieved but not by every move`, () => {
            const chess = new Chess(step.fen)
            for (const uci of step.setup ?? []) play(chess, uci)
            if (step.goal.type === 'escape') expect(chess.inCheck()).toBe(true)
            const results = chess.moves({ verbose: true }).map((m) => checkGoal(step.goal, m))
            expect(results).toContain('success')
            // "Move your king out of check" may have only king moves available.
            if (!(step.goal.type === 'escape' && step.goal.how === 'king')) {
              expect(results.some((r) => r !== 'success')).toBe(true)
            }
          })
        }
      })
    })
  }

  it('the stalemate exercise really has a stalemate trap', () => {
    const step = LESSONS.find((l) => l.id === 'draw')!.steps[1]
    if (step.kind !== 'goal') throw new Error('expected goal step')
    const results = new Chess(step.fen).moves({ verbose: true }).map((m) => checkGoal(step.goal, m))
    expect(results).toContain('stalemate')
  })
})
