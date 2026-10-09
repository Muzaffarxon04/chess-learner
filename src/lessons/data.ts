import type { Square } from '../chess/pieces'
import type { MarkKind } from '../components/Board'
import type { Text } from '../i18n'
import type { Lesson, SectionId } from './types'

const T = (uz: string, ru: string, en: string): Text => ({ uz, ru, en })

const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

const mark = (kind: MarkKind, ...squares: Square[]) =>
  Object.fromEntries(squares.map((s) => [s, kind])) as Partial<Record<Square, MarkKind>>

// Shared exercise instructions
const COLLECT = T(
  `Barcha yulduzchalarni yig'ing — iloji boricha kam yurishda!`,
  `Соберите все звёздочки — за как можно меньшее число ходов!`,
  `Collect all the stars — in as few moves as possible!`,
)
const CAPTURE_ALL = T(
  `Raqibning barcha figuralarini urib oling!`,
  `Возьмите все фигуры соперника!`,
  `Capture all the enemy pieces!`,
)
const MATE_IN_ONE = T(`Bir yurishda mat qo'ying!`, `Поставьте мат в один ход!`, `Checkmate in one move!`)
const EN_PASSANT_TASK = T(
  `Raqib piyodasi ikki katak yuradi. Uni o'tib ketayotganda urib oling!`,
  `Пешка соперника пойдёт на два поля. Возьмите её на проходе!`,
  `The enemy pawn will advance two squares. Capture it en passant!`,
)

export const SECTIONS: SectionId[] = ['basics', 'pieces', 'special', 'goal', 'strategy']

