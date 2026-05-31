import { useEffect } from 'react'
import type { User } from '../types'
export function useTelegram() {
  const tg = window.Telegram?.WebApp
  useEffect(() => { if (tg) { tg.ready(); tg.expand() } }, [tg])
  const rawUser = tg?.initDataUnsafe?.user
  const user: User | null = rawUser ? { id: rawUser.id, first_name: rawUser.first_name, last_name: rawUser.last_name, username: rawUser.username, language_code: rawUser.language_code, is_premium: rawUser.is_premium } : null
  return {
    user, initData: tg?.initData ?? '', colorScheme: (tg?.colorScheme as 'light'|'dark') ?? 'light', themeParams: (tg?.themeParams as Record<string,string>) ?? {}, isReady: !!tg,
    hapticFeedback: { impact: (s: 'light'|'medium'|'heavy') => tg?.HapticFeedback?.impactOccurred(s), notification: (t: 'error'|'success'|'warning') => tg?.HapticFeedback?.notificationOccurred(t) },
    close: () => tg?.close(), expand: () => tg?.expand(),
  }
}
