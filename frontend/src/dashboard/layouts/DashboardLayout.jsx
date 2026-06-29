import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../common/stores/authStore'

const employeeLinks = [
  { to: '/dashboard', label: 'الرئيسية', icon: '📊', end: true },
  { to: '/dashboard/orders', label: 'الطلبات', icon: '📋' },
  { to: '/dashboard/payments', label: 'الدفعات', icon: '💳' },
  { to: '/dashboard/submit', label: 'إدخال التأكيد', icon: '🌐' },
  { to: '/dashboard/check-results', label: 'فحص النتائج', icon: '🔍' },
]

const adminLinks = [
  { to: '/dashboard/admin/users', label: 'المستخدمين', icon: '👥' },
  { to: '/dashboard/admin/reports', label: 'التقارير', icon: '📈' },
  { to: '/dashboard/admin/audit-log', label: 'سجل التدقيق', icon: '📝' },
  { to: '/dashboard/admin/settings', label: 'الإعدادات', icon: '⚙️' },
]

export default function DashboardLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'admin'

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen flex bg-gray-100" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg border-l flex flex-col">
        <div className="p-4 border-b">
          <NavLink to="/dashboard" className="text-xl font-bold text-emerald-600">
            📊 قرعة
          </NavLink>
          <p className="text-sm text-gray-500 mt-1">{user?.full_name}</p>
          <span className="inline-block text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full mt-1">
            {user?.role === 'admin' ? 'مدير' : 'موظف'}
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <p className="text-xs text-gray-400 uppercase mb-2">الرئيسية</p>
          {employeeLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <span>{link.icon}</span>
              {link.label}
            </NavLink>
          ))}

          {isAdmin && (
            <>
              <p className="text-xs text-gray-400 uppercase mt-6 mb-2">إدارة</p>
              {adminLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 font-semibold'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`
                  }
                >
                  <span>{link.icon}</span>
                  {link.label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-500 hover:text-red-700 text-sm w-full"
          >
            🚪 تسجيل خروج
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
