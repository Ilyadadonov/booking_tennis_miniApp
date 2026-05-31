import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { DateSelector } from '../components/DateSelector'
import { SlotGrid } from '../components/SlotGrid'
import { BookingConfirmSheet } from '../components/BookingConfirmSheet'
import { getSlots } from '../api/bookings'
import type { Slot } from '../types'
import styles from './SchedulePage.module.css'
export function SchedulePage() {
  const today = new Date().toISOString().split('T')[0]
  const [selectedDate, setSelectedDate] = useState(today)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const { data, isLoading, isError } = useQuery({ queryKey: ['slots', selectedDate], queryFn: () => getSlots(selectedDate) })
  return (
    <div className={styles.page}>
      <DateSelector selectedDate={selectedDate} onSelect={setSelectedDate} />
      {isLoading && <div className={styles.status}>Загружаем расписание...</div>}
      {isError && <div className={styles.statusError}>Не удалось загрузить расписание</div>}
      {data && <SlotGrid courts={data.courts} onSlotTap={setSelectedSlot} />}
      <BookingConfirmSheet slot={selectedSlot} onClose={() => setSelectedSlot(null)} />
    </div>
  )
}
