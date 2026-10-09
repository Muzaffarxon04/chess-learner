import { PIECE_IMAGES } from '../chess/pieces'
import { useI18n } from '../i18n'
import { useProgress } from '../progress'
import { href } from '../router'
import { LESSONS, SECTIONS } from './data'

export function LessonsPage() {
  const { t, tx } = useI18n()
  const { lessons: done } = useProgress()
  let number = 0
  return (
    <div className="page">
      <div className="page-head">
        <h1>{t('lessons.title')}</h1>
        <p className="muted">{t('progress', { done: done.length, total: LESSONS.length })}</p>
        <ProgressBar value={done.length / LESSONS.length} />
      </div>
      {SECTIONS.map((section) => (
        <section key={section} className="lesson-section">
          <h2>{t(`section.${section}`)}</h2>
          <div className="card-grid">
            {LESSONS.filter((l) => l.section === section).map((lesson) => {
              number++
              const isDone = done.includes(lesson.id)
              return (
                <a key={lesson.id} href={href('lessons', lesson.id)} className={`lesson-card${isDone ? ' done' : ''}`}>
                  <img src={PIECE_IMAGES[lesson.icon]} alt="" className="lesson-icon" />
                  <div className="lesson-card-body">
                    <div className="lesson-card-title">
                      <span className="lesson-number">{number}.</span> {tx(lesson.title)}
                    </div>
                    <div className="muted small">{tx(lesson.summary)}</div>
                  </div>
                  {isDone && <span className="check" aria-label="done">✓</span>}
                </a>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="progress-bar" role="progressbar" aria-valuenow={Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100}>
      <div style={{ width: `${Math.min(100, value * 100)}%` }} />
    </div>
  )
}
