import { Board } from '../components/Board'
import { piecesFromFen } from '../chess/pieces'
import { useI18n } from '../i18n'
import { LESSONS } from '../lessons/data'
import { ProgressBar } from '../lessons/LessonsPage'
import { useProgress } from '../progress'
import { PUZZLES } from '../puzzles/data'
import { href } from '../router'

const HERO_FEN = 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4'

export function HomePage() {
  const { t } = useI18n()
  const progress = useProgress()
  const nextLesson = LESSONS.find((l) => !progress.lessons.includes(l.id)) ?? LESSONS[0]
  const started = progress.lessons.length > 0

  return (
    <div className="page home">
      <section className="hero">
        <div className="hero-text">
          <h1>{t('home.title')}</h1>
          <p className="lead">{t('home.subtitle')}</p>
          <a className="btn primary big" href={href('lessons', nextLesson.id)}>
            {started ? t('home.continue') : t('home.start')} →
          </a>
        </div>
        <div className="hero-board">
          <Board
            pieces={piecesFromFen(HERO_FEN)}
            interactive={false}
            arrows={[{ from: 'h5', to: 'f7' }]}
            showCoordinates={false}
          />
        </div>
      </section>

      <section className="feature-grid">
        <a className="feature-card" href={href('lessons')}>
          <div className="feature-icon">📘</div>
          <h2>{t('nav.lessons')}</h2>
          <p>{t('home.lessons')}</p>
          <div className="muted small">{t('progress', { done: progress.lessons.length, total: LESSONS.length })}</div>
          <ProgressBar value={progress.lessons.length / LESSONS.length} />
        </a>
        <a className="feature-card" href={href('puzzles')}>
          <div className="feature-icon">🧩</div>
          <h2>{t('nav.puzzles')}</h2>
          <p>{t('home.puzzles')}</p>
          <div className="muted small">{t('progress', { done: progress.puzzles.length, total: PUZZLES.length })}</div>
          <ProgressBar value={progress.puzzles.length / PUZZLES.length} />
        </a>
        <a className="feature-card" href={href('play')}>
          <div className="feature-icon">♟️</div>
          <h2>{t('nav.play')}</h2>
          <p>{t('home.play')}</p>
        </a>
      </section>
    </div>
  )
}
