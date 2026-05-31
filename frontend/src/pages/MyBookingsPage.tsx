import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getMyBookings, cancelBooking } from '../api/bookings'
import { useTelegram } from '../hooks/useTelegram'
import styles from './MyBookingsPage.module.css'

export function MyBookingsPage() {
  const { hapticFeedback } = useTelegram()
  const queryClient = useQueryClient()

  const { data: bookings, isLoading, isError } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: getMyBookings,
  })

  const cancelMutation = useMutation({
    mutationFn: cancelBooking,
    onSuccess: () => {
      hapticFeedback.notification('success')
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] })
      queryClient.invalidateQueries({ queryKey: ['slots'] })
    },
    onError: () => { hapticFeedback.notification('error') },
  })

  if (isLoading) return <div className={styles.status}>Загружаем брони...</div>
  if (isError) return <div className={styles.statusError}>Не удалось загрузить бронирования</div>
  if (!bookings || bookings.length === 0) return (
    <div className={styles.empty}>
      <div className={styles.emptyIcon}>🎾</div>
      <p>У вас нет активных бронирований</p>
      <p className={styles.emptyHint}>Перейдите в расписание, чтобы забронировать корт</p>
    </div>
  )

  return (
    <div className={styles.page}>
      <h2 className={styles.heading}>Мои бронирования</h2>
      <div className={styles.list}>
        {bookings.map((booking) => {
          const slot = booking.slot
          const dateFormatted = new Date(slot.date).toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' })
          const timeRange = `${slot.time_start.slice(0,5)}-${slot.time_end.slice(0,5)}`
          return (
            <div key={booking.id} className={styles.card}>
              <div className={styles.cardInfo}>
                <span className={styles.courtName}>{slot.court.name}</span>
                <span className={styles.datetime}>{dateFormatted}, {timeRange}</span>
              </div>
              <button
                className={styles.cancelBtn}
                onClick={() => cancelMutation.mutate(booking.id)}
                disabled={cancelMutation.isPending}
              >
                Отменить
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
