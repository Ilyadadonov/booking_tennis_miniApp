import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Slot } from '../types'
import { createBooking, cancelBooking } from '../api/bookings'
import { useTelegram } from '../hooks/useTelegram'
import styles from './BookingConfirmSheet.module.css'

interface BookingConfirmSheetProps {
  slot: Slot | null
  onClose: () => void
}

export function BookingConfirmSheet({ slot, onClose }: BookingConfirmSheetProps) {
  const { user, hapticFeedback } = useTelegram()
  const queryClient = useQueryClient()

  const bookMutation = useMutation({
    mutationFn: () => createBooking(slot!.id),
    onSuccess: () => {
      hapticFeedback.notification('success')
      queryClient.invalidateQueries({ queryKey: ['slots'] })
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] })
      onClose()
    },
    onError: () => {
      hapticFeedback.notification('error')
    },
  })

  const cancelMutation = useMutation({
    mutationFn: () => cancelBooking(slot!.booking_id!),
    onSuccess: () => {
      hapticFeedback.notification('success')
      queryClient.invalidateQueries({ queryKey: ['slots'] })
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] })
      onClose()
    },
    onError: () => {
      hapticFeedback.notification('error')
    },
  })

  if (!slot) return null

  const isMine = slot.status === 'mine' || slot.booking_id !== undefined
  const isLoading = bookMutation.isPending || cancelMutation.isPending
  const timeRange = `${slot.time_start.slice(0, 5)}–${slot.time_end.slice(0, 5)}`
  const dateFormatted = new Date(slot.date).toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.handle} />
        <h3 className={styles.title}>{slot.court_name}</h3>
        <div className={styles.details}>
          <div className={styles.detail}>
            <span className={styles.detailIcon}>📅</span>
            <span>{dateFormatted}</span>
          </div>
          <div className={styles.detail}>
            <span className={styles.detailIcon}>⏰</span>
            <span>{timeRange}</span>
          </div>
          {user && (
            <div className={styles.detail}>
              <span className={styles.detailIcon}>👤</span>
              <span>{user.first_name} {user.last_name ?? ''}</span>
            </div>
          )}
        </div>

        {bookMutation.isError && (
          <p className={styles.error}>
            {(bookMutation.error as Error)?.message ?? 'Ошибка при бронировании'}
          </p>
        )}
        {cancelMutation.isError && (
          <p className={styles.error}>
            {(cancelMutation.error as Error)?.message ?? 'Ошибка при отмене'}
          </p>
        )}

        <div className={styles.actions}>
          {isMine ? (
            <button
              className={`${styles.btn} ${styles.btnDanger}`}
              onClick={() => cancelMutation.mutate()}
              disabled={isLoading}
            >
              {cancelMutation.isPending ? 'Отменяем...' : 'Отменить бронь'}
            </button>
          ) : (
            <button
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={() => bookMutation.mutate()}
              disabled={isLoading}
            >
              {bookMutation.isPending ? 'Бронируем...' : 'Забронировать'}
            </button>
          )}
          <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={onClose} disabled={isLoading}>
            Закрыть
          </button>
        </div>
      </div>
    </div>
  )
}
