import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@common/stores/authStore'
import toast from 'react-hot-toast'
import SEO from '../../../common/components/SEO'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

export default function AuthPage() {
  const location = useLocation()
  const [mode, setMode] = useState(location.pathname === '/login' ? 'login' : 'register')
  const isLogin = mode === 'login'

  useEffect(() => {
    setMode(location.pathname === '/login' ? 'login' : 'register')
  }, [location.pathname])
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const { loginWithEmail, registerWithEmail, googleAuth } = useAuthStore()

  const handleGoogleResponse = async (response) => {
    setLoading(true)
    try {
      const user = await googleAuth(response.credential)
      toast.success(isLogin ? 'تم تسجيل الدخول' : 'تم إنشاء الحساب')
      window.location.href = user.role === 'employee' || user.role === 'admin' ? '/dashboard' : '/my-account'
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'فشل')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = () => {
    if (!GOOGLE_CLIENT_ID) {
      toast.error('تسجيل الدخول بواسطة Google غير متاح حالياً')
      return
    }
    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        cancel_on_tap_outside: false,
      })
    }
    window.google?.accounts?.id?.prompt()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isLogin) {
        if (!email || !password) {
          toast.error('البريد الإلكتروني وكلمة المرور مطلوبان')
          setLoading(false)
          return
        }
        const user = await loginWithEmail(email, password)
        toast.success('تم تسجيل الدخول بنجاح')
        window.location.href = user.role === 'employee' || user.role === 'admin' ? '/dashboard' : '/my-account'
      } else {
        if (password !== passwordConfirm) {
          toast.error('كلمة المرور غير متطابقة')
          setLoading(false)
          return
        }
        if (password.length < 8) {
          toast.error('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
          setLoading(false)
          return
        }
        await registerWithEmail(fullName, email, phone.replace(/\s/g, '') || undefined, password)
        toast.success('تم إنشاء الحساب بنجاح')
        window.location.href = '/lottery'
      }
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'حدث خطأ')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFullName('')
    setEmail('')
    setPhone('')
    setPassword('')
    setPasswordConfirm('')
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-navy-50 font-sans" dir="rtl">
      <SEO
        title={isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
        description={isLogin ? 'تسجيل الدخول إلى حسابك في قرعة لتقديم طلب قرعة الهجرة العشوائية الأمريكية DV Lottery.' : 'أنشئ حساب جديد في قرعة وابدأ التقديم على قرعة اللوتري DV Lottery. فحص الصورة بالذكاء الاصطناعي، تعبئة بيانات، تقديم رسمي.'}
        url={isLogin ? '/login' : '/register'}
      />
      {/* Visual Section */}
      <div className="hidden md:flex md:w-1/2 bg-navy-900 relative overflow-hidden flex-col justify-center p-12 lg:p-24 order-2 md:order-1">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-navy-900 to-navy-800 opacity-90 z-0"></div>
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-gold-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-20 left-10 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="relative z-10 text-white">
          <Link to="/" className="inline-flex items-center gap-3 mb-16 group">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-all duration-300">
              <svg className="w-6 h-6 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-3xl font-bold tracking-tight">قرعة</span>
          </Link>
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
            {isLogin ? 'مرحباً بك مجدداً' : 'ابدأ رحلتك نحو'}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-gold-400">
              {isLogin ? 'بوابتك الموثوقة' : 'فرصة جديدة'}
            </span>
          </h1>
          <p className="text-navy-300 text-lg max-w-md leading-relaxed">
            {isLogin
              ? 'تابع حالة طلبك وتأكد من نتائج قرعة الهجرة الأمريكية (DV Lottery) بسهولة.'
              : 'أنشئ حسابك الآن وابدأ في التقديم على قرعة أمريكا. نوفر لك خدمة متكاملة.'}
          </p>
          {!isLogin && (
            <div className="mt-12 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                  <svg className="w-5 h-5 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <span className="font-medium">تسجيل سريع وآمن</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                  <svg className="w-5 h-5 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <span className="font-medium">طرق دفع محلية متعددة</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white relative order-1 md:order-2">
        <div className="absolute top-6 right-6 md:hidden">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-xl font-bold text-navy-900">قرعة</span>
          </Link>
        </div>

        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-navy-900 mb-3">
              {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
            </h2>
            <p className="text-navy-500">
              {isLogin ? 'أدخل بياناتك للدخول إلى حسابك' : 'أدخل بياناتك لإنشاء حساب جديد'}
            </p>
          </div>

          {/* Toggle */}
          <div className="flex bg-navy-50 rounded-xl p-1 mb-8">
            <button
              onClick={() => { setMode('login'); resetForm() }}
              className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${
                isLogin ? 'bg-white text-primary-600 shadow-sm' : 'text-navy-500 hover:text-navy-700'
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              onClick={() => { setMode('register'); resetForm() }}
              className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${
                !isLogin ? 'bg-white text-primary-600 shadow-sm' : 'text-navy-500 hover:text-navy-700'
              }`}
            >
              إنشاء حساب
            </button>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-navy-100/50 border border-navy-100 p-8 sm:p-10">
            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-navy-900">الاسم الكامل</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                    placeholder="محمد أحمد" required
                    className="w-full px-4 py-3.5 bg-navy-50/50 border border-navy-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all font-medium" />
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-bold text-navy-900">البريد الإلكتروني</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com" dir="ltr" required
                  className="w-full px-4 py-3.5 bg-navy-50/50 border border-navy-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-left font-medium" />
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-navy-900">رقم الهاتف (اختياري)</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="967XXXXXXXXX" dir="ltr"
                    className="w-full px-4 py-3.5 bg-navy-50/50 border border-navy-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-left font-medium" />
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-bold text-navy-900">كلمة المرور</label>
                  {isLogin && (
                    <Link to="/forgot-password" className="text-xs text-primary-500 font-semibold hover:text-primary-700">
                      نسيت كلمة المرور؟
                    </Link>
                  )}
                </div>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder={isLogin ? '••••••••' : '•••••••• (8 أحرف على الأقل)'} dir="ltr" required
                  className="w-full px-4 py-3.5 bg-navy-50/50 border border-navy-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-left font-medium" />
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-navy-900">تأكيد كلمة المرور</label>
                  <input type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder="••••••••" dir="ltr" required
                    className="w-full px-4 py-3.5 bg-navy-50/50 border border-navy-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-left font-medium" />
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full bg-primary-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-600 focus:ring-4 focus:ring-primary-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-primary-500/30">
                {loading ? 'جاري...' : (isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد')}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-navy-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-navy-400 font-medium">أو</span>
              </div>
            </div>

            {/* Google */}
            <button onClick={handleGoogle} disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-navy-200 text-navy-900 py-4 rounded-xl font-bold text-lg hover:bg-navy-50 focus:ring-4 focus:ring-navy-200 transition-all disabled:opacity-70">
              <svg className="w-6 h-6" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l6.19 5.238A20.004 20.004 0 0044 24c0-1.341-.138-2.65-.389-3.917z"/></svg>
              {loading ? 'جاري...' : (isLogin ? 'تسجيل الدخول بواسطة Google' : 'التسجيل بواسطة Google')}
            </button>
            {!GOOGLE_CLIENT_ID && (
              <p className="text-xs text-navy-400 text-center mt-3">تسجيل الدخول بواسطة Google غير متاح حالياً (قريباً)</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
