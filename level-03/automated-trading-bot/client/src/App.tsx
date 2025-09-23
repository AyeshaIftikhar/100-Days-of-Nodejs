import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { useQuery } from '@tanstack/react-query'
import { authAPI } from '@/services/api'

// Layouts
import DashboardLayout from '@/layouts/dashboard-layout'

// Pages
import LoginPage from '@/pages/login'
import RegisterPage from '@/pages/register'
import DashboardPage from '@/pages/dashboard'
import StrategyListPage from '@/pages/strategies/list'
import StrategyCreatePage from '@/pages/strategies/create'
import StrategyDetailPage from '@/pages/strategies/detail'
import BacktestPage from '@/pages/backtest'
import TradesPage from '@/pages/trades'
import SettingsPage from '@/pages/settings'
import NotFoundPage from '@/pages/not-found'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    !!localStorage.getItem('token')
  )

  // Get current user data
  const { data: userData, isLoading, isError } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authAPI.getCurrentUser(),
    enabled: isAuthenticated,
    retry: false,
  })

  useEffect(() => {
    // If token exists but is invalid, logout user
    if (isError && isAuthenticated) {
      setIsAuthenticated(false)
      localStorage.removeItem('token')
    }
  }, [isError, isAuthenticated])

  // Auth guard component
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (isLoading) {
      return <div>Loading...</div> 
    }
    
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />
    }
    
    return children
  }

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
              <Navigate to="/dashboard" replace /> : 
              <LoginPage setIsAuthenticated={setIsAuthenticated} />
          } 
        />
        <Route 
          path="/register" 
          element={
            isAuthenticated ? 
              <Navigate to="/dashboard" replace /> : 
              <RegisterPage setIsAuthenticated={setIsAuthenticated} />
          } 
        />
        
        {/* Protected routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <DashboardLayout user={userData?.data} />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="strategies">
            <Route index element={<StrategyListPage />} />
            <Route path="create" element={<StrategyCreatePage />} />
            <Route path=":id" element={<StrategyDetailPage />} />
          </Route>
          <Route path="backtest" element={<BacktestPage />} />
          <Route path="trades" element={<TradesPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        
        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      
      {/* Toast notifications */}
      <Toaster position="top-right" />
    </>
  )
}

export default App
