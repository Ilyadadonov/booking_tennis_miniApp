import { apiClient } from './client'
import type { Booking, SlotsResponse } from '../types'
export async function getSlots(date: string): Promise<SlotsResponse> { const { data } = await apiClient.get<SlotsResponse>('/slots', { params: { date } }); return data }
export async function createBooking(slotId: number): Promise<Booking> { const { data } = await apiClient.post<Booking>('/bookings', { slot_id: slotId }); return data }
export async function cancelBooking(bookingId: number): Promise<void> { await apiClient.delete(`/bookings/${bookingId}`) }
export async function getMyBookings(): Promise<Booking[]> { const { data } = await apiClient.get<Booking[]>('/bookings/my'); return data }
