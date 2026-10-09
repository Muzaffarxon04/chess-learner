import { useState } from 'react'
import { useI18n } from '../i18n'
import { useProgress } from '../progress'
import { href } from '../router'
import { LESSONS, lessonById } from './data'
import { GoalStepView, InfoStepView, SquaresStepView, StarsStepView } from './steps'

export function LessonPage({ id }: { id: string }) {
  const { t, tx } = useI18n()
  const { completeLesson } = useProgress()
  const lesson = lessonById(id)
  const [stepIndex, setStepIndex] = useState(0)
  const [completed, setCompleted] = useState<number[]>([])
  const [finished, setFinished] = useState(false)

  if (!lesson) {
    return (
      <div className="page">
        <a href={href('lessons')}>{t('lesson.back')}</a>
      </div>
    )
  }

  const index = LESSONS.indexOf(lesson)
  const nextLesson = LESSONS[index + 1]
  const step = lesson.steps[stepIndex]
  const isLast = stepIndex === lesson.steps.length - 1
  const canAdvance = step.kind === 'info' || completed.includes(stepIndex)

  const goNext = () => {
    if (isLast) {
      completeLesson(lesson.id)
      setFinished(true)
    } else {
      setStepIndex(stepIndex + 1)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const markDone = () => setCompleted((c) => (c.includes(stepIndex) ? c : [...c, stepIndex]))

  const header = (
    <div className="lesson-head">
      <a href={href('lessons')} className="back-link" aria-label={t('nav.lessons')}>
        <span aria-hidden>←</span>
        <span className="back-text">{t('nav.lessons')}</span>
      </a>
      <h1>{tx(lesson.title)}</h1>
      <div className="step-dots" aria-label={t('lesson.step', { n: stepIndex + 1, total: lesson.steps.length })}>
        {lesson.steps.map((s, i) => (
          <span
            key={i}
            className={[
              'step-dot',
              s.kind === 'info' ? 'info' : 'exercise',
              i === stepIndex && !finished ? 'current' : '',
              i < stepIndex || completed.includes(i) || finished ? 'passed' : '',
            ].join(' ')}
          />
        ))}
        <span className="muted small">{t('lesson.step', { n: stepIndex + 1, total: lesson.steps.length })}</span>
      </div>
    </div>
  )

  if (finished) {
    return (
      <div className="page">
        {header}
        <div className="complete-card">
          <h2>{t('lesson.completeTitle')}</h2>
          <p>{t('lesson.completeText', { title: tx(lesson.title) })}</p>
          <div className="button-row">
            {nextLesson ? (
              <a className="btn primary" href={href('lessons', nextLesson.id)}>
                {t('lesson.nextLesson')} {tx(nextLesson.title)}
              </a>
            ) : (
              <a className="btn primary" href={href('play')}>
                {t('lesson.playNow')}
              </a>
            )}
            <a className="btn" href={href('lessons')}>
              {t('lesson.allLessons')}
            </a>
          </div>
        </div>
      </div>
    )
  }

  const nav = (
    <div className="step-nav">
      <button type="button" className="btn" disabled={stepIndex === 0} onClick={() => setStepIndex(stepIndex - 1)}>
        {t('lesson.prev')}
      </button>
      <button type="button" className={`btn primary${canAdvance && step.kind !== 'info' ? ' pulse' : ''}`} disabled={!canAdvance} onClick={goNext}>
        {isLast ? t('lesson.finish') : t('lesson.next')}
      </button>
    </div>
  )

  // The key remounts the step so every exercise starts fresh.
  const key = `${lesson.id}-${stepIndex}`
  const props = { onComplete: markDone, nav }
  return (
    <div className="page">
      {header}
      {step.kind === 'info' && <InfoStepView key={key} step={step} {...props} />}
      {step.kind === 'squares' && <SquaresStepView key={key} step={step} {...props} />}
      {step.kind === 'stars' && <StarsStepView key={key} step={step} {...props} />}
      {step.kind === 'goal' && <GoalStepView key={key} step={step} {...props} />}
    </div>
  )
}
