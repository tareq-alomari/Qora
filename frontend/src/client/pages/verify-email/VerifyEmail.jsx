import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../../../common/services/api'
import toast from 'react-hot-toast'
import SEO from '../../../common/components/SEO'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [verified, setVerified] = useState(false)
  const [resent, setResent] = useState(false)

  useEffect(() => {
    if (token) {
      verifyWithToken(token)
    }
  }, [token])

  const verifyWithToken = async (t) => {
    setLoading(true)
    try {
      await api.post('/auth/verify-email', { token: t })
      setVerified(true)
      toast.success('تم تأكيد البريد الإلكتروني بنجاح')
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'فشل تأكيد البريد')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/send-verification', { email })
      setResent(true)
      toast.success('تم إعادة إرسال رابط التفعيل')
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'فشل الإرسال')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-50 to-white p-4">
      <SEO title="تأكيد البريد الإلكتروني" url="/verify-email" />
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-navy-100 text-center">
          {loading && !verified ? (
            <div className="py-8">
              <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-navy-500">جاري تأكيد البريد الإلكتروني...</p>
            </div>
          ) : verified ? (
            <>
              <div className="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-navy-900 mb-2">تم التأكيد!</h1>
              <p className="text-navy-500 mb-6">تم تأكيد بريدك الإلكتروني بنجاح</p>
              <Link to="/login" className="inline-block bg-primary-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-600 transition-colors">
                تسجيل الدخول
              </Link>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-navy-900 mb-2">تأكيد البريد الإلكتروني</h1>
              <p className="text-navy-500 mb-6">أدخل بريدك الإلكتروني لإعادة إرسال رابط التفعيل</p>

              {resent ? (
                <div className="bg-success/10 text-success rounded-2xl p-4 mb-4">
                  تم إرسال رابط التفعيل إلى بريدك الإلكتروني. تحقق من صندوق الوارد.
                </div>
              ) : (
                <form onSubmit={handleResend} className="space-y-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-navy-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all text-navy-900"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary-500 text-white py-3 rounded-xl font-bold hover:bg-primary-600 transition-colors disabled:opacity-50"
                  >
                    إعادة إرسال رابط التفعيل
                  </button>
                </form>
              )}

              <Link to="/login" className="block mt-4 text-sm text-navy-500 hover:text-primary-500 transition-colors">
                العودة إلى تسجيل الدخول
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
