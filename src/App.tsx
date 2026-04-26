import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { QuickGrossProvider } from './context/QuickGrossContext'
import { LandingPage } from './pages/LandingPage'

export default function App() {
  return (
    <QuickGrossProvider>
      <AppShell>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </QuickGrossProvider>
  )
}
