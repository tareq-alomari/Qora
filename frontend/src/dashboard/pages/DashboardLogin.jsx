import { useState } from 'react'

export default function DashboardLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError('البريد الإلكتروني وكلمة المرور مطلوبان')
      return
    }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/v1/auth/login-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error?.message || data.message || 'خطأ في البريد أو كلمة المرور')
      }

      localStorage.setItem('accessToken', data.data.access_token)
      window.location.href = '/dashboard'
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4 shadow-lg shadow-primary-200">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">لوحة التحكم</h1>
          <p className="text-slate-500 mt-1">تسجيل الدخول للموظفين والإداريين</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@qor3a.ye"
                dir="ltr"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                dir="ltr"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-primary-700 focus:ring-4 focus:ring-primary-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-primary-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>جاري الدخول...</>
              ) : 'تسجيل الدخول'}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-400 text-center mb-3">حسابات تجريبية</p>
            <div className="space-y-2 text-xs text-slate-500">
              <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                <span className="text-slate-400">مدير</span>
                <span dir="ltr" className="font-mono text-slate-700">admin@qor3a.ye / admin123</span>
              </div>
              <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                <span className="text-slate-400">موظف</span>
                <span dir="ltr" className="font-mono text-slate-700">employee@qor3a.ye / admin123</span>
              </div>
            </div>
          </div>
        </div>

        {/* Client link */}
        <div className="text-center mt-6">
          <a href="/login" className="text-sm text-slate-400 hover:text-primary-600 transition-colors">
            ← بوابة العملاء
          </a>
        </div>
      </div>
    </div>
  )
}
