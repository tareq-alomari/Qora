import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../../common/services/api'
import toast from 'react-hot-toast'
import SEO from '../../../common/components/SEO'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
      toast.success('تم إرسال رمز التحقق إلى بريدك الإلكتروني')
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'فشل إرسال رمز التحقق')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-50 to-white p-4">
      <SEO title="استعادة كلمة المرور" url="/forgot-password" />
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-navy-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-navy-900 mb-2">استعادة كلمة المرور</h1>
            <p className="text-navy-500">أدخل بريدك الإلكتروني وسنرسل لك رمز التحقق</p>
          </div>

          {sent ? (
            <div className="text-center">
              <div className="bg-success/10 text-success rounded-2xl p-6 mb-6">
                <svg className="w-12 h-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-bold text-lg mb-1">تم الإرسال!</p>
                <p className="text-sm">تحقق من بريدك الإلكتروني للحصول على رمز التحقق</p>
              </div>
              <Link
                to="/reset-password"
                className="block w-full bg-primary-500 text-white py-3 rounded-xl font-bold hover:bg-primary-600 transition-colors"
              >
                إعادة تعيين كلمة المرور
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-navy-700 mb-2">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-navy-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all text-navy-900"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-500 text-white py-3 rounded-xl font-bold hover:bg-primary-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'جارٍ الإرسال...' : 'إرسال رمز التحقق'}
              </button>
              <Link to="/login" className="block text-center text-sm text-navy-500 hover:text-primary-500 transition-colors">
                العودة إلى تسجيل الدخول
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
