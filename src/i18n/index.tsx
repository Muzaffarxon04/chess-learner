import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { storage } from '../storage'
import type { Lang, Text } from './types'
import { ui, type UiKey } from './ui'

export type { Lang, Text } from './types'

type Vars = Record<string, string | number>

interface I18n {
  lang: Lang
  setLang: (lang: Lang) => void
  /** Translate an interface string. */
  t: (key: UiKey, vars?: Vars) => string
  /** Pick the current language from a content Text. */
  tx: (text: Text, vars?: Vars) => string
}

const I18nContext = createContext<I18n | null>(null)

const fill = (s: string, vars?: Vars) => (vars ? s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m)) : s)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = storage.get<Lang>('lang')
    return saved === 'ru' || saved === 'en' || saved === 'uz' ? saved : 'uz'
  })

  useEffect(() => {
    document.documentElement.lang = lang
    document.title = ui.appName[lang]
  }, [lang])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    storage.set('lang', l)
  }, [])

  const value = useMemo<I18n>(
    () => ({
      lang,
      setLang,
      t: (key, vars) => fill(ui[key][lang], vars),
      tx: (text, vars) => fill(text[lang], vars),
    }),
    [lang, setLang],
  )
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18n {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider')
  return ctx
}
