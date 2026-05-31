import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { DateSelector } from '../components/DateSelector'
import { SlotGrid } from '../components/SlotGrid'
import { BookingConfirmSheet } from '../components/BookingConfirmSheet'
import { fetchSlots } from '../api/bookings'
import { useTelegram } from '../hooks/useTelegram'
import type { Slot } from '../types'
import styles from './SchedulePage.module.css'

function todayIso(): string {
  return new Date().toISOString().split('T')[0]
}

export function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState(todayIso)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const { user } = useTelegram()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['slots', selectedDate],
    queryFn: () => fetchSlots(selectedDate),
  })

  const courts = (data?.courts ?? []).map(({ court, slots }) => ({
    court,
    slots: slots.map((s) => ({
      ...s,
      status:
        s.status === 'occupied' && s.booking_id !== undefined && user
          ? ('mine' as const)
          : s.status,
    })),
  }))

  return (
    <div className={styles.page}>
      <DateSelector selectedDate={selectedDate} onSelect={setSelectedDate} />

      {isLoading && <p className={styles.message}>Загрузка...</p>}
      {isError && <p className={styles.message}>Не удалось загрузить расписание</p>}
      {!isLoading && !isError && (
        <SlotGrid courts={courts} onSlotTap={setSelectedSlot} />
      )}

      <BookingConfirmSheet slot={selectedSlot} onClose={() => setSelectedSlot(null)} />
    </div>
  )
}
