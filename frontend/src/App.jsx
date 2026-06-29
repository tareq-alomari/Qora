import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './common/stores/authStore'

// Client Pages
import HomePage from './client/pages/home/HomePage'
import LoginPage from './client/pages/auth/LoginPage'
import RegisterPage from './client/pages/auth/RegisterPage'
import LotteryWizard from './client/pages/lottery/LotteryWizard'
import ClientDashboard from './client/pages/dashboard/ClientDashboard'
import CheckResult from './client/pages/check-result/CheckResult'

// Client Layout
import ClientLayout from './client/layouts/ClientLayout'

// Dashboard Pages
import DashboardHome from './dashboard/pages/home/DashboardHome'
import OrdersList from './dashboard/pages/orders/OrdersList'
import OrderReview from './dashboard/pages/orders/OrderReview'
import PaymentsList from './dashboard/pages/payments/PaymentsList'
import PaymentVerify from './dashboard/pages/payments/PaymentVerify'
import SubmitList from './dashboard/pages/submit/SubmitList'
import SubmitConfirmation from './dashboard/pages/submit/SubmitConfirmation'
import CheckResultsList from './dashboard/pages/check-results/CheckResultsList'

// Admin Pages
import UsersManagement from './dashboard/pages/users/UsersManagement'
import ReportsPage from './dashboard/pages/reports/ReportsPage'
import AuditLogPage from './dashboard/pages/audit-log/AuditLogPage'
import SettingsPage from './dashboard/pages/settings/SettingsPage'

// Dashboard Layout
import DashboardLayout from './dashboard/layouts/DashboardLayout'

// Protected Route Wrapper
const ProtectedRoute = ({ role, children }) => {
  const { user, isAuthenticated } = useAuthStore()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (role && !role.includes(user?.role)) return <Navigate to="/" replace />

  return children
}

export default function App() {
  return (
    <Routes>
      {/* ============================================= */}
      {/* 🌐 الموقع الرئيسي - Client-facing Site        */}
      {/* ============================================= */}
      <Route element={<ClientLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Client-only routes */}
        <Route element={<ProtectedRoute role={['client']} />}>
          <Route path="/lottery/*" element={<LotteryWizard />} />
          <Route path="/my-account" element={<ClientDashboard />} />
          <Route path="/check-result" element={<CheckResult />} />
        </Route>
      </Route>

      {/* ============================================= */}
      {/* 📊 لوحة التحكم - Employee & Admin Dashboard    */}
      {/* ============================================= */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute role={['employee', 'admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />

        {/* Employee routes */}
        <Route path="orders" element={<OrdersList />} />
        <Route path="orders/:id" element={<OrderReview />} />
        <Route path="payments" element={<PaymentsList />} />
        <Route path="payments/:id" element={<PaymentVerify />} />
        <Route path="submit" element={<SubmitList />} />
        <Route path="submit/:id" element={<SubmitConfirmation />} />
        <Route path="check-results" element={<CheckResultsList />} />

        {/* Admin-only routes */}
        <Route element={<ProtectedRoute role={['admin']} />}>
          <Route path="admin/users" element={<UsersManagement />} />
          <Route path="admin/reports" element={<ReportsPage />} />
          <Route path="admin/audit-log" element={<AuditLogPage />} />
          <Route path="admin/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
