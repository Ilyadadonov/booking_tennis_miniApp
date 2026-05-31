import type { Slot, Court } from '../types'
import styles from './SlotGrid.module.css'
interface CourtSlots { court: Court; slots: Slot[] }
interface SlotGridProps { courts: CourtSlots[]; onSlotTap: (slot: Slot) => void; currentUserId?: number }
export function SlotGrid({ courts, onSlotTap }: SlotGridProps) {
  if (courts.length === 0) return <div className={styles.empty}>Нет доступных слотов на этот день</div>
  return (
    <div className={styles.wrapper}>
      {courts.map(({ court, slots }) => (
        <div key={court.id} className={styles.court}>
          <div className={styles.courtHeader}><span className={styles.courtName}>{court.name}</span><span className={styles.courtDesc}>{court.description}</span></div>
          <div className={styles.slots}>
            {slots.map((slot) => {
              const isMine = slot.status === 'mine'
              const cls = isMine ? styles.mine : slot.status === 'occupied' ? styles.occupied : styles.free
              return (
                <button key={slot.id} className={`${styles.slot} ${cls}`} onClick={() => (slot.status === 'free' || isMine) ? onSlotTap(slot) : undefined} disabled={slot.status === 'occupied' && !isMine}>
                  <span className={styles.time}>{slot.time_start.slice(0, 5)}</span>
                  <span className={styles.badge}>{isMine ? 'Я' : slot.status === 'occupied' ? '✕' : ''}</span>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
