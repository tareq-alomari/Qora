import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '@common/services/api'
import { getStatusLabel, getStatusColor, formatDateTime, formatDateLong } from '@common/utils/formatters'

const STEPS = [
  { id: 'registered', label: 'إنشاء الحساب', icon: '📝' },
  { id: 'data_entry', label: 'إدخال البيانات', icon: '📋' },
  { id: 'photo', label: 'فحص الصورة', icon: '📸' },
  { id: 'payment', label: 'الدفع', icon: '💳' },
  { id: 'verification', label: 'تدقيق الدفع', icon: '🔍' },
  { id: 'approved', label: 'الاعتماد', icon: '✅' },
  { id: 'submitted', label: 'التقديم للقرعة', icon: '🚀' },
  { id: 'result', label: 'النتيجة النهائية', icon: '🏆' },
]

const STATUS_TO_STEP = {
  draft: 0,
  data_entry_complete: 1,
  photo_pending: 1,
  photo_rejected: 1,
  photo_accepted: 2,
  payment_pending: 3,
  payment_verification: 4,
  needs_correction: 1,
  approved: 5,
  submitted: 6,
  completed: 7,
  cancelled: -1,
}

const getStepIndex = (status) => STATUS_TO_STEP[status] ?? 0

const CTA_MAP = {
  draft: { text: 'استكمال البيانات', link: '/lottery' },
  data_entry_complete: { text: 'رفع الصورة', link: '/lottery' },
  photo_pending: { text: 'رفع الصورة', link: '/lottery' },
  photo_rejected: { text: 'إعادة رفع الصورة', link: '/lottery' },
  photo_accepted: { text: 'إتمام الدفع', link: '/lottery' },
  payment_pending: { text: 'إتمام الدفع', link: '/lottery' },
  payment_verification: null,
  needs_correction: { text: 'تعديل الطلب', link: '/lottery' },
  approved: { text: 'عرض طلباتي', link: '/my-account' },
  submitted: { text: 'عرض طلباتي', link: '/my-account' },
  completed: { text: 'عرض طلباتي', link: '/my-account' },
  cancelled: { text: 'إنشاء طلب جديد', link: '/lottery' },
}

