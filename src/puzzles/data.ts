import type { Text } from '../i18n'

export type PuzzleTheme = 'mate1' | 'mate2' | 'tactics'

export interface Puzzle {
  id: string
  theme: PuzzleTheme
  fen: string
  /** UCI moves: the solver's move, the opponent's reply, the solver's move... */
  solution: string[]
  hint: Text
}

const T = (uz: string, ru: string, en: string): Text => ({ uz, ru, en })

export const THEMES: PuzzleTheme[] = ['mate1', 'mate2', 'tactics']

export const PUZZLES: Puzzle[] = [
  // ------------------------------------------------------------ mate in 1
  {
    id: 'm1-back-rank',
    theme: 'mate1',
    fen: '6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1',
    solution: ['a1a8'],
    hint: T(
      `Qora shohning orqa qatori bo'sh — uni o'z piyodalari qamab qo'ygan.`,
      `Последняя горизонталь чёрных пуста — короля заперли собственные пешки.`,
      `Black's back rank is empty — the king is boxed in by its own pawns.`,
    ),
  },
  {
    id: 'm1-scholar',
    theme: 'mate1',
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
    solution: ['h5f7'],
    hint: T(
      `f7 katagini faqat qora shoh himoya qilmoqda.`,
      `Поле f7 защищает только чёрный король.`,
      `The f7 square is defended only by the black king.`,
    ),
  },
  {
    id: 'm1-queen-king',
    theme: 'mate1',
    fen: '7k/8/6K1/8/8/8/8/1Q6 w - - 0 1',
    solution: ['b1b8'],
    hint: T(
      `Shohingiz qora shohning qochish yo'llarini allaqachon yopib turibdi.`,
      `Ваш король уже отрезает чёрному королю пути отступления.`,
      `Your king already covers the black king's escape squares.`,
    ),
  },
  {
    id: 'm1-smothered',
    theme: 'mate1',
    fen: '6rk/6pp/7N/8/8/8/8/6K1 w - - 0 1',
    solution: ['h6f7'],
    hint: T(
      `Qora shohni o'z figuralari o'rab olgan. Ot bilan shax bering!`,
      `Чёрный король окружён своими фигурами. Шах конём!`,
      `The black king is surrounded by its own pieces. Check with the knight!`,
    ),
  },
  {
    id: 'm1-black-rook',
    theme: 'mate1',
    fen: '3r2k1/8/8/8/8/8/5PPP/6K1 b - - 0 1',
    solution: ['d8d1'],
    hint: T(
      `Oq shohning orqa qatori himoyasiz.`,
      `Последняя горизонталь белых не защищена.`,
      `White's back rank is unprotected.`,
    ),
  },
  {
    id: 'm1-pawn-support',
    theme: 'mate1',
    fen: '6k1/5p1p/5PpQ/8/8/8/8/6K1 w - - 0 1',
    solution: ['h6g7'],
    hint: T(
      `f6 dagi piyoda farzinni qo'llab-quvvatlaydi.`,
      `Пешка f6 поддержит ферзя.`,
      `The pawn on f6 will support your queen.`,
    ),
  },
  {
    id: 'm1-arabian',
    theme: 'mate1',
    fen: '7k/R7/5N2/8/8/8/8/6K1 w - - 0 1',
    solution: ['a7h7'],
    hint: T(`Ot h7 katagini himoya qiladi.`, `Конь защищает поле h7.`, `The knight protects h7.`),
  },
  {
    id: 'm1-ladder',
    theme: 'mate1',
    fen: '6k1/R7/8/8/8/8/8/1R4K1 w - - 0 1',
    solution: ['b1b8'],
    hint: T(
      `Bir ruh 7-qatorni yopib turibdi, ikkinchisi shax beradi.`,
      `Одна ладья держит 7-ю горизонталь, другая объявляет шах.`,
      `One rook guards the 7th rank — the other gives check.`,
    ),
  },
  {
    id: 'm1-long-diagonal',
    theme: 'mate1',
    fen: '6k1/5p1p/6p1/8/3Q4/8/1B3PPP/6K1 w - - 0 1',
    solution: ['d4g7'],
    hint: T(
      `Uzun diagonaldagi fil farzinni qo'llab-quvvatlaydi.`,
      `Слон на длинной диагонали поддерживает ферзя.`,
      `The bishop on the long diagonal supports the queen.`,
    ),
  },
  {
    id: 'm1-black-queen',
    theme: 'mate1',
    fen: '4q1k1/5ppp/8/8/8/8/5PPP/6K1 b - - 0 1',
    solution: ['e8e1'],
    hint: T(`e-vertikal butunlay ochiq.`, `Вертикаль «e» полностью открыта.`, `The e-file is wide open.`),
  },

  // ------------------------------------------------------------ mate in 2
  {
    id: 'm2-queen-sac',
    theme: 'mate2',
    fen: '2r3k1/5ppp/8/8/8/8/4QPPP/4R1K1 w - - 0 1',
    solution: ['e2e8', 'c8e8', 'e1e8'],
    hint: T(
      `Farzinni qurbon qiling — orqa qator juda kuchsiz!`,
      `Пожертвуйте ферзя — последняя горизонталь очень слаба!`,
      `Sacrifice the queen — the back rank is very weak!`,
    ),
  },
  {
    id: 'm2-rook-king',
    theme: 'mate2',
    fen: 'k7/8/2K5/8/8/8/8/1R6 w - - 0 1',
    solution: ['c6c7', 'a8a7', 'b1a1'],
    hint: T(
      `Avval shoh bilan qora shohning yo'lini yoping, lekin pat qilib qo'ymang.`,
      `Сначала королём отрежьте чёрного короля, но не допустите пат.`,
      `First use your king to box in the black king — but avoid stalemate.`,
    ),
  },
  {
    id: 'm2-two-rooks',
    theme: 'mate2',
    fen: '7k/8/8/8/8/8/R7/1R4K1 w - - 0 1',
    solution: ['b1b7', 'h8g8', 'a2a8'],
    hint: T(
      `Ruhlar zinapoya kabi navbatma-navbat ishlaydi.`,
      `Ладьи работают по очереди, как лесенка.`,
      `The rooks take turns, like climbing a ladder.`,
    ),
  },
  {
    id: 'm2-smothered',
    theme: 'mate2',
    fen: '4r2k/6pp/7N/3Q4/8/8/5PPP/6K1 w - - 0 1',
    solution: ['d5g8', 'e8g8', 'h6f7'],
    hint: T(
      `Farzinni g8 da qurbon qiling, keyin ot bilan «bo'g'ilgan mat» qo'ying.`,
      `Пожертвуйте ферзя на g8, а затем поставьте конём «спёртый мат».`,
      `Sacrifice the queen on g8, then deliver a smothered mate with the knight.`,
    ),
  },

  // ------------------------------------------------------------ tactics
  {
    id: 't-hanging-queen',
    theme: 'tactics',
    fen: 'rnb1kbnr/ppp1pppp/8/3q4/8/2N5/PPPP1PPP/R1BQKBNR w KQkq - 0 3',
    solution: ['c3d5'],
    hint: T(`Raqib farzini himoyalanmagan.`, `Ферзь соперника не защищён.`, `The enemy queen is undefended.`),
  },
  {
    id: 't-knight-fork',
    theme: 'tactics',
    fen: '6k1/5ppp/2q5/3N4/8/8/5PPP/6K1 w - - 0 1',
    solution: ['d5e7', 'g8f8', 'e7c6'],
    hint: T(
      `Ot bilan bir vaqtda shoh va farzinga hujum qiling — bu «vilka».`,
      `Нападите конём одновременно на короля и ферзя — это «вилка».`,
      `Attack the king and the queen at the same time with the knight — a fork.`,
    ),
  },
  {
    id: 't-skewer',
    theme: 'tactics',
    fen: '8/pp6/6q1/8/B3k3/8/PP6/K7 w - - 0 1',
    solution: ['a4c2', 'e4e5', 'c2g6'],
    hint: T(
      `Shohga shax bering — u chetga chiqqach, orqasidagi farzin ochilib qoladi.`,
      `Объявите шах — когда король отойдёт, ферзь за ним окажется под ударом.`,
      `Check the king — once it steps aside, the queen behind it is exposed.`,
    ),
  },
  {
    id: 't-pawn-fork',
    theme: 'tactics',
    fen: '6k1/5ppp/2n1b3/8/3PP3/8/5PPP/6K1 w - - 0 1',
    solution: ['d4d5', 'c6e5', 'd5e6'],
    hint: T(
      `Piyoda ham ikki figuraga bir vaqtda hujum qila oladi!`,
      `Пешка тоже может напасть сразу на две фигуры!`,
      `A pawn can attack two pieces at once too!`,
    ),
  },
  {
    id: 't-black-fork',
    theme: 'tactics',
    fen: '4k3/pp6/8/8/3n4/8/PP6/R3K3 b - - 0 1',
    solution: ['d4c2', 'e1d2', 'c2a1'],
    hint: T(
      `Ot bilan shoh va ruhga bir vaqtda hujum qiling.`,
      `Нападите конём одновременно на короля и ладью.`,
      `Attack the king and the rook at the same time with the knight.`,
    ),
  },
]

/** Number of moves the solver has to make. */
export const solverMoves = (p: Puzzle) => Math.ceil(p.solution.length / 2)
