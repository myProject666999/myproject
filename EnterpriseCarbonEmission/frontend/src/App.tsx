import { Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import Dashboard from '@/pages/Dashboard'
import EmissionDataPage from '@/pages/EmissionDataPage'
import EmissionFactorPage from '@/pages/EmissionFactorPage'
import CalculationPage from '@/pages/CalculationPage'
import ReductionTargetPage from '@/pages/ReductionTargetPage'
import EsgIndicatorPage from '@/pages/EsgIndicatorPage'
import ReportPage from '@/pages/ReportPage'
import OrganizationPage from '@/pages/OrganizationPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/emission-data" element={<EmissionDataPage />} />
        <Route path="/emission-factor" element={<EmissionFactorPage />} />
        <Route path="/calculation" element={<CalculationPage />} />
        <Route path="/reduction-target" element={<ReductionTargetPage />} />
        <Route path="/esg-indicator" element={<EsgIndicatorPage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/organization" element={<OrganizationPage />} />
      </Route>
    </Routes>
  )
}
