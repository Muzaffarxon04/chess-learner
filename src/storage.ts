// localStorage can be unavailable (private mode, blocked cookies), so every access is guarded.
const PREFIX = 'learn-chess:'

export const storage = {
  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(PREFIX + key)
      return raw === null ? null : (JSON.parse(raw) as T)
    } catch {
      return null
    }
  },
  set(key: string, value: unknown) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value))
    } catch {
      // ignore: progress just won't persist
    }
  },
}
