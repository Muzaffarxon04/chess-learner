export type Lang = 'uz' | 'ru' | 'en'

/** A piece of text in every supported language. */
export type Text = Record<Lang, string>

export const LANGS: { code: Lang; label: string }[] = [
  { code: 'uz', label: "O'zbek" },
  { code: 'ru', label: 'Русский' },
  { code: 'en', label: 'English' },
]
