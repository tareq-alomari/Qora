import { useState, useEffect } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@common/stores/authStore'
import api from '@common/services/api'

export default function ClientLayout() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isHome = location.pathname === '/'

  return (
    <div className="min-h-screen flex flex-col bg-navy-50 font-sans" dir="rtl">
      {/* Navbar */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || !isHome || menuOpen
            ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-navy-100'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-row-reverse items-center justify-between h-20" dir="ltr">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-md shadow-primary-500/30">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className={`text-2xl font-bold tracking-tight transition-colors duration-300 ${scrolled || !isHome || menuOpen ? 'text-navy-900' : 'text-white'}`}>
                قرعة
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8" dir="rtl">
              <Link 
                to="/" 
                className={`font-medium text-sm transition-colors duration-300 hover:text-primary-500 ${
                  isHome && !scrolled ? 'text-white/90' : 'text-navy-600'
                }`}
              >
                الرئيسية
              </Link>
              
              <Link 
                to="/pricing" 
                className={`font-medium text-sm transition-colors duration-300 hover:text-primary-500 ${
                  isHome && !scrolled ? 'text-white/90' : 'text-navy-600'
                }`}
              >
                الباقات
              </Link>
              
              <Link 
                to="/photo-requirements" 
                className={`font-medium text-sm transition-colors duration-300 hover:text-primary-500 ${
                  isHome && !scrolled ? 'text-white/90' : 'text-navy-600'
                }`}
              >
                شروط الصورة
              </Link>

              <Link 
                to="/about" 
                className={`font-medium text-sm transition-colors duration-300 hover:text-primary-500 ${
                  isHome && !scrolled ? 'text-white/90' : 'text-navy-600'
                }`}
              >
                عن المنصة
              </Link>

              <Link 
                to="/help" 
                className={`font-medium text-sm transition-colors duration-300 hover:text-primary-500 ${
                  isHome && !scrolled ? 'text-white/90' : 'text-navy-600'
                }`}
              >
                المساعدة
              </Link>

              <Link 
                to="/contact" 
                className={`font-medium text-sm transition-colors duration-300 hover:text-primary-500 ${
                  isHome && !scrolled ? 'text-white/90' : 'text-navy-600'
                }`}
              >
                تواصل معنا
              </Link>

              <Link 
                to="/terms" 
                className={`font-medium text-sm transition-colors duration-300 hover:text-primary-500 ${
                  isHome && !scrolled ? 'text-white/90' : 'text-navy-600'
                }`}
              >
                الشروط
              </Link>

              <Link 
                to="/privacy" 
                className={`font-medium text-sm transition-colors duration-300 hover:text-primary-500 ${
                  isHome && !scrolled ? 'text-white/90' : 'text-navy-600'
                }`}
              >
                الخصوصية
              </Link>

              {isAuthenticated ? (
                <>
                  <Link 
                    to="/my-account" 
                    className={`font-medium text-sm transition-colors duration-300 hover:text-primary-500 ${
                      isHome && !scrolled ? 'text-white/90' : 'text-navy-600'
                    }`}
                  >
                    طلباتي
                  </Link>
                  <Link 
                    to="/check-result" 
                    className={`font-medium text-sm transition-colors duration-300 hover:text-primary-500 ${
                      isHome && !scrolled ? 'text-white/90' : 'text-navy-600'
                    }`}
                  >
                    فحص النتيجة
                  </Link>
                  <div className="flex items-center gap-4 border-r border-navy-200/50 pr-4">
                    <Link
                      to="/my-account/notifications"
                      className={`relative transition-colors ${
                        isHome && !scrolled ? 'text-white/70 hover:text-white' : 'text-navy-400 hover:text-navy-700'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </Link>
                    <Link
                      to="/my-account/settings"
                      className={`transition-colors ${
                        isHome && !scrolled ? 'text-white/70 hover:text-white' : 'text-navy-400 hover:text-navy-700'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      </svg>
                    </Link>
                    <span className={`text-sm font-medium ${isHome && !scrolled ? 'text-white/70' : 'text-navy-500'}`}>
                      {user?.full_name || user?.phone}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="text-error hover:text-red-700 transition-colors text-sm font-bold bg-error/10 px-4 py-2 rounded-lg"
                    >
                      خروج
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-4 border-r border-navy-200/50 pr-4">
                  <Link 
                    to="/login" 
                    className={`font-bold text-sm transition-colors duration-300 hover:text-primary-500 ${
                      isHome && !scrolled ? 'text-white' : 'text-navy-900'
                    }`}
                  >
                    دخول
                  </Link>
                  <Link 
                    to="/login"
                    className="bg-primary-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-primary-600 hover:-translate-y-0.5 transition-all duration-300 shadow-md shadow-primary-500/20"
                  >
                    التسجيل
                  </Link>
                </div>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`md:hidden p-2 rounded-lg transition-colors ${
                isHome && !scrolled && !menuOpen ? 'text-white hover:bg-white/10' : 'text-navy-900 hover:bg-navy-50'
              }`}
              aria-label="القائمة"
            >
              {menuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-navy-100 shadow-xl absolute w-full">
            <div className="px-4 py-6 space-y-4">
              <Link to="/" className="block font-medium text-navy-900 hover:text-primary-500">
                الرئيسية
              </Link>
              <Link to="/pricing" className="block font-medium text-navy-900 hover:text-primary-500">
                الباقات
              </Link>
              <Link to="/photo-requirements" className="block font-medium text-navy-900 hover:text-primary-500">
                شروط الصورة
              </Link>
              <Link to="/about" className="block font-medium text-navy-900 hover:text-primary-500">
                عن المنصة
              </Link>
              <Link to="/help" className="block font-medium text-navy-900 hover:text-primary-500">
                المساعدة
              </Link>
              <Link to="/contact" className="block font-medium text-navy-900 hover:text-primary-500">
                تواصل معنا
              </Link>
              <Link to="/terms" className="block font-medium text-navy-900 hover:text-primary-500">
                الشروط
              </Link>
              <Link to="/privacy" className="block font-medium text-navy-900 hover:text-primary-500">
                الخصوصية
              </Link>
              {isAuthenticated ? (
                <>
                  <Link to="/my-account" className="block font-medium text-navy-900 hover:text-primary-500">
                    طلباتي
                  </Link>
                  <Link to="/check-result" className="block font-medium text-navy-900 hover:text-primary-500">
                    فحص النتيجة
                  </Link>
                  <Link to="/my-account/notifications" className="block font-medium text-navy-900 hover:text-primary-500">
                    الإشعارات
                  </Link>
                  <Link to="/my-account/settings" className="block font-medium text-navy-900 hover:text-primary-500">
                    الإعدادات
                  </Link>
                  <div className="pt-4 border-t border-navy-100 flex items-center justify-between">
                    <span className="text-navy-500 font-medium">{user?.full_name || user?.phone}</span>
                    <button onClick={handleLogout} className="text-error font-bold bg-error/10 px-4 py-2 rounded-lg">
                      تسجيل خروج
                    </button>
                  </div>
                </>
              ) : (
                <div className="pt-4 border-t border-navy-100 flex flex-col gap-3">
                  <Link to="/login" className="block text-center font-bold text-navy-900 py-3 bg-navy-50 rounded-xl">
                    تسجيل الدخول
                  </Link>
                  <Link to="/login" className="block text-center text-white bg-primary-500 py-3 rounded-xl font-bold shadow-md shadow-primary-500/20">
                    ابدأ التسجيل الآن
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content - No top padding if Home to allow hero to reach top */}
      <main className={`flex-1 ${!isHome ? 'pt-20' : ''}`}>
        <Outlet />
      </main>

      {/* Elegant Footer */}
      <footer className="bg-navy-900 text-navy-200 border-t border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
            <div className="col-span-1 md:col-span-2">
              <Link to="/" className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-2xl font-bold text-white tracking-tight">قرعة</span>
              </Link>
              <p className="text-navy-400 max-w-sm leading-relaxed mb-6">
                منصتك الآمنة والموثوقة للتسجيل في برنامج قرعة الهجرة العشوائية إلى الولايات المتحدة الأمريكية.
              </p>
              <div className="flex items-center gap-4">
                {/* Social placeholders */}
                <a href="#" className="w-10 h-10 rounded-full bg-navy-800 flex items-center justify-center text-navy-400 hover:bg-primary-500 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-navy-800 flex items-center justify-center text-navy-400 hover:bg-primary-500 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 tracking-wide">روابط هامة</h4>
              <ul className="space-y-3">
                <li><Link to="/pricing" className="hover:text-primary-400 transition-colors">الباقات والأسعار</Link></li>
                <li><Link to="/photo-requirements" className="hover:text-primary-400 transition-colors">متطلبات الصورة</Link></li>
                <li><Link to="/about" className="hover:text-primary-400 transition-colors">عن المنصة</Link></li>
                <li><Link to="/contact" className="hover:text-primary-400 transition-colors">تواصل معنا</Link></li>
                <li><Link to="/help" className="hover:text-primary-400 transition-colors">المساعدة والأسئلة الشائعة</Link></li>
                <li><Link to="/terms" className="hover:text-primary-400 transition-colors">الشروط والأحكام</Link></li>
                <li><Link to="/privacy" className="hover:text-primary-400 transition-colors">سياسة الخصوصية</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 tracking-wide">تواصل معنا</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  <span dir="ltr">support@qor3a.com</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  <span dir="ltr">+967 770 000 000</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-navy-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-navy-500">
            <p>© 2026 قرعة - جميع الحقوق محفوظة</p>
            <a href="/dashboard" className="hover:text-white transition-colors bg-navy-800 px-4 py-2 rounded-lg">بوابة الموظفين</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
