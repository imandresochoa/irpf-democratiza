import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { AppShell } from './components/AppShell'
import { QuickGrossProvider } from './context/QuickGrossContext'
import { LandingPage } from './pages/LandingPage'
import { LegalPage } from './pages/LegalPage'
import { MetodologiaCalculosPage } from './pages/MetodologiaCalculosPage'

function ScrollToTopOnRouteChange() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])
  return null
}

export default function App() {
  return (
    <QuickGrossProvider>
      <ScrollToTopOnRouteChange />
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
