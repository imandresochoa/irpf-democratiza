import { Navigate, Route, Routes } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { AppShell } from './components/AppShell'
import { QuickGrossProvider } from './context/QuickGrossContext'
import { LandingPage } from './pages/LandingPage'
import { LegalPage } from './pages/LegalPage'
import { MetodologiaCalculosPage } from './pages/MetodologiaCalculosPage'

export default function App() {
  return (
    <QuickGrossProvider>
      <AppShell>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/calculos" element={<MetodologiaCalculosPage />} />
          <Route path="/legal" element={<LegalPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
      <Analytics />
    </QuickGrossProvider>
  )
}
