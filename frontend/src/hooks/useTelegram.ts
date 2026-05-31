import { useEffect } from 'react'
import type { User } from '../types'

interface TelegramHook {
  user: User | null
  initData: string
  colorScheme: 'light' | 'dark'
  themeParams: Record<string, string>
  isReady: boolean
  hapticFeedback: {
    impact: (style: 'light' | 'medium' | 'heavy') => void
    notification: (type: 'error' | 'success' | 'warning') => void
  }
  close: () => void
  expand: () => void
}

export function useTelegram(): TelegramHook {
  const tg = window.Telegram?.WebApp

  useEffect(() => {
    if (tg) {
      tg.ready()
      tg.expand()
    }
  }, [tg])

  const rawUser = tg?.initDataUnsafe?.user

  const user: User | null = rawUser
    ? {
        id: rawUser.id,
        first_name: rawUser.first_name,
        last_name: rawUser.last_name,
        username: rawUser.username,
        language_code: rawUser.language_code,
        is_premium: rawUser.is_premium,
      }
    : null

  return {
    user,
    initData: tg?.initData ?? '',
    colorScheme: (tg?.colorScheme as 'light' | 'dark') ?? 'light',
    themeParams: (tg?.themeParams as Record<string, string>) ?? {},
    isReady: !!tg,
    hapticFeedback: {
      impact: (style) => tg?.HapticFeedback?.impactOccurred(style),
      notification: (type) => tg?.HapticFeedback?.notificationOccurred(type),
    },
    close: () => tg?.close(),
    expand: () => tg?.expand(),
  }
}
