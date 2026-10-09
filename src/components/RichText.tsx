import { Fragment } from 'react'

/** Renders paragraphs (blank-line separated), line breaks and **bold** text. */
export function RichText({ text }: { text: string }) {
  return (
    <div className="rich-text">
      {text.split(/\n\n+/).map((para, i) => (
        <p key={i}>
          {para.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
            part.startsWith('**') && part.endsWith('**') ? (
              <strong key={j}>{part.slice(2, -2)}</strong>
            ) : (
              <Fragment key={j}>{part}</Fragment>
            ),
          )}
        </p>
      ))}
    </div>
  )
}
