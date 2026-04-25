import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { LandingPage } from './pages/LandingPage'
import { ManualPage } from './pages/ManualPage'
import { CalculatorPage } from './pages/CalculatorPage'
import { ComparePage } from './pages/ComparePage'
import { NormativaPage } from './pages/NormativaPage'

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/manual" element={<ManualPage />} />
        <Route path="/manual/:section" element={<ManualPage />} />
        <Route path="/calcular" element={<CalculatorPage />} />
        <Route path="/comparar" element={<ComparePage />} />
        <Route path="/normativa" element={<NormativaPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}
