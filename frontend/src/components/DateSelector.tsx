import styles from './DateSelector.module.css'

interface DateSelectorProps {
  selectedDate: string
  onSelect: (date: string) => void
}

function getDates(): Array<{ iso: string; day: string; weekday: string; isToday: boolean }> {
  const dates = []
  const today = new Date()
  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const iso = d.toISOString().split('T')[0]
    dates.push({
      iso,
      day: d.getDate().toString(),
      weekday: d.toLocaleDateString('ru-RU', { weekday: 'short' }),
      isToday: i === 0,
    })
  }
  return dates
}

export function DateSelector({ selectedDate, onSelect }: DateSelectorProps) {
  const dates = getDates()

  return (
    <div className={styles.wrapper}>
      <div className={styles.scroll}>
        {dates.map((d) => (
          <button
            key={d.iso}
            className={`${styles.item} ${d.iso === selectedDate ? styles.selected : ''}`}
            onClick={() => onSelect(d.iso)}
          >
            <span className={styles.weekday}>{d.isToday ? 'Сег' : d.weekday}</span>
            <span className={styles.day}>{d.day}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
