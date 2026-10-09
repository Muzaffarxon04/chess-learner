import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { I18nProvider } from './i18n'
import { ProgressProvider } from './progress'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <ProgressProvider>
        <App />
      </ProgressProvider>
    </I18nProvider>
  </StrictMode>,
)

// Installable app + offline support (only in production builds, so the dev
// server never serves stale cached files).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {})
  })
}
