# Shoh & Mot — shaxmatni o'rganish dasturi

Brauzerda ishlaydigan, shaxmatni noldan o'rgatadigan dastur (React + TypeScript + Vite).
Interfeys uch tilda: **o'zbek** (standart), **rus**, **ingliz**.

## Ishga tushirish

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # barcha testlar (vitest)
npm run build      # production build -> dist/
```

### Telefonda sinab ko'rish

```bash
npm run dev -- --host   # terminalda chiqqan "Network" manzilini telefonda oching (bir xil Wi-Fi)
```

Production build'da dastur telefonga ilova sifatida o'rnatiladi ("Bosh ekranga qo'shish") va internetsiz ham ishlaydi
(`public/manifest.webmanifest`, `public/sw.js`).

## Bo'limlar

- **Darslar** (15 ta) — taxta va kataklar, har bir figuraning yurishi, piyodaning aylanishi,
  rokirovka, o'tib ketayotganda olish, shax, mot, pat/durang, figuralar qiymati, debyut qoidalari.
  Mashq turlari: katakni topish, "yulduzchalarni yig'ish", haqiqiy pozitsiyada vazifa bajarish.
- **Masalalar** (19 ta) — 1 va 2 yurishda mot, vilka va boshqa taktik usullar. Maslahat va yechimni ko'rsatish bor.
  2 yurishli matlarda boshqa to'g'ri yechim ham qabul qilinadi.
- **O'ynash** — kompyuterga qarshi o'yin, 4 ta qiyinlik darajasi, maslahat (strelka), yurishni qaytarish.

Progress (o'tilgan darslar va yechilgan masalalar) brauzerning `localStorage`ida saqlanadi.

## Tuzilishi

```
src/
  engine/      kompyuter raqib: 0x88 yurish generatori, alpha-beta qidiruv, mot topuvchi, Web Worker
  components/  Board (taxta: bosish va sudrab yurish, strelkalar, belgilar, piyoda aylanishi)
  lessons/     darslar ma'lumoti (data.ts), mashq turlari (steps.tsx), vazifa tekshiruvchi (goals.ts)
  puzzles/     masalalar (data.ts) va yechimni tekshirish (logic.ts)
  play/        kompyuterga qarshi o'yin sahifasi
  i18n/        tarjimalar (ui.ts) va til konteksti
```

UI uchun qoidalar [chess.js](https://github.com/jhlywa/chess.js) orqali tekshiriladi; kompyuter raqib esa
tezlik uchun alohida engine'da ishlaydi (perft testlari bilan tekshirilgan).

## Yangi dars yoki masala qo'shish

- Dars: `src/lessons/data.ts` dagi `LESSONS` ro'yxatiga yangi obyekt qo'shing. Har bir matn `T(uz, ru, en)` ko'rinishida.
- Masala: `src/puzzles/data.ts` dagi `PUZZLES` ro'yxatiga FEN va UCI yechim qo'shing.
- `npm test` har bir mashq yechilishi mumkinligini, masalalardagi mot haqiqatan mot ekanini avtomatik tekshiradi.

## Litsenziyalar

Figura rasmlari — Colin M.L. Burnett'ning "cburnett" to'plami (GPLv2+/GFDL/BSD), `src/assets/pieces/`.
