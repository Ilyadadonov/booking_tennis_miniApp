import styles from './DateSelector.module.css'

interface DateSelectorProps {
  selectedDate: string
  onSelect: (date: string) => void
}

function getDates() {
  const today = new Date()
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    return {
      iso: d.toISOString().split('T')[0],
      day: d.getDate().toString(),
      weekday: d.toLocaleDateString('ru-RU', { weekday: 'short' }),
      isToday: i === 0,
    }
  })
}

export function DateSelector({ selectedDate, onSelect }: DateSelectorProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.scroll}>
        {getDates().map((d) => (
          <button key={d.iso} className={`${styles.item} ${d.iso === selectedDate ? styles.selected : ''}`} onClick={() => onSelect(d.iso)}>
            <span className={styles.weekday}>{d.isToday ? 'Сег' : d.weekday}</span>
            <span className={styles.day}>{d.day}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
