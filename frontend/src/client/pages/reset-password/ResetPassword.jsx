import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../../common/services/api'
import toast from 'react-hot-toast'
import SEO from '../../../common/components/SEO'

export default function ResetPassword() {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password.length < 8) {
      toast.error('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { phone, otp, password })
      toast.success('تم تغيير كلمة المرور بنجاح')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'فشل تغيير كلمة المرور')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-50 to-white p-4">
      <SEO title="إعادة تعيين كلمة المرور" url="/reset-password" />
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-navy-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gold-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gold-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-navy-900 mb-2">إعادة تعيين كلمة المرور</h1>
            <p className="text-navy-500">أدخل رقم هاتفك ورمز التحقق وكلمة المرور الجديدة</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-navy-700 mb-2">رقم الهاتف (مع مفتاح الدولة)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="967XXXXXXXXX"
                required
                dir="ltr"
                className="w-full px-4 py-3 rounded-xl border border-navy-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all text-navy-900"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-navy-700 mb-2">رمز التحقق</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6 أرقام"
                required
                maxLength={6}
                className="w-full px-4 py-3 rounded-xl border border-navy-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all text-navy-900"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-navy-700 mb-2">كلمة المرور الجديدة</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8 أحرف على الأقل"
                required
                minLength={8}
                className="w-full px-4 py-3 rounded-xl border border-navy-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all text-navy-900"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-500 text-white py-3 rounded-xl font-bold hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'جارٍ الحفظ...' : 'تغيير كلمة المرور'}
            </button>
            <Link to="/login" className="block text-center text-sm text-navy-500 hover:text-primary-500 transition-colors">
              العودة إلى تسجيل الدخول
            </Link>
          </form>
        </div>
      </div>
    </div>
  )
}
