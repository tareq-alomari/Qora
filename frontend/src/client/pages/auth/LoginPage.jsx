import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@common/stores/authStore'
import OtpInput from '@common/components/OtpInput'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const { login, verifyOtp } = useAuthStore()
  const navigate = useNavigate()
  const timerRef = useRef(null)

  useEffect(() => {
    if (resendTimer > 0) {
      timerRef.current = setTimeout(() => setResendTimer((t) => t - 1), 1000)
    }
    return () => clearTimeout(timerRef.current)
  }, [resendTimer])

  const handleRequestOtp = async (e) => {
    e.preventDefault()
    const cleaned = phone.replace(/\s/g, '')
    if (!/^967\d{9}$/.test(cleaned)) {
      toast.error('رقم الهاتف يجب أن يبدأ بـ 967 ويتكون من 12 رقم')
      return
    }
    setLoading(true)
    try {
      await login(cleaned)
      toast.success('تم إرسال رمز التحقق')
      setStep(2)
      setResendTimer(60)
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'حدث خطأ، حاول مرة أخرى'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (otp.length !== 6) {
      toast.error('رمز التحقق يجب أن يكون 6 أرقام')
      return
    }
    setLoading(true)
    try {
      const user = await verifyOtp(phone.replace(/\s/g, ''), otp)
      toast.success('تم تسجيل الدخول بنجاح')
      if (user.role === 'employee' || user.role === 'admin') {
        navigate('/dashboard')
      } else {
        navigate('/my-account')
      }
    } catch {
      toast.error('رمز التحقق غير صحيح')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendTimer > 0) return
    try {
      await login(phone.replace(/\s/g, ''))
      toast.success('تم إعادة إرسال الرمز')
      setResendTimer(60)
    } catch {
      toast.error('حدث خطأ')
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-navy-50 font-sans" dir="rtl">
      {/* Visual Section - Left Side */}
      <div className="hidden md:flex md:w-1/2 bg-navy-900 relative overflow-hidden flex-col justify-center p-12 lg:p-24">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-navy-900 to-navy-800 opacity-90 z-0"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        
        <div className="relative z-10 text-white">
          <Link to="/" className="inline-flex items-center gap-3 mb-16 group">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-all duration-300">
              <svg className="w-6 h-6 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-3xl font-bold tracking-tight">قرعة</span>
          </Link>
          
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
            مرحباً بك مجدداً في <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-gold-400">
              بوابتك الموثوقة
            </span>
          </h1>
          <p className="text-navy-300 text-lg max-w-md leading-relaxed">
            تابع حالة طلبك وتأكد من نتائجك بسهولة وأمان. نحن هنا لضمان تقديم طلبك بشكل احترافي.
          </p>
          
          <div className="mt-16 grid grid-cols-2 gap-6">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
              <div className="text-gold-400 font-bold text-2xl mb-1">100%</div>
              <div className="text-navy-300 text-sm">أمان وخصوصية</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
              <div className="text-primary-400 font-bold text-2xl mb-1">24/7</div>
              <div className="text-navy-300 text-sm">دعم فني متواصل</div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section - Right Side */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white relative">
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
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-navy-900 mb-3">تسجيل الدخول</h2>
            <p className="text-navy-500">أدخل رقم هاتفك للمتابعة</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-navy-100/50 border border-navy-100 p-8 sm:p-10">
            {step === 1 ? (
              <form onSubmit={handleRequestOtp} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-navy-900">رقم الهاتف</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                      <svg className="w-5 h-5 text-navy-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="967 XXXXXXXX"
                      className="w-full pl-12 pr-4 py-3.5 bg-navy-50/50 border border-navy-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all rtl text-left font-medium"
                      dir="ltr"
                      required
                    />
                  </div>
                  <p className="text-xs text-navy-400 flex items-center gap-1.5 mt-2">
                    <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    الصيغة: 967 متبوعاً بـ 9 أرقام
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-600 focus:ring-4 focus:ring-primary-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-primary-500/30 flex justify-center items-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      جاري الإرسال...
                    </>
                  ) : 'إرسال رمز التحقق'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-bold text-navy-900">رمز التحقق (OTP)</label>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-xs text-primary-500 font-semibold hover:text-primary-700"
                    >
                      تعديل الرقم؟
                    </button>
                  </div>
                  <div className="flex justify-center" dir="ltr">
                    <OtpInput length={6} value={otp} onChange={setOtp} disabled={loading} />
                  </div>
                  <p className="text-xs text-navy-400 text-center mt-3">أدخل الرمز المكون من 6 أرقام المرسل إلى هاتفك</p>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-primary-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-600 focus:ring-4 focus:ring-primary-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-primary-500/30"
                >
                  {loading ? 'جاري التحقق...' : 'تأكيد الدخول'}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendTimer > 0}
                    className="text-sm font-medium text-navy-500 hover:text-primary-600 transition-colors disabled:text-navy-300 disabled:hover:text-navy-300"
                  >
                    {resendTimer > 0 ? `إعادة الإرسال متاحة بعد ${resendTimer} ثانية` : 'لم يصلك الرمز؟ أعد الإرسال'}
                  </button>
                </div>
              </form>
            )}
          </div>
          
          {step === 1 && (
            <p className="text-center text-navy-500 mt-8 font-medium">
              ليس لديك حساب؟{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-500 font-bold transition-colors">
                أنشئ حساباً جديداً
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
