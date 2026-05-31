import type { SlotsResponse, Booking } from '../types'

const BASE_URL = import.meta.env.VITE_API_URL ?? ''

function getInitData(): string {
  return window.Telegram?.WebApp?.initData ?? ''
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Telegram-Init-Data': getInitData(),
      ...options?.headers,
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { detail?: string }).detail ?? `HTTP ${res.status}`)
  }

  return res.json() as Promise<T>
}

export function fetchSlots(date: string): Promise<SlotsResponse> {
  return request<SlotsResponse>(`/api/slots?date=${date}`)
}

export function fetchMyBookings(): Promise<Booking[]> {
  return request<Booking[]>('/api/bookings/my')
}

export function createBooking(slotId: number): Promise<Booking> {
  return request<Booking>('/api/bookings', {
    method: 'POST',
    body: JSON.stringify({ slot_id: slotId }),
  })
}

export function cancelBooking(bookingId: number): Promise<void> {
  return request<void>(`/api/bookings/${bookingId}`, { method: 'DELETE' })
}
