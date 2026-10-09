import { PIECE_IMAGES } from './chess/pieces'
import { useI18n } from './i18n'
import { LANGS } from './i18n/types'
import { LessonPage } from './lessons/LessonPage'
import { LessonsPage } from './lessons/LessonsPage'
import { HomePage } from './pages/HomePage'
import { PlayPage } from './play/PlayPage'
import { PuzzleView, PuzzlesPage } from './puzzles/PuzzlesPage'
import { href, useRoute } from './router'

export default function App() {
  const { t, lang, setLang } = useI18n()
  const [section, id] = useRoute()

  let page
  if (section === 'lessons') page = id ? <LessonPage key={id} id={id} /> : <LessonsPage />
  else if (section === 'puzzles') page = id ? <PuzzleView key={id} id={id} /> : <PuzzlesPage />
  else if (section === 'play') page = <PlayPage />
  else page = <HomePage />

  const navItems = [
    { key: 'lessons', label: t('nav.lessons') },
    { key: 'puzzles', label: t('nav.puzzles') },
    { key: 'play', label: t('nav.play') },
  ] as const

  return (
    <div className="app">
      <header className="topbar">
        <a className="brand" href={href()}>
          <img src={PIECE_IMAGES.wN} alt="" />
          <span>{t('appName')}</span>
        </a>
        <nav className="nav">
          {navItems.map((item) => (
            <a key={item.key} href={href(item.key)} className={section === item.key ? 'active' : ''}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="lang-switch" role="group" aria-label={t('language')}>
          {LANGS.map((l) => (
            <button
              key={l.code}
              type="button"
              className={lang === l.code ? 'active' : ''}
              onClick={() => setLang(l.code)}
              title={l.label}
            >
              {l.code.toUpperCase()}
            </button>
          ))}
        </div>
      </header>
      <main>{page}</main>
    </div>
  )
}