export default function OrderStatusPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data } = await api.get(`/orders/${id}`)
        setOrder(data.data)
      } catch (err) {
        if (err.response?.status === 404) {
          setError('NOT_FOUND')
        } else {
          setError('SERVER_ERROR')
        }
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [id])

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // silent
    }
  }

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center py-20 bg-navy-50">
        <svg className="animate-spin h-12 w-12 text-primary-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <p className="text-navy-500 font-semibold text-lg">جاري تحميل تفاصيل الطلب...</p>
      </div>
    )
  }

  if (error === 'NOT_FOUND') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center py-20 bg-navy-50 px-4">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg shadow-navy-200/50 mb-6">
          <span className="text-5xl">🔍</span>
        </div>
        <h1 className="text-3xl font-bold text-navy-900 mb-2">الطلب غير موجود</h1>
        <p className="text-navy-500 mb-8 max-w-md text-center">لم نتمكن من العثور على طلب بهذا الرقم. قد يكون قد تم حذفه أو أن الرقم غير صحيح.</p>
        <button onClick={() => navigate('/my-account')} className="bg-primary-500 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-primary-500/30 hover:bg-primary-600 transition">
          العودة إلى طلباتي
        </button>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center py-20 bg-navy-50 px-4">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg shadow-navy-200/50 mb-6">
          <span className="text-5xl">⚠️</span>
        </div>
        <h1 className="text-3xl font-bold text-navy-900 mb-2">حدث خطأ</h1>
        <p className="text-navy-500 mb-8 text-center">تعذر تحميل البيانات من الخادم. يرجى المحاولة مرة أخرى لاحقاً.</p>
        <button onClick={() => window.location.reload()} className="bg-primary-500 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-primary-500/30 hover:bg-primary-600 transition">
          إعادة المحاولة
        </button>
      </div>
    )
  }

  if (!order) return null

  const stepIndex = getStepIndex(order.status)
  const isCancelled = order.status === 'cancelled'
  const cta = CTA_MAP[order.status]

  return (
    <div className="min-h-screen bg-navy-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <Link to="/my-account" className="inline-flex items-center gap-2 text-sm font-semibold text-navy-400 hover:text-primary-600 transition mb-4">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
              العودة للطلبات
            </Link>
            <h1 className="text-3xl font-extrabold text-navy-900 flex items-center gap-4">
              متابعة الطلب
              <span className={`text-sm px-4 py-1.5 rounded-full font-bold tracking-wide shadow-sm border bg-white ${order.status === 'submitted' || order.status === 'completed' ? 'text-success border-success' : 'text-primary-600 border-primary-200'}`}>
                {getStatusLabel(order.status)}
              </span>
            </h1>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs font-bold text-navy-400 uppercase tracking-wider mb-1">رقم الطلب</span>
            <span className="text-2xl font-black text-navy-900 tracking-tighter">{order.order_number}</span>
          </div>
        </div>

        {/* Confirmation Number Banner */}
        {order.confirmation_number && (
          <div className="relative overflow-hidden bg-white border border-primary-100 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl shadow-primary-500/5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 -z-10"></div>
            <div>
              <div className="flex items-center gap-2 text-primary-500 font-bold mb-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                رقم التأكيد الرسمي (Confirmation Number)
              </div>
              <p className="text-3xl sm:text-4xl font-black text-navy-900 font-mono tracking-widest direction-ltr text-left">
                {order.confirmation_number}
              </p>
              <p className="text-sm text-navy-400 mt-2">يرجى الاحتفاظ بهذا الرقم، ستحتاجه لمعرفة النتيجة في الموقع الرسمي.</p>
            </div>
            <button
              onClick={() => handleCopy(order.confirmation_number)}
              className={`shrink-0 flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold transition-all shadow-md ${
                copied
                  ? 'bg-success text-white shadow-success/30'
                  : 'bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-200'
              }`}
            >
              {copied ? 'تم النسخ بنجاح ✓' : 'نسخ الرقم'}
            </button>
          </div>
        )}

        {/* Progress Timeline */}
        <div className="bg-white rounded-3xl shadow-xl shadow-navy-100/50 border border-navy-100 p-8 sm:p-10 relative overflow-hidden">
          <h2 className="font-bold text-xl text-navy-900 mb-10 flex items-center gap-3">
            مسار الطلب
            <span className="h-1 flex-1 bg-gradient-to-l from-navy-100 to-transparent rounded-full"></span>
          </h2>
          
          <div className="relative pb-4 overflow-x-auto hide-scrollbar">
            <div className="min-w-[700px] px-4">
              {/* Line */}
              <div className="absolute top-7 left-10 right-10 h-1.5 bg-navy-50 rounded-full z-0">
                <div
                  className="h-full bg-gradient-to-r from-primary-400 to-primary-500 transition-all duration-700 ease-out rounded-full shadow-sm shadow-primary-500/50"
                  style={{ width: isCancelled ? '0%' : `${Math.min(100, (stepIndex / (STEPS.length - 1)) * 100)}%` }}
                />
              </div>

              {/* Steps */}
              <div className="relative z-10 flex justify-between">
                {STEPS.map((step, i) => {
                  const isCompleted = !isCancelled && i <= stepIndex
                  const isActive = !isCancelled && i === stepIndex
                  const isCancelledStep = isCancelled && i === 0

                  return (
                    <div key={step.id} className="flex flex-col items-center text-center w-20">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4 transition-all duration-500 shadow-md ${
                          isCancelledStep
                            ? 'bg-red-50 text-red-500 border-2 border-red-200 scale-100'
                            : isActive
                              ? 'bg-primary-500 text-white shadow-primary-500/40 scale-110 ring-4 ring-primary-50'
                              : isCompleted
                                ? 'bg-white text-success border-2 border-success shadow-success/20'
                                : 'bg-white text-navy-300 border-2 border-navy-100 scale-95'
                        }`}
                      >
                        {isCancelledStep ? '❌' : isCompleted && !isActive ? (
                          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : step.icon}
                      </div>
                      <p
                        className={`text-xs font-bold leading-relaxed ${
                          isCancelledStep ? 'text-red-600' : isActive ? 'text-primary-600' : isCompleted ? 'text-navy-700' : 'text-navy-300'
                        }`}
                      >
                        {step.label}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {isCancelled && (
            <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 font-bold">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              تم إلغاء هذا الطلب من قبل الإدارة.
            </div>
          )}
        </div>

        {/* Result Banner */}
        {order.result && (
          <div className={`rounded-3xl p-8 sm:p-10 border shadow-lg text-center relative overflow-hidden ${
            order.result === 'winner' ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 shadow-emerald-500/10' : 'bg-white border-navy-200'
          }`}>
            {order.result === 'winner' ? (
              <>
                <div className="absolute top-0 right-0 w-64 h-64 bg-gold-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-0"></div>
                <div className="relative z-10">
                  <div className="text-7xl mb-6 drop-shadow-md">🎉</div>
                  <h2 className="text-3xl font-black text-emerald-600 mb-3">ألف مبروك! أنت فائز</h2>
                  <p className="text-emerald-800 font-medium text-lg max-w-xl mx-auto">
                    تم اختيارك رسمياً في قرعة التنوع (DV Lottery). سيتواصل معك فريقنا قريباً جداً لإرشادك حول الخطوات القادمة والمقابلة القنصلية.
                  </p>
                </div>
              </>
            ) : (
              <div>
                <div className="text-6xl mb-6 opacity-80">😔</div>
                <h2 className="text-2xl font-bold text-navy-800 mb-2">لم يتم اختيارك هذه المرة</h2>
                <p className="text-navy-500 font-medium max-w-lg mx-auto">
                  حظاً أوفر في الموسم القادم. لا تفقد الأمل، الكثيرون يفوزون في محاولاتهم اللاحقة. يمكنك المحاولة معنا مجدداً العام القادم!
                </p>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Order Details */}
          <div className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-navy-100 p-8">
            <h2 className="font-bold text-xl text-navy-900 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              معلومات أساسية
            </h2>
            <div className="space-y-5">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-navy-400 mb-1">رقم الطلب التسلسلي</span>
                <span className="font-bold text-navy-900 text-lg">{order.order_number}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-navy-400 mb-1">تاريخ فتح الطلب</span>
                <span className="font-bold text-navy-900 text-lg">{formatDateLong(order.created_at)}</span>
              </div>
              {order.submitted_at && (
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-navy-400 mb-1">تاريخ التقديم الرسمي</span>
                  <span className="font-bold text-success text-lg">{formatDateLong(order.submitted_at)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Call to Action */}
          <div className="flex flex-col justify-center gap-4">
            {cta ? (
              <div className="bg-white rounded-3xl shadow-lg border border-primary-100 p-8 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center text-primary-500 mb-4">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <h3 className="text-lg font-bold text-navy-900 mb-2">خطوتك القادمة</h3>
                <p className="text-sm text-navy-500 mb-6">هناك إجراء مطلوب منك لاستكمال هذا الطلب.</p>
                <Link
                  to={`${cta.link}${cta.link === '/lottery' ? `?orderId=${order.order_id}` : ''}`}
                  className="w-full bg-primary-500 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-primary-500/30 hover:bg-primary-600 hover:-translate-y-0.5 transition-all duration-300"
                >
                  {cta.text}
                </Link>
              </div>
            ) : order.status === 'payment_verification' ? (
              <div className="bg-gradient-to-br from-gold-50 to-orange-50 rounded-3xl shadow-sm border border-gold-200 p-8 flex flex-col items-center justify-center text-center h-full">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-gold-500 shadow-sm mb-4">
                  <svg className="w-8 h-8 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="text-lg font-bold text-orange-800 mb-2">جاري تدقيق الدفع</h3>
                <p className="text-sm text-orange-700/80 font-medium">وصلنا إشعار الدفع الخاص بك، وهو الآن قيد المراجعة. سنعلمك فور التأكيد للانتقال للخطوة التالية.</p>
              </div>
            ) : (
              <div className="bg-navy-50 rounded-3xl border border-navy-100 p-8 flex flex-col items-center justify-center text-center h-full">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-success shadow-sm mb-4">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="text-lg font-bold text-navy-900 mb-2">كل شيء على ما يرام</h3>
                <p className="text-sm text-navy-500 font-medium">لا توجد أي إجراءات مطلوبة منك في الوقت الحالي.</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Audit Log / History */}
        {order.audit_logs && order.audit_logs.length > 0 && (
          <div className="bg-white rounded-3xl shadow-sm border border-navy-100 p-8 mt-8">
            <h2 className="font-bold text-xl text-navy-900 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-navy-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              سجل التحديثات
            </h2>
            <div className="space-y-0 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-navy-200 before:to-transparent">
              {order.audit_logs.map((log, i) => (
                <div key={log.audit_id || i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active py-4">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full border-4 border-white bg-primary-300 group-hover:bg-primary-500 group-hover:scale-125 transition-all shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10"></div>
                  <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.25rem)] bg-white p-4 rounded-xl border border-navy-100 shadow-sm group-hover:shadow-md transition-shadow">
                    <p className="font-bold text-navy-800">{log.action_label || log.action}</p>
                    <p className="text-xs font-semibold text-navy-400 mt-1 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {formatDateTime(log.created_at)}
                    </p>
                    {(log.from_status || log.to_status) && (
                      <div className="mt-2 text-xs font-semibold flex items-center gap-2">
                        {log.from_status && <span className="bg-navy-50 text-navy-500 px-2 py-1 rounded">{getStatusLabel(log.from_status)}</span>}
                        {log.from_status && log.to_status && <span className="text-navy-300">→</span>}
                        {log.to_status && <span className="bg-primary-50 text-primary-600 px-2 py-1 rounded">{getStatusLabel(log.to_status)}</span>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
