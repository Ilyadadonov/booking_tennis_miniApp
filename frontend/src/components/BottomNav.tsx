import { NavLink } from 'react-router-dom'
import styles from './BottomNav.module.css'

export function BottomNav() {
  return (
    <nav className={styles.nav}>
      <NavLink to="/" end className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ''}`}>
        <span className={styles.icon}>📅</span>
        <span className={styles.label}>Расписание</span>
      </NavLink>
      <NavLink to="/my-bookings" className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ''}`}>
        <span className={styles.icon}>🎾</span>
        <span className={styles.label}>Мои брони</span>
      </NavLink>
      <NavLink to="/feedback" className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ''}`}>
        <span className={styles.icon}>💬</span>
        <span className={styles.label}>Написать</span>
      </NavLink>
    </nav>
  )
}
