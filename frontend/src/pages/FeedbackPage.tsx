import styles from './FeedbackPage.module.css'

export function FeedbackPage() {
  const handleOpen = () => {
    window.open('https://t.me/ilyadadonov', '_blank')
  }

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.icon}>💬</div>
        <h2 className={styles.title}>Напишите создателю</h2>
        <p className={styles.desc}>Есть вопросы, предложения или хотите оставить отзыв? Напишите нам напрямую в Telegram.</p>
        <button className={styles.btn} onClick={handleOpen}>
          Открыть чат
        </button>
      </div>
    </div>
  )
}
