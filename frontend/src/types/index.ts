export interface Court {
  id: number
  name: string
  description: string
  maps_url?: string
}

export interface Slot {
  id: number
  court_id: number
  court_name: string
  date: string
  time_start: string
  time_end: string
  status: 'free' | 'occupied' | 'mine'
  booking_id?: number
  maps_url?: string
}

export interface Booking {
  id: number
  slot_id: number
  user_tg_id: number
  user_name: string
  created_at: string
  slot: {
    id: number
    date: string
    time_start: string
    time_end: string
    court: Court
  }
}

export interface User {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  is_premium?: boolean
}

export interface SlotsResponse {
  date: string
  courts: Array<{
    court: Court
    slots: Slot[]
  }>
}
