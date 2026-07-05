import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import AppShell from './components/AppShell'
import RequireRole from './components/RequireRole'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import EmployeesPage from './pages/EmployeesPage'
import AssetsPage from './pages/AssetsPage'
import AssetDetailPage from './pages/AssetDetailPage'
import MyAssetsPage from './pages/MyAssetsPage'
import MaintenancePage from './pages/MaintenancePage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AppShell />}>
            <Route
              path="/"
              element={
                <RequireRole roles={['admin', 'hr']}>
                  <DashboardPage />
                </RequireRole>
              }
            />
            <Route
              path="/employees"
              element={
                <RequireRole roles={['admin', 'hr']}>
                  <EmployeesPage />
                </RequireRole>
              }
            />
            <Route
              path="/assets"
              element={
                <RequireRole roles={['admin', 'hr', 'staff']}>
                  <AssetsPage />
                </RequireRole>
              }
            />
            <Route
              path="/assets/:id"
              element={
                <RequireRole roles={['admin', 'hr', 'staff']}>
                  <AssetDetailPage />
                </RequireRole>
              }
            />
            <Route
              path="/my-assets"
              element={
                <RequireRole roles={['staff']}>
                  <MyAssetsPage />
                </RequireRole>
              }
            />
            <Route
              path="/maintenance"
              element={
                <RequireRole roles={['admin']}>
                  <MaintenancePage />
                </RequireRole>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
