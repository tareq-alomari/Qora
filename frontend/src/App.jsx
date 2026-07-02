import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from './common/stores/authStore'

// Client Pages
import HomePage from './client/pages/home/HomePage'
import AuthPage from './client/pages/auth/AuthPage'
import ForgotPassword from './client/pages/forgot-password/ForgotPassword'
import ResetPassword from './client/pages/reset-password/ResetPassword'
import VerifyEmail from './client/pages/verify-email/VerifyEmail'
import LotteryWizard from './client/pages/lottery/LotteryWizard'
import ClientDashboard from './client/pages/dashboard/ClientDashboard'
import CheckResult from './client/pages/check-result/CheckResult'
import HelpPage from './client/pages/help/HelpPage'
import PhotoRequirements from './client/pages/photo-requirements/PhotoRequirements'
import OrderStatusPage from './client/pages/orders/OrderStatusPage'
import AboutPage from './client/pages/about/AboutPage'
import PricingPage from './client/pages/pricing/PricingPage'
import ContactPage from './client/pages/contact/ContactPage'
import TermsPage from './client/pages/terms/TermsPage'
import PrivacyPage from './client/pages/privacy/PrivacyPage'
import NotFound from './client/pages/not-found/NotFound'
import NotificationsPage from './client/pages/notifications/NotificationsPage'
import ClientSettings from './client/pages/settings/ClientSettings'
import OrderResult from './client/pages/result/OrderResult'

// Client Layout
import ClientLayout from './client/layouts/ClientLayout'

// Dashboard Pages
import DashboardLogin from './dashboard/pages/DashboardLogin'
import DashboardHome from './dashboard/pages/home/DashboardHome'
import OrdersList from './dashboard/pages/orders/OrdersList'
import OrderReview from './dashboard/pages/orders/OrderReview'
import PaymentsList from './dashboard/pages/payments/PaymentsList'
import PaymentVerify from './dashboard/pages/payments/PaymentVerify'
import SubmitList from './dashboard/pages/submit/SubmitList'
import SubmitConfirmation from './dashboard/pages/submit/SubmitConfirmation'
import CheckResultsList from './dashboard/pages/check-results/CheckResultsList'
import ProfilePage from './dashboard/pages/profile/ProfilePage'
import FraudFlags from './dashboard/pages/fraud/FraudFlags'
import QueueStatus from './dashboard/pages/queue/QueueStatus'
import EmployeePerformance from './dashboard/pages/employees/EmployeePerformance'
import AdminPayments from './dashboard/pages/admin-payments/AdminPayments'
import AdminOrderReview from './dashboard/pages/admin-order-review/AdminOrderReview'
import EmployeesList from './dashboard/pages/employees-list/EmployeesList'
import BackupsPage from './dashboard/pages/backups/BackupsPage'
import ServerLogs from './dashboard/pages/logs/ServerLogs'

// Admin Pages
import AdminOrdersList from './dashboard/pages/admin-orders/AdminOrdersList'
import UsersManagement from './dashboard/pages/users/UsersManagement'
import ReportsPage from './dashboard/pages/reports/ReportsPage'
import AuditLogPage from './dashboard/pages/audit-log/AuditLogPage'
import SettingsPage from './dashboard/pages/settings/SettingsPage'
import BulkNotificationsPage from './dashboard/pages/notifications/BulkNotificationsPage'

// Dashboard Layout
import DashboardLayout from './dashboard/layouts/DashboardLayout'

// Protected Route Wrapper
const ProtectedRoute = ({ role, children }) => {
  const { user, isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    const loginPath = role?.some(r => ['employee', 'admin'].includes(r))
      ? '/dashboard/login'
      : '/login'
    return <Navigate to={loginPath} replace />
  }
  if (role && !role.includes(user?.role)) return <Navigate to="/" replace />

  return children || <Outlet />
}

export default function App() {
  return (
    <Routes>
      {/* ============================================= */}
      {/* 🌐 الموقع الرئيسي - Client-facing Site        */}
      {/* ============================================= */}
      <Route element={<ClientLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/photo-requirements" element={<PhotoRequirements />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/check-result" element={<CheckResult />} />
        <Route path="/check-result/:confirmation" element={<CheckResult />} />

        {/* Client-only routes */}
        <Route element={<ProtectedRoute role={['client']} />}>
          <Route path="/lottery/*" element={<LotteryWizard />} />
          <Route path="/my-account" element={<ClientDashboard />} />
          <Route path="/my-account/notifications" element={<NotificationsPage />} />
          <Route path="/my-account/settings" element={<ClientSettings />} />
          <Route path="/orders/:id" element={<OrderStatusPage />} />
          <Route path="/orders/:id/result" element={<OrderResult />} />
        </Route>
      </Route>

      {/* ============================================= */}
      {/* 📊 لوحة التحكم - Employee & Admin Dashboard    */}
      {/* ============================================= */}

      {/* Dashboard login (public, no auth needed) */}
      <Route path="/dashboard/login" element={<DashboardLogin />} />

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
        <Route path="profile" element={<ProfilePage />} />

        {/* Admin-only routes */}
        <Route element={<ProtectedRoute role={['admin']} />}>
          <Route path="admin/orders" element={<AdminOrdersList />} />
          <Route path="admin/users" element={<UsersManagement />} />
          <Route path="admin/users/:id" element={<EmployeePerformance />} />
          <Route path="admin/reports" element={<ReportsPage />} />
          <Route path="admin/audit-log" element={<AuditLogPage />} />
          <Route path="admin/settings" element={<SettingsPage />} />
          <Route path="admin/notifications" element={<BulkNotificationsPage />} />
          <Route path="admin/payments" element={<AdminPayments />} />
          <Route path="admin/orders/:id" element={<AdminOrderReview />} />
          <Route path="admin/employees" element={<EmployeesList />} />
          <Route path="admin/backups" element={<BackupsPage />} />
          <Route path="admin/logs" element={<ServerLogs />} />
          <Route path="admin/fraud" element={<FraudFlags />} />
          <Route path="admin/queue" element={<QueueStatus />} />
        </Route>
      </Route>

      {/* Fallback - 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
