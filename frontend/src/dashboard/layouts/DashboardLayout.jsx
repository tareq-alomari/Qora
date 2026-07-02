import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@common/stores/authStore'
import toast from 'react-hot-toast'

const navItems = [
  { section: 'الرئيسية', items: [
    { to: '/dashboard', label: 'الرئيسية', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', end: true },
    { to: '/dashboard/orders', label: 'الطلبات', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { to: '/dashboard/payments', label: 'المدفوعات', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
    { to: '/dashboard/submit', label: 'التقديم', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9' },
    { to: '/dashboard/check-results', label: 'فحص النتائج', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
    { to: '/dashboard/profile', label: 'الملف الشخصي', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  ]},
  { section: 'إدارة', adminOnly: true, items: [
    { to: '/dashboard/admin/orders', label: 'إشراف الطلبات', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { to: '/dashboard/admin/users', label: 'المستخدمين', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { to: '/dashboard/admin/reports', label: 'التقارير', icon: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z' },
    { to: '/dashboard/admin/audit-log', label: 'سجل التدقيق', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { to: '/dashboard/admin/notifications', label: 'الإشعارات', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
    { to: '/dashboard/admin/payments', label: 'المدفوعات', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
    { to: '/dashboard/admin/employees', label: 'الموظفون', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { to: '/dashboard/admin/backups', label: 'النسخ الاحتياطي', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
    { to: '/dashboard/admin/logs', label: 'سجلات السيرفر', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { to: '/dashboard/admin/fraud', label: 'الاحتيال', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z' },
    { to: '/dashboard/admin/queue', label: 'طابور التقديم', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { to: '/dashboard/admin/settings', label: 'الإعدادات', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ]},
]

export default function DashboardLayout() {
  const { user, logout, checkAuth } = useAuthStore()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isAdmin = user?.role === 'admin'

  useEffect(() => { checkAuth() }, [])

  const handleLogout = () => {
    logout()
    toast.success('تم تسجيل الخروج')
    navigate('/')
  }

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-primary-50 text-primary-600 shadow-sm border border-primary-100'
        : 'text-navy-500 hover:bg-navy-50 hover:text-navy-900 border border-transparent'
    }`

  return (
    <div className="min-h-screen flex bg-navy-50 font-sans" dir="rtl">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-navy-900/40 backdrop-blur-sm z-20 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Elegant Sidebar */}
      <aside className={`fixed lg:static inset-y-0 right-0 z-30 w-72 bg-white shadow-[10px_0_30px_-15px_rgba(0,0,0,0.1)] border-l border-navy-100 flex flex-col transform transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-6 border-b border-navy-100">
          <div className="flex items-center justify-between mb-4">
            <NavLink to="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-md shadow-primary-500/20">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-navy-900 tracking-tight">قرعة</span>
            </NavLink>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-navy-400 hover:text-navy-700 bg-navy-50 p-2 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="bg-navy-50 p-4 rounded-xl border border-navy-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-lg shadow-sm border border-primary-200">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="text-sm font-bold text-navy-900 truncate w-36">{user?.full_name}</p>
              <span className="inline-block text-xs font-semibold bg-white px-2 py-0.5 rounded-full mt-1 border border-navy-200 text-navy-500 shadow-sm">
                {isAdmin ? 'مدير النظام' : 'موظف'}
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto custom-scrollbar">
          {navItems.map((group) => {
            if (group.adminOnly && !isAdmin) return null
            return (
              <div key={group.section} className="space-y-2">
                <p className="text-xs font-bold text-navy-400 uppercase tracking-wider px-4 mb-3">
                  {group.section}
                </p>
                {group.items.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    className={linkClass}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
                    </svg>
                    {link.label}
                  </NavLink>
                ))}
              </div>
            )
          })}
        </nav>

        <div className="p-4 border-t border-navy-100 bg-navy-50/50">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white border border-error/20 text-error rounded-xl font-bold hover:bg-error/5 hover:border-error/30 transition-all duration-200 shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            تسجيل خروج
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-navy-100 px-4 lg:px-8 h-20 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-navy-500 hover:text-navy-900 hover:bg-navy-50 p-2.5 rounded-xl transition-colors border border-navy-100 bg-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="hidden lg:flex items-center text-sm font-medium text-navy-500">
            {/* Breadcrumbs could go here */}
            <span>لوحة تحكم الموظفين</span>
            <span className="mx-2">/</span>
            <span className="text-navy-900">نظرة عامة</span>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-navy-400 hover:text-navy-600 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full ring-2 ring-white"></span>
            </button>
          </div>
        </header>

        {/* Page Content Container */}
        <div className="flex-1 p-4 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
