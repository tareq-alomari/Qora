import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../common/stores/authStore'

export default function ClientLayout() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-emerald-600">
            🎯 قرعة
          </Link>

          <nav className="flex items-center gap-6">
            <Link to="/" className="text-gray-600 hover:text-emerald-600">
              الرئيسية
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/my-account" className="text-gray-600 hover:text-emerald-600">
                  حسابي
                </Link>
                <button
                  onClick={logout}
                  className="text-red-500 hover:text-red-700"
                >
                  تسجيل خروج
                </button>
                <span className="text-sm text-gray-500">{user?.full_name}</span>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-emerald-600">
                  دخول
                </Link>
                <Link
                  to="/register"
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
                >
                  ابدأ التسجيل
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© 2026 قرعة - جميع الحقوق محفوظة</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link to="/" className="hover:text-emerald-600">الشروط والأحكام</Link>
            <Link to="/" className="hover:text-emerald-600">سياسة الخصوصية</Link>
            <Link to="/dashboard" className="hover:text-emerald-600">دخول الموظفين</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
