interface TelegramWebAppUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  is_premium?: boolean
}

interface TelegramWebApp {
  ready(): void
  expand(): void
  close(): void
  initData: string
  initDataUnsafe: {
    user?: TelegramWebAppUser
  }
  colorScheme: string
  themeParams: Record<string, string>
  HapticFeedback?: {
    impactOccurred(style: 'light' | 'medium' | 'heavy'): void
    notificationOccurred(type: 'error' | 'success' | 'warning'): void
  }
}

interface Window {
  Telegram?: {
    WebApp: TelegramWebApp
  }
}
