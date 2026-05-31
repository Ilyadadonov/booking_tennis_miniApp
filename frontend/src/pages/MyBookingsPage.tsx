import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BookingConfirmSheet } from '../components/BookingConfirmSheet'
import { fetchMyBookings } from '../api/bookings'
import type { Slot } from '../types'
import styles from './MyBookingsPage.module.css'

export function MyBookingsPage() {
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)

  const { data: bookings = [], isLoading, isError } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: fetchMyBookings,
  })

  if (isLoading) return <p className={styles.message}>Загрузка...</p>
  if (isError) return <p className={styles.message}>Не удалось загрузить брони</p>

  if (bookings.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>🎾</span>
        <p>У вас пока нет броней</p>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <ul className={styles.list}>
        {bookings.map((b) => {
          const slot = b.slot
          const timeRange = `${slot.time_start.slice(0, 5)}–${slot.time_end.slice(0, 5)}`
          const dateFormatted = new Date(slot.date).toLocaleDateString('ru-RU', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })

          const slotForSheet: Slot = {
            id: slot.id,
            court_id: slot.court.id,
            court_name: slot.court.name,
            date: slot.date,
            time_start: slot.time_start,
            time_end: slot.time_end,
            status: 'mine',
            booking_id: b.id,
          }

          return (
            <li key={b.id} className={styles.card} onClick={() => setSelectedSlot(slotForSheet)}>
              <div className={styles.cardHeader}>
                <span className={styles.courtName}>{slot.court.name}</span>
                <span className={styles.time}>{timeRange}</span>
              </div>
              <div className={styles.date}>{dateFormatted}</div>
            </li>
          )
        })}
      </ul>

      <BookingConfirmSheet slot={selectedSlot} onClose={() => setSelectedSlot(null)} />
    </div>
  )
}