export const LESSONS: Lesson[] = [
  // ---------------------------------------------------------------- basics
  {
    id: 'board',
    section: 'basics',
    icon: 'wR',
    title: T(`Shaxmat taxtasi`, `Шахматная доска`, `The chessboard`),
    summary: T(`Kataklar, vertikal va gorizontallar`, `Поля, вертикали и горизонтали`, `Squares, files and ranks`),
    steps: [
      {
        kind: 'info',
        pieces: {},
        marks: mark('highlight', 'h1'),
        text: T(
          `Shaxmat taxtasi **64 ta katakdan** iborat: 32 ta oq va 32 ta qora katak.\n\nTaxta shunday qo'yiladiki, har bir o'yinchining **o'ng pastki burchagida oq katak** bo'ladi.`,
          `Шахматная доска состоит из **64 полей**: 32 белых и 32 чёрных.\n\nДоску ставят так, чтобы у каждого игрока **в правом нижнем углу было белое поле**.`,
          `A chessboard has **64 squares**: 32 light and 32 dark.\n\nThe board is always placed so that each player has a **light square in the bottom-right corner**.`,
        ),
      },
      {
        kind: 'info',
        pieces: {},
        marks: {
          ...mark('highlight', 'e1', 'e2', 'e3', 'e5', 'e6', 'e7', 'e8', 'a4', 'b4', 'c4', 'd4', 'f4', 'g4', 'h4'),
          e4: 'good',
        },
        text: T(
          `Tik qatorlar — **vertikallar** — harflar bilan belgilanadi: **a** dan **h** gacha. Yotiq qatorlar — **gorizontallar** — raqamlar bilan: **1** dan **8** gacha.\n\nHar bir katakning o'z nomi bor: avval harf, keyin raqam. Masalan, e-vertikal va 4-gorizontal kesishgan yashil katak — **e4**.`,
          `Вертикальные ряды — **вертикали** — обозначаются буквами от **a** до **h**. Горизонтальные ряды — **горизонтали** — цифрами от **1** до **8**.\n\nУ каждого поля есть имя: сначала буква, потом цифра. Например, зелёное поле на пересечении вертикали e и 4-й горизонтали — это **e4**.`,
          `The vertical columns — **files** — are labelled **a** to **h**. The horizontal rows — **ranks** — are numbered **1** to **8**.\n\nEvery square has a name: first the letter, then the number. The green square, where the e-file meets the 4th rank, is **e4**.`,
        ),
      },
      {
        kind: 'squares',
        count: 6,
        text: T(
          `Endi siz navbatdasiz! Ko'rsatilgan katakni taxtadan toping va ustiga bosing.`,
          `Теперь ваша очередь! Найдите на доске указанное поле и нажмите на него.`,
          `Your turn! Find the named square on the board and click it.`,
        ),
      },
      {
        kind: 'info',
        fen: START,
        marks: mark('highlight', 'd1', 'd8'),
        text: T(
          `O'yin boshida har bir tomonda **16 ta figura** bo'ladi: 8 ta piyoda, 2 ta ruh, 2 ta ot, 2 ta fil, farzin va shoh.\n\nFarzin o'z rangidagi katakka qo'yiladi: oq farzin — oq katakka (d1), qora farzin — qora katakka (d8).\n\n**Oqlar har doim birinchi yuradi**, keyin o'yinchilar navbatma-navbat yurishadi.`,
          `В начале партии у каждой стороны **16 фигур**: 8 пешек, 2 ладьи, 2 коня, 2 слона, ферзь и король.\n\nФерзь ставится на поле своего цвета: белый ферзь — на белое поле (d1), чёрный — на чёрное (d8).\n\n**Белые всегда ходят первыми**, затем игроки ходят по очереди.`,
          `At the start each side has **16 pieces**: 8 pawns, 2 rooks, 2 knights, 2 bishops, a queen and a king.\n\nThe queen starts on her own colour: the white queen on a light square (d1), the black queen on a dark square (d8).\n\n**White always moves first**, then the players take turns.`,
        ),
      },
    ],
  },

  // ---------------------------------------------------------------- pieces
  {
    id: 'rook',
    section: 'pieces',
    icon: 'wR',
    title: T(`Ruh`, `Ладья`, `The rook`),
    summary: T(`To'g'ri chiziqlar bo'ylab yuradi`, `Ходит по прямым линиям`, `Moves in straight lines`),
    steps: [
      {
        kind: 'info',
        pieces: { d4: 'wR' },
        showMoves: 'd4',
        sandbox: true,
        text: T(
          `**Ruh** vertikal va gorizontal bo'ylab istalgancha katak yuradi.\n\nRuhni bosing va uni taxta bo'ylab yurgizib ko'ring!`,
          `**Ладья** ходит по вертикали и горизонтали на любое число полей.\n\nНажмите на ладью и попробуйте подвигать её по доске!`,
          `The **rook** moves any number of squares along a file or a rank.\n\nClick the rook and try moving it around the board!`,
        ),
      },
      {
        kind: 'stars',
        hero: { square: 'a1', piece: 'wR' },
        stars: ['a6'],
        text: T(`Ruhni yulduzchaga olib boring.`, `Приведите ладью к звёздочке.`, `Move the rook to the star.`),
      },
      { kind: 'stars', hero: { square: 'c3', piece: 'wR' }, stars: ['c7', 'g7', 'g2'], text: COLLECT },
      {
        kind: 'info',
        pieces: { d4: 'wR', d6: 'wP', f4: 'bN' },
        showMoves: 'd4',
        sandbox: true,
        text: T(
          `Ruh boshqa figuralar ustidan **sakray olmaydi**. O'z figurangiz yo'lni to'sadi, raqib figurasini esa ruh **urib olishi** mumkin: u shu katakka yuradi, raqib figurasi esa taxtadan olib tashlanadi.`,
          `Ладья **не может перепрыгивать** через фигуры. Своя фигура преграждает путь, а фигуру соперника ладья может **взять**: она встаёт на её поле, а взятая фигура снимается с доски.`,
          `The rook **cannot jump** over pieces. Your own piece blocks the way, but an enemy piece can be **captured**: the rook moves onto its square and the enemy piece is removed.`,
        ),
      },
      {
        kind: 'stars',
        hero: { square: 'a1', piece: 'wR' },
        enemies: { a5: 'bP', e5: 'bN', e8: 'bB', h8: 'bQ' },
        text: CAPTURE_ALL,
      },
    ],
  },
  {
    id: 'bishop',
    section: 'pieces',
    icon: 'wB',
    title: T(`Fil`, `Слон`, `The bishop`),
    summary: T(`Diagonal bo'ylab yuradi`, `Ходит по диагоналям`, `Moves diagonally`),
    steps: [
      {
        kind: 'info',
        pieces: { d4: 'wB' },
        showMoves: 'd4',
        sandbox: true,
        text: T(
          `**Fil** diagonal bo'ylab istalgancha katak yuradi.\n\nShuning uchun fil **doim bir xil rangdagi kataklarda** qoladi: oq katakdagi fil hech qachon qora katakka o'ta olmaydi.`,
          `**Слон** ходит по диагонали на любое число полей.\n\nПоэтому слон **всегда остаётся на полях одного цвета**: белопольный слон никогда не попадёт на чёрное поле.`,
          `The **bishop** moves any number of squares diagonally.\n\nThat's why a bishop **always stays on the same colour**: a light-squared bishop can never reach a dark square.`,
        ),
      },
      {
        kind: 'stars',
        hero: { square: 'c1', piece: 'wB' },
        stars: ['f4'],
        text: T(`Filni yulduzchaga olib boring.`, `Приведите слона к звёздочке.`, `Move the bishop to the star.`),
      },
      { kind: 'stars', hero: { square: 'f1', piece: 'wB' }, stars: ['b5', 'e8', 'h5'], text: COLLECT },
      {
        kind: 'stars',
        hero: { square: 'c1', piece: 'wB' },
        enemies: { g5: 'bP', d8: 'bN', a5: 'bR' },
        text: CAPTURE_ALL,
      },
    ],
  },
  {
    id: 'queen',
    section: 'pieces',
    icon: 'wQ',
    title: T(`Farzin`, `Ферзь`, `The queen`),
    summary: T(`Eng kuchli figura`, `Самая сильная фигура`, `The most powerful piece`),
    steps: [
      {
        kind: 'info',
        pieces: { d4: 'wQ' },
        showMoves: 'd4',
        sandbox: true,
        text: T(
          `**Farzin** — eng kuchli figura. U ruh va filning imkoniyatlarini birlashtiradi: vertikal, gorizontal va diagonal bo'ylab istalgancha katak yuradi.`,
          `**Ферзь** — самая сильная фигура. Он сочетает ходы ладьи и слона: ходит по вертикали, горизонтали и диагонали на любое число полей.`,
          `The **queen** is the most powerful piece. She combines the rook and the bishop: she moves any number of squares along files, ranks and diagonals.`,
        ),
      },
      { kind: 'stars', hero: { square: 'd1', piece: 'wQ' }, stars: ['d7', 'h3', 'a3'], text: COLLECT },
      {
        kind: 'stars',
        hero: { square: 'd4', piece: 'wQ' },
        enemies: { b6: 'bP', g7: 'bN', g1: 'bB', b2: 'bR', e8: 'bR' },
        text: CAPTURE_ALL,
      },
    ],
  },
  {
    id: 'king',
    section: 'pieces',
    icon: 'wK',
    title: T(`Shoh`, `Король`, `The king`),
    summary: T(`Eng muhim figura`, `Самая важная фигура`, `The most important piece`),
    steps: [
      {
        kind: 'info',
        pieces: { e4: 'wK' },
        showMoves: 'e4',
        sandbox: true,
        text: T(
          `**Shoh** istalgan tomonga — oldinga, orqaga, yonga yoki diagonal bo'ylab — **faqat bitta katak** yuradi.\n\nShoh — eng muhim figura. Butun o'yin o'z shohingizni himoya qilish va raqib shohini qo'lga tushirish atrofida quriladi.`,
          `**Король** ходит в любом направлении — вперёд, назад, вбок или по диагонали — **только на одно поле**.\n\nКороль — самая важная фигура. Вся игра строится вокруг защиты своего короля и атаки на короля соперника.`,
          `The **king** moves in any direction — forward, back, sideways or diagonally — but **only one square**.\n\nThe king is the most important piece: the whole game revolves around protecting yours and trapping your opponent's.`,
        ),
      },
      {
        kind: 'stars',
        hero: { square: 'e1', piece: 'wK' },
        stars: ['e3'],
        text: T(`Shohni yulduzchaga olib boring.`, `Приведите короля к звёздочке.`, `Walk the king to the star.`),
      },
      { kind: 'stars', hero: { square: 'e1', piece: 'wK' }, stars: ['d3', 'f4', 'e6'], text: COLLECT },
      {
        kind: 'stars',
        hero: { square: 'd4', piece: 'wK' },
        enemies: { c5: 'bP', e6: 'bN', f5: 'bB' },
        text: CAPTURE_ALL,
      },
    ],
  },
  {
    id: 'knight',
    section: 'pieces',
    icon: 'wN',
    title: T(`Ot`, `Конь`, `The knight`),
    summary: T(`«L» shaklida sakraydi`, `Прыгает буквой «Г»`, `Jumps in an L-shape`),
    steps: [
      {
        kind: 'info',
        pieces: { d4: 'wN' },
        showMoves: 'd4',
        sandbox: true,
        text: T(
          `**Ot** «L» harfi shaklida yuradi: bir tomonga ikki katak, so'ng yon tomonga bir katak.\n\nE'tibor bering: ot har bir yurishda katak rangini almashtiradi.`,
          `**Конь** ходит буквой «Г»: на два поля в одну сторону и затем на одно поле вбок.\n\nЗаметьте: каждым ходом конь меняет цвет поля.`,
          `The **knight** moves in an L-shape: two squares in one direction, then one square to the side.\n\nNotice that it changes square colour with every move.`,
        ),
      },
      {
        kind: 'stars',
        hero: { square: 'b1', piece: 'wN' },
        stars: ['c3'],
        text: T(`Otni yulduzchaga olib boring.`, `Приведите коня к звёздочке.`, `Move the knight to the star.`),
      },
      { kind: 'stars', hero: { square: 'g1', piece: 'wN' }, stars: ['f3', 'e5', 'd7'], text: COLLECT },
      {
        kind: 'stars',
        hero: { square: 'b1', piece: 'wN' },
        blockers: { a2: 'wP', b2: 'wP', c2: 'wP', d2: 'wP' },
        stars: ['c3', 'b5', 'd6'],
        text: T(
          `Ot — boshqa figuralar ustidan **sakrab o'ta oladigan** yagona figura. Yulduzchalarni yig'ing!`,
          `Конь — единственная фигура, которая **может перепрыгивать** через другие. Соберите звёздочки!`,
          `The knight is the only piece that can **jump over** others. Collect the stars!`,
        ),
      },
      {
        kind: 'stars',
        hero: { square: 'e4', piece: 'wN' },
        enemies: { f6: 'bP', d7: 'bB', b6: 'bR', c4: 'bQ' },
        text: CAPTURE_ALL,
      },
    ],
  },
  {
    id: 'pawn',
    section: 'pieces',
    icon: 'wP',
    title: T(`Piyoda`, `Пешка`, `The pawn`),
    summary: T(`Kichik, lekin muhim`, `Маленькая, но важная`, `Small but important`),
    steps: [
      {
        kind: 'info',
        pieces: { e2: 'wP' },
        showMoves: 'e2',
        sandbox: true,
        text: T(
          `**Piyoda** faqat **oldinga**, bir katak yuradi. U orqaga qaytolmaydi.\n\nLekin o'zining **birinchi yurishida** piyoda bir yoki ikki katak yurishi mumkin.`,
          `**Пешка** ходит только **вперёд** на одно поле и никогда не отступает.\n\nНо своим **первым ходом** пешка может пойти на одно или на два поля.`,
          `The **pawn** moves only **forward**, one square at a time. It can never go back.\n\nBut on its **first move** a pawn may advance one or two squares.`,
        ),
      },
      {
        kind: 'info',
        pieces: { e4: 'wP', d5: 'bN', f5: 'bB', e5: 'bP' },
        showMoves: 'e4',
        sandbox: true,
        text: T(
          `Piyoda to'g'ri yuradi, lekin **diagonal bo'yicha urib oladi** — oldinga, bir katak qiyshiq.\n\nAgar piyodaning to'g'ri oldida biror figura tursa, uning yo'li to'silgan bo'ladi.`,
          `Пешка ходит прямо, но **бьёт по диагонали** — на одно поле вперёд наискосок.\n\nЕсли прямо перед пешкой стоит фигура, пешка заблокирована.`,
          `A pawn moves straight ahead but **captures diagonally** — one square forward to the side.\n\nIf a piece stands directly in front of a pawn, the pawn is blocked.`,
        ),
      },
      {
        kind: 'stars',
        hero: { square: 'e2', piece: 'wP' },
        stars: ['e4'],
        text: T(
          `Piyodani **bitta yurishda** yulduzchaga yetkazing.`,
          `Доведите пешку до звёздочки **за один ход**.`,
          `Get the pawn to the star **in one move**.`,
        ),
      },
      { kind: 'stars', hero: { square: 'd2', piece: 'wP' }, stars: ['d3', 'd5'], text: COLLECT },
      {
        kind: 'stars',
        hero: { square: 'b2', piece: 'wP' },
        enemies: { c3: 'bP', d4: 'bN', c5: 'bB', b6: 'bR' },
        text: CAPTURE_ALL,
      },
    ],
  },

  // ---------------------------------------------------------------- special moves
  {
    id: 'promotion',
    section: 'special',
    icon: 'wQ',
    title: T(`Piyodaning aylanishi`, `Превращение пешки`, `Pawn promotion`),
    summary: T(`Piyoda farzinga aylanadi`, `Пешка становится ферзём`, `A pawn becomes a queen`),
    steps: [
      {
        kind: 'info',
        fen: '4k3/1P6/8/8/8/8/8/4K3 w - - 0 1',
        arrows: [{ from: 'b7', to: 'b8' }],
        text: T(
          `Piyoda taxtaning **oxirgi qatoriga** yetib borsa, u istalgan figuraga aylanadi: farzin, ruh, fil yoki otga (faqat shohga emas).\n\nKo'pincha eng kuchli figura — **farzin** tanlanadi.`,
          `Когда пешка доходит до **последней горизонтали**, она превращается в любую фигуру: ферзя, ладью, слона или коня (но не в короля).\n\nЧаще всего выбирают самую сильную фигуру — **ферзя**.`,
          `When a pawn reaches the **last rank**, it is promoted to any piece: a queen, rook, bishop or knight (but not a king).\n\nMost of the time players choose the strongest piece — the **queen**.`,
        ),
      },
      {
        kind: 'goal',
        fen: '4k3/1P6/8/8/8/8/8/4K3 w - - 0 1',
        goal: { type: 'promote', piece: 'q' },
        text: T(
          `Piyodani oxirgi qatorga yurgizing va uni **farzinga** aylantiring.`,
          `Продвиньте пешку на последнюю горизонталь и превратите её в **ферзя**.`,
          `Push the pawn to the last rank and promote it to a **queen**.`,
        ),
      },
      {
        kind: 'goal',
        fen: '1r2k3/2P5/8/8/8/8/8/4K3 w - - 0 1',
        goal: { type: 'promote', capture: true },
        text: T(
          `Piyoda urib olish orqali ham aylanishi mumkin. c8 katagi qora ruh nazoratida — ruhni urib oling va aylaning!`,
          `Пешка может превратиться и со взятием. Поле c8 под ударом чёрной ладьи — возьмите ладью и превратитесь!`,
          `A pawn can also promote by capturing. The c8 square is covered by the black rook — capture the rook and promote!`,
        ),
      },
    ],
  },
  {
    id: 'castling',
    section: 'special',
    icon: 'wK',
    title: T(`Rokirovka`, `Рокировка`, `Castling`),
    summary: T(`Shohni xavfsiz joyga yashirish`, `Прячем короля в безопасное место`, `Tucking the king away safely`),
    steps: [
      {
        kind: 'info',
        fen: 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1',
        arrows: [
          { from: 'e1', to: 'g1' },
          { from: 'h1', to: 'f1', color: 'blue' },
        ],
        text: T(
          `**Rokirovka** — shoh va ruh birgalikda bajaradigan maxsus yurish. Shoh ruh tomonga **ikki katak** yuradi, ruh esa shohning ustidan o'tib, uning yonidagi katakka turadi.\n\n**Qisqa rokirovka** h-ruh bilan, **uzun rokirovka** a-ruh bilan qilinadi. Rokirovka qilish uchun shohni ikki katak yon tomonga yurgizing.`,
          `**Рокировка** — особый ход короля и ладьи вместе. Король перемещается на **два поля** в сторону ладьи, а ладья перепрыгивает через короля и встаёт рядом с ним.\n\n**Короткая рокировка** делается с ладьёй h, **длинная** — с ладьёй a. Чтобы сделать рокировку, передвиньте короля на два поля в сторону.`,
          `**Castling** is a special move made by the king and a rook together. The king moves **two squares** towards the rook, and the rook jumps over to the square next to the king.\n\n**Short castling** uses the h-rook, **long castling** the a-rook. To castle, move the king two squares sideways.`,
        ),
      },
      {
        kind: 'goal',
        fen: 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1',
        goal: { type: 'castle', side: 'k' },
        text: T(
          `**Qisqa** rokirovka qiling (shoh g1 ga).`,
          `Сделайте **короткую** рокировку (король на g1).`,
          `Castle **short** (king to g1).`,
        ),
      },
      {
        kind: 'goal',
        fen: 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1',
        goal: { type: 'castle', side: 'q' },
        text: T(
          `**Uzun** rokirovka qiling (shoh c1 ga).`,
          `Сделайте **длинную** рокировку (король на c1).`,
          `Castle **long** (king to c1).`,
        ),
      },
      {
        kind: 'info',
        fen: 'r3k2r/pppp1ppp/8/8/2b5/8/PPPP1PPP/R3K2R w KQkq - 0 1',
        arrows: [{ from: 'c4', to: 'f1', color: 'red' }],
        marks: mark('bad', 'f1'),
        text: T(
          `Rokirovka qilish **mumkin emas**, agar:\n• shoh yoki shu ruh avval yurgan bo'lsa;\n• shoh va ruh orasida figura bo'lsa;\n• shoh shax ostida bo'lsa;\n• shoh o'tadigan yoki boradigan katak hujum ostida bo'lsa.\n\nRasmda qora fil f1 katagiga hujum qilmoqda — shuning uchun qisqa rokirovka mumkin emas.`,
          `Рокировка **невозможна**, если:\n• король или эта ладья уже ходили;\n• между королём и ладьёй стоят фигуры;\n• король находится под шахом;\n• поле, через которое проходит или на которое встаёт король, атаковано.\n\nНа диаграмме чёрный слон атакует поле f1 — поэтому короткая рокировка невозможна.`,
          `You **cannot** castle if:\n• the king or that rook has already moved;\n• there are pieces between the king and the rook;\n• the king is in check;\n• the king would pass through or land on an attacked square.\n\nIn the diagram the black bishop attacks f1 — so short castling is not allowed.`,
        ),
      },
      {
        kind: 'goal',
        fen: 'r3k2r/pppp1ppp/8/8/2b5/8/PPPP1PPP/R3K2R w KQkq - 0 1',
        goal: { type: 'castle' },
        text: T(
          `Rokirovka qiling. Qaysi tomonga mumkinligini o'ylab ko'ring!`,
          `Сделайте рокировку. Подумайте, в какую сторону это возможно!`,
          `Castle! Think about which side is allowed.`,
        ),
      },
    ],
  },
  {
    id: 'en-passant',
    section: 'special',
    icon: 'wP',
    title: T(`O'tib ketayotganda olish`, `Взятие на проходе`, `En passant`),
    summary: T(`Piyodaning maxsus urishi`, `Особое взятие пешкой`, `A special pawn capture`),
    steps: [
      {
        kind: 'info',
        fen: '4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1',
        arrows: [{ from: 'e5', to: 'd6' }],
        marks: mark('bad', 'd5'),
        text: T(
          `Agar raqib piyodasi birinchi yurishida **ikki katak** yurib, sizning piyodangiz yonida to'xtasa, uni xuddi bir katak yurgandek **urib olishingiz** mumkin.\n\nRasmda qora piyoda d7 dan d5 ga yurdi. Oq piyoda d6 ga yurib, d5 dagi piyodani oladi.\n\nBu urish **faqat darhol** — keyingi yurishda bajarilishi mumkin, aks holda imkoniyat yo'qoladi.`,
          `Если пешка соперника первым ходом прошла **на два поля** и встала рядом с вашей пешкой, вы можете **взять её так**, как будто она прошла только одно поле.\n\nНа диаграмме чёрная пешка пошла с d7 на d5. Белая пешка идёт на d6 и забирает пешку d5.\n\nТакое взятие возможно **только сразу**, следующим ходом — потом это право пропадает.`,
          `If an enemy pawn advances **two squares** on its first move and lands right beside your pawn, you may **capture it as if it had moved only one square**.\n\nIn the diagram Black's pawn went from d7 to d5. White's pawn moves to d6 and removes the pawn on d5.\n\nThis capture must be made **immediately**, on the very next move, or the chance is gone.`,
        ),
      },
      { kind: 'goal', fen: '4k3/3p4/8/4P3/8/8/8/4K3 b - - 0 1', setup: ['d7d5'], goal: { type: 'enpassant' }, text: EN_PASSANT_TASK },
      { kind: 'goal', fen: '4k3/6p1/8/5P2/8/8/8/4K3 b - - 0 1', setup: ['g7g5'], goal: { type: 'enpassant' }, text: EN_PASSANT_TASK },
      { kind: 'goal', fen: '4k3/8/8/8/2p5/8/1P6/4K3 w - - 0 1', setup: ['b2b4'], goal: { type: 'enpassant' }, text: EN_PASSANT_TASK },
    ],
  },

  // ---------------------------------------------------------------- the goal
  {
    id: 'check',
    section: 'goal',
    icon: 'bK',
    title: T(`Shax`, `Шах`, `Check`),
    summary: T(`Shohga hujum`, `Нападение на короля`, `Attacking the king`),
    steps: [
      {
        kind: 'info',
        fen: '4k3/8/8/8/8/8/8/4R1K1 b - - 0 1',
        arrows: [{ from: 'e1', to: 'e8', color: 'red' }],
        text: T(
          `Agar figura raqib shohiga hujum qilsa, bu **shax** deyiladi.\n\nShax berilgan tomon **darhol** shohini himoya qilishi shart. Shohni hujum ostida qoldiradigan yurish qilish mumkin emas.`,
          `Если фигура нападает на короля соперника, это называется **шах**.\n\nСторона, получившая шах, должна **немедленно** защитить короля. Ходы, оставляющие короля под ударом, запрещены.`,
          `When a piece attacks the enemy king, it is called **check**.\n\nA player in check **must** get out of it immediately. Any move that leaves your own king under attack is illegal.`,
        ),
      },
      {
        kind: 'goal',
        fen: '4k3/8/8/8/8/8/8/R3K3 w - - 0 1',
        goal: { type: 'check' },
        text: T(`Ruh bilan shax bering.`, `Объявите шах ладьёй.`, `Give check with the rook.`),
      },
      {
        kind: 'goal',
        fen: '4k3/8/8/8/4N3/8/8/4K3 w - - 0 1',
        goal: { type: 'check' },
        text: T(`Ot bilan shax bering.`, `Объявите шах конём.`, `Give check with the knight.`),
      },
      {
        kind: 'info',
        fen: '4r1k1/8/8/8/8/8/8/4KB2 w - - 0 1',
        arrows: [{ from: 'e8', to: 'e1', color: 'red' }],
        text: T(
          `Shaxdan qutulishning **uchta** yo'li bor:\n1. **Shohni** xavfsiz katakka **yurgizish**.\n2. Shax berayotgan figurani **urib olish**.\n3. Shoh va hujumchi orasiga figura qo'yib, **to'sish**.`,
          `Есть **три** способа защититься от шаха:\n1. **Уйти королём** на безопасное поле.\n2. **Взять** фигуру, объявившую шах.\n3. **Закрыться** — поставить фигуру между королём и атакующим.`,
          `There are **three** ways to get out of check:\n1. **Move the king** to a safe square.\n2. **Capture** the checking piece.\n3. **Block** — put a piece between the king and the attacker.`,
        ),
      },
      {
        kind: 'goal',
        fen: '4k3/8/8/8/8/8/8/r3K3 w - - 0 1',
        goal: { type: 'escape', how: 'king' },
        text: T(
          `Shohga shax! Shohni xavfsiz katakka **o'tkazing**.`,
          `Шах! **Уведите короля** на безопасное поле.`,
          `Check! **Move the king** to a safe square.`,
        ),
      },
      {
        kind: 'goal',
        fen: '6k1/8/8/8/8/5n2/6P1/6K1 w - - 0 1',
        goal: { type: 'escape', how: 'capture' },
        text: T(
          `Shax berayotgan figurani **urib oling**.`,
          `**Возьмите** фигуру, которая объявила шах.`,
          `**Capture** the piece giving check.`,
        ),
      },
      {
        kind: 'goal',
        fen: '4r1k1/8/8/8/8/8/8/4KB2 w - - 0 1',
        goal: { type: 'escape', how: 'block' },
        text: T(
          `Shaxni **to'sing**: shoh va ruh orasiga figura qo'ying.`,
          `**Закройтесь** от шаха: поставьте фигуру между королём и ладьёй.`,
          `**Block** the check: put a piece between the king and the rook.`,
        ),
      },
    ],
  },
  {
    id: 'checkmate',
    section: 'goal',
    icon: 'bK',
    title: T(`Mat`, `Мат`, `Checkmate`),
    summary: T(`O'yinning asosiy maqsadi`, `Главная цель игры`, `The goal of the game`),
    steps: [
      {
        kind: 'info',
        fen: 'R5k1/5ppp/8/8/8/8/8/6K1 b - - 0 1',
        arrows: [{ from: 'a8', to: 'g8', color: 'red' }],
        text: T(
          `Agar shohga shax berilgan bo'lsa va undan **qutulishning iloji bo'lmasa**, bu **mat**. Mat qo'ygan o'yinchi g'alaba qozonadi — bu shaxmatning asosiy maqsadi!\n\nRasmda qora shoh shax ostida: u hech qayerga yura olmaydi (o'z piyodalari to'sib turibdi), ruhni urib ham, to'sib ham bo'lmaydi.`,
          `Если королю объявлен шах и **защититься от него невозможно** — это **мат**. Поставивший мат побеждает — это и есть главная цель шахмат!\n\nНа диаграмме чёрный король под шахом: ему некуда отступить (мешают свои пешки), а ладью нельзя ни взять, ни закрыться от неё.`,
          `If the king is in check and there is **no way to escape**, it is **checkmate**. The player who delivers checkmate wins — that is the goal of chess!\n\nIn the diagram the black king is in check: it cannot move (its own pawns are in the way), and the rook can be neither captured nor blocked.`,
        ),
      },
      { kind: 'goal', fen: '7k/8/6K1/8/8/8/8/R7 w - - 0 1', goal: { type: 'mate' }, text: MATE_IN_ONE },
      { kind: 'goal', fen: 'k7/2Q5/1K6/8/8/8/8/8 w - - 0 1', goal: { type: 'mate' }, text: MATE_IN_ONE },
      {
        kind: 'goal',
        fen: 'rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq - 0 2',
        goal: { type: 'mate' },
        text: T(
          `Oqlar ikkita yomon yurish qilishdi. Qoralar bilan bir yurishda mat qo'ying! (Bu «ahmoqona mat» deb ataladi — eng tez mat.)`,
          `Белые сделали два плохих хода. Поставьте мат чёрными в один ход! (Это «дурацкий мат» — самый быстрый мат в шахматах.)`,
          `White has made two bad moves. Checkmate in one with Black! (This is "Fool's Mate" — the fastest mate in chess.)`,
        ),
      },
    ],
  },
  {
    id: 'draw',
    section: 'goal',
    icon: 'wK',
    title: T(`Pat va durang`, `Пат и ничья`, `Stalemate and draws`),
    summary: T(`G'olibsiz tugaydigan o'yinlar`, `Когда никто не побеждает`, `When nobody wins`),
    steps: [
      {
        kind: 'info',
        fen: 'k7/2Q5/1K6/8/8/8/8/8 b - - 0 1',
        marks: mark('highlight', 'a8'),
        text: T(
          `**Pat** — yurish navbati kelgan tomonning shohi shax ostida emas, lekin uning birorta ham qonuniy yurishi yo'q. Pat — bu **durang**!\n\nRasmda qoralar yurishi kerak, lekin shoh hech qayerga yura olmaydi va boshqa figurasi yo'q. Kuchliroq tomon ehtiyot bo'lishi kerak: g'alaba o'rniga durang bo'lib qolishi mumkin.`,
          `**Пат** — у стороны, чья очередь ходить, король не под шахом, но нет ни одного допустимого хода. Пат — это **ничья**!\n\nНа диаграмме ход чёрных, но королю некуда пойти, а других фигур нет. Сильнейшей стороне нужно быть внимательной: вместо победы может получиться ничья.`,
          `**Stalemate** happens when the player to move is not in check but has no legal move. Stalemate is a **draw**!\n\nIn the diagram it's Black to move, but the king has nowhere to go and there are no other pieces. The stronger side must be careful — a win can easily turn into a draw.`,
        ),
      },
      {
        kind: 'goal',
        fen: '7k/8/5K2/8/8/8/8/6Q1 w - - 0 1',
        goal: { type: 'mate' },
        text: T(
          `Mat qo'ying, lekin **pat qilib qo'ymang**!`,
          `Поставьте мат, но **не допустите пат**!`,
          `Deliver checkmate — but **don't stalemate**!`,
        ),
      },
      {
        kind: 'info',
        fen: '8/8/3k4/8/8/4K3/8/8 w - - 0 1',
        text: T(
          `O'yin yana quyidagi hollarda **durang** bilan tugaydi:\n• **Mat qo'yish uchun kuch yetarli emas** — masalan, faqat ikki shoh qolsa.\n• **Uch marta takrorlanish** — bir xil pozitsiya uch marta takrorlansa.\n• **50 yurish qoidasi** — 50 yurish davomida birorta ham urish yoki piyoda yurishi bo'lmasa.\n• **Kelishuv** — ikkala o'yinchi durangga rozi bo'lsa.`,
          `Партия также заканчивается **вничью**, если:\n• **недостаточно материала** для мата — например, остались только два короля;\n• **троекратное повторение** — одна и та же позиция повторилась три раза;\n• **правило 50 ходов** — за 50 ходов не было ни одного взятия и хода пешкой;\n• **по соглашению** — оба игрока согласились на ничью.`,
          `A game is also **drawn** when:\n• there is **insufficient material** to checkmate — for example, only the two kings are left;\n• **threefold repetition** — the same position occurs three times;\n• the **50-move rule** — 50 moves pass without any capture or pawn move;\n• **by agreement** — both players agree to a draw.`,
        ),
      },
    ],
  },

  // ---------------------------------------------------------------- strategy
  {
    id: 'values',
    section: 'strategy',
    icon: 'wN',
    title: T(`Figuralar qiymati`, `Ценность фигур`, `Piece values`),
    summary: T(`Qaysi figura qimmatroq?`, `Какая фигура ценнее?`, `Which piece is worth more?`),
    steps: [
      {
        kind: 'info',
        pieces: { b4: 'wP', c4: 'wN', d4: 'wB', e4: 'wR', f4: 'wQ', g4: 'wK' },
        text: T(
          `Figuralarning taxminiy qiymati (piyodalarda):\n• Piyoda — **1**\n• Ot — **3**\n• Fil — **3**\n• Ruh — **5**\n• Farzin — **9**\n• Shoh — bebaho: uni yo'qotish — mag'lubiyat.\n\nAlmashuvda arzonroq figurani berib, qimmatroq figurani olishga harakat qiling.`,
          `Примерная ценность фигур (в пешках):\n• Пешка — **1**\n• Конь — **3**\n• Слон — **3**\n• Ладья — **5**\n• Ферзь — **9**\n• Король — бесценен: потерять его — значит проиграть.\n\nПри размене старайтесь отдавать более дешёвую фигуру за более дорогую.`,
          `Approximate piece values (in pawns):\n• Pawn — **1**\n• Knight — **3**\n• Bishop — **3**\n• Rook — **5**\n• Queen — **9**\n• King — priceless: losing it means losing the game.\n\nWhen trading, try to give up cheaper pieces for more valuable ones.`,
        ),
      },
      {
        kind: 'goal',
        fen: '4k3/2p5/1r3q2/3N4/8/4b3/8/4K3 w - - 0 1',
        goal: { type: 'capture', piece: 'q' },
        text: T(
          `Ot bir vaqtning o'zida to'rtta figuraga hujum qilmoqda. **Eng qimmatli** figurani urib oling!`,
          `Конь нападает сразу на четыре фигуры. Возьмите **самую ценную**!`,
          `The knight attacks four pieces at once. Capture the **most valuable** one!`,
        ),
      },
    ],
  },
  {
    id: 'opening',
    section: 'strategy',
    icon: 'wN',
    title: T(`Debyut qoidalari`, `Принципы дебюта`, `Opening principles`),
    summary: T(`O'yinni to'g'ri boshlash`, `Как правильно начать партию`, `How to start a game well`),
    steps: [
      {
        kind: 'info',
        fen: START,
        marks: mark('highlight', 'd4', 'e4', 'd5', 'e5'),
        text: T(
          `O'yin boshida — **debyutda** — uchta oddiy qoidaga amal qiling:\n1. **Markazni egallang.** e4, d4, e5, d5 — eng muhim kataklar.\n2. **Figuralarni rivojlantiring.** Avval otlar va fillarni o'yinga olib chiqing.\n3. **Shohni xavfsiz joyga yashiring** — rokirovka qiling.\n\nShuningdek, farzinni juda erta olib chiqmang va bitta figura bilan ketma-ket ko'p yurmang.`,
          `В начале партии — в **дебюте** — следуйте трём простым правилам:\n1. **Займите центр.** Поля e4, d4, e5, d5 — самые важные.\n2. **Развивайте фигуры.** Сначала выводите коней и слонов.\n3. **Спрячьте короля** — сделайте рокировку.\n\nТакже не выводите ферзя слишком рано и не ходите одной фигурой много раз подряд.`,
          `At the start of the game — the **opening** — follow three simple rules:\n1. **Control the centre.** e4, d4, e5 and d5 are the most important squares.\n2. **Develop your pieces.** Bring out your knights and bishops first.\n3. **Keep your king safe** — castle early.\n\nAlso, don't bring your queen out too early, and don't move the same piece again and again.`,
        ),
      },
      {
        kind: 'goal',
        fen: START,
        goal: { type: 'moves', moves: ['e2e4', 'd2d4'] },
        text: T(
          `Birinchi yurish: markazni piyoda bilan **ikki katak** yurib egallang.`,
          `Первый ход: займите центр, продвинув пешку **на два поля**.`,
          `First move: take the centre by pushing a pawn **two squares**.`,
        ),
      },
      {
        kind: 'goal',
        fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
        goal: { type: 'moves', moves: ['g1f3', 'b1c3'] },
        text: T(
          `Otni markazga yaqinroq **rivojlantiring**.`,
          `**Разовьте** коня поближе к центру.`,
          `**Develop** a knight towards the centre.`,
        ),
      },
      {
        kind: 'goal',
        fen: 'r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
        goal: { type: 'castle', side: 'k' },
        text: T(
          `Otlar va fillar chiqdi. Endi shohni xavfsiz joyga yashiring — **rokirovka** qiling!`,
          `Кони и слоны выведены. Теперь спрячьте короля — сделайте **рокировку**!`,
          `Knights and bishops are out. Now tuck your king away — **castle**!`,
        ),
      },
    ],
  },
]

export const lessonById = (id: string) => LESSONS.find((l) => l.id === id)
