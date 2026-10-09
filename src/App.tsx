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
    { key: '', label: t('nav.home'), icon: '🏠' },
    { key: 'lessons', label: t('nav.lessons'), icon: '📚' },
    { key: 'puzzles', label: t('nav.puzzles'), icon: '🧩' },
    { key: 'play', label: t('nav.play'), icon: '♟️' },
  ] as const
  // A single lesson or puzzle is a focused screen: on phones the tab bar
  // makes room for the lesson's own fixed "Next" bar.
  const focused = (section === 'lessons' || section === 'puzzles') && !!id

  return (
    <div className={`app${focused ? ' focused' : ''}`}>
      <header className="topbar">
        <a className="brand" href={href()}>
          <img src={PIECE_IMAGES.wK} alt="" />
          <span>
            Shoh <span className="brand-amp">&amp;</span> Mot
          </span>
        </a>
        <nav className="nav">
          {navItems.map((item) => (
            <a
              key={item.key}
              href={item.key ? href(item.key) : href()}
              className={`${(section ?? '') === item.key ? 'active' : ''}${item.key ? '' : ' home-tab'}`}
            >
              <span className="nav-icon" aria-hidden>
                {item.icon}
              </span>
              <span className="nav-label">{item.label}</span>
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
