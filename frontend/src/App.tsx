import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { SchedulePage } from './pages/SchedulePage'
import { MyBookingsPage } from './pages/MyBookingsPage'
import { FeedbackPage } from './pages/FeedbackPage'
import { BottomNav } from './components/BottomNav'
import { useTelegram } from './hooks/useTelegram'
import styles from './App.module.css'

export default function App() {
  useTelegram()
  return (
    <BrowserRouter>
      <div className={styles.app}>
        <main className={styles.main}>
          <Routes>
            <Route path="/" element={<SchedulePage />} />
            <Route path="/my-bookings" element={<MyBookingsPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </BrowserRouter>
  )
}
