export interface Court {
  id: number
  name: string
  description: string
}

export interface Slot {
  id: number
  court_id: number
  date: string
  time_start: string
  time_end: string
  status: 'free' | 'occupied'
}

export interface Booking {
  id: number
  slot_id: number
  user_tg_id: number
  user_name: string
  created_at: string
}

export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
}
