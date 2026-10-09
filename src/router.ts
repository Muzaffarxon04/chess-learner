import { useEffect, useState } from 'react'

/** Tiny hash router: "#/lessons/rook" -> ["lessons", "rook"]. */
export function useRoute(): string[] {
  const [hash, setHash] = useState(() => window.location.hash)
  useEffect(() => {
    const onChange = () => {
      setHash(window.location.hash)
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return hash.replace(/^#\/?/, '').split('/').filter(Boolean)
}

export const href = (...parts: string[]) => '#/' + parts.join('/')

export const navigate = (...parts: string[]) => {
  window.location.hash = href(...parts)
}
