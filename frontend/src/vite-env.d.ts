/// <reference types="vite/client" />
interface Window {
  Telegram?: {
    WebApp: {
      ready: () => void; expand: () => void; close: () => void
      initData: string
      initDataUnsafe: { user?: { id: number; first_name: string; last_name?: string; username?: string; language_code?: string; is_premium?: boolean } }
      colorScheme: string; themeParams: Record<string, string>
      HapticFeedback?: { impactOccurred: (s: 'light'|'medium'|'heavy') => void; notificationOccurred: (t: 'error'|'success'|'warning') => void }
    }
  }
}
declare module '*.module.css' { const classes: Record<string, string>; export default classes }
