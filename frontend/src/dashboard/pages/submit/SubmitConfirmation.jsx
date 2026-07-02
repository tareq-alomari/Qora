import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '@/common/services/api'
import toast from 'react-hot-toast'

export default function SubmitConfirmation() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(({ data }) => setOrder(data.data))
      .catch((err) => toast.error(err.response?.data?.error?.message || 'فشل تحميل الطلب'))
      .finally(() => setLoading(false))
  }, [id])

  const handleMarkCompleted = async () => {
    setActionLoading(true)
    try {
      await api.patch(`/orders/${id}/status`, {
        action: 'mark_completed',
        notes: 'تم تأكيد الإكتمال',
      })
      toast.success('تم تأكيد اكتمال الطلب')
      navigate('/dashboard/submit')
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'فشل تحديث الحالة')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6 max-w-2xl mx-auto">
        <div className="h-6 bg-navy-200 rounded w-48" />
        <div className="bg-white rounded-3xl border border-navy-100 p-8 space-y-4">
          <div className="h-16 w-16 bg-navy-200 rounded-full mx-auto" />
          <div className="h-6 bg-navy-200 rounded w-48 mx-auto" />
          <div className="h-12 bg-navy-100 rounded-xl mt-8" />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-navy-400">
        <svg className="w-16 h-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-xl font-bold text-navy-900 mb-2">الطلب غير موجود</h2>
        <p>لا يمكن العثور على الطلب المطلوب.</p>
        <Link to="/dashboard/submit" className="mt-6 px-6 py-2 bg-primary-50 text-primary-600 font-bold rounded-xl hover:bg-primary-100 transition-colors">
          العودة للقائمة
        </Link>
      </div>
    )
  }

  const isSubmitted = order.status === 'submitted' || order.status === 'completed'

  return (
    <div className="pb-12 animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center gap-2 text-sm font-semibold text-navy-500 mb-8">
        <Link to="/dashboard/submit" className="hover:text-primary-500 transition-colors">قائمة التقديم</Link>
        <span className="text-navy-300">/</span>
        <span>طلب #{order.order_number || id?.slice(0, 8)}</span>
      </div>

      <div className="space-y-6">
        {/* Main Status Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-navy-100 p-8 text-center relative overflow-hidden">
          <div className={`absolute top-0 inset-x-0 h-2 ${order.status === 'completed' ? 'bg-gold-500' : isSubmitted ? 'bg-emerald-500' : 'bg-warning'}`}></div>
          
          <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 shadow-sm border-4 border-white ${order.status === 'completed' ? 'bg-gold-100 text-gold-500 text-4xl' : isSubmitted ? 'bg-emerald-100 text-emerald-500 text-4xl' : 'bg-warning/20 text-warning-600 text-4xl'}`}>
            {order.status === 'completed' ? '🏆' : isSubmitted ? '✅' : '📋'}
          </div>
          
          <h2 className="text-3xl font-black text-navy-900 mb-2 tracking-tight">
            {order.status === 'completed' ? 'طلب مكتمل وتم إنهاءه' : isSubmitted ? 'تم الإدخال الرسمي بنجاح' : 'بانتظار الإدخال'}
          </h2>
          <p className="text-navy-500 font-medium mb-8">
            للعميل: <strong className="text-navy-900">{order.client_name || '-'}</strong>
          </p>

          {order.confirmation_number && (
            <div className="bg-primary-50 border border-primary-200 rounded-2xl p-6 mb-8 max-w-sm mx-auto">
              <p className="text-sm font-bold text-primary-600 mb-2">رقم التأكيد (Confirmation Number)</p>
              <p className="text-2xl font-black font-mono text-primary-700 tracking-widest bg-white py-2 rounded-xl border border-primary-100" dir="ltr">
                {order.confirmation_number}
              </p>
            </div>
          )}

          <div className="bg-navy-50/50 rounded-2xl p-6 space-y-4 text-sm font-medium">
            <div className="flex justify-between items-center pb-4 border-b border-navy-100">
              <span className="text-navy-500">الحالة الحالية</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${order.status === 'completed' ? 'bg-gold-50 text-gold-600 border-gold-200' : isSubmitted ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-navy-50 text-navy-600 border-navy-200'}`}>
                {order.status === 'completed' ? 'مكتمل' : isSubmitted ? 'مقدم' : order.status}
              </span>
            </div>
            {order.submitted_at && (
              <div className="flex justify-between items-center pt-2">
                <span className="text-navy-500">تاريخ التقديم الفعلي</span>
                <span className="text-navy-900 font-bold">{new Date(order.submitted_at).toLocaleString('ar-SA')}</span>
              </div>
            )}
          </div>
        </div>

        {isSubmitted && order.status !== 'completed' && (
          <div className="bg-white rounded-3xl shadow-sm border border-navy-100 p-8 text-center animate-fade-in-up">
            <h3 className="text-lg font-black text-navy-900 mb-4">هل أنهيت جميع الإجراءات؟</h3>
            <p className="text-sm text-navy-500 mb-6">قم بتأكيد اكتمال الطلب لإغلاقه نهائياً ونقله للأرشيف المنجز.</p>
            <button
              onClick={handleMarkCompleted}
              disabled={actionLoading}
              className="w-full bg-emerald-500 text-white py-4 rounded-xl hover:bg-emerald-600 font-bold disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
            >
              {actionLoading ? 'جاري...' : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  تأكيد إكتمال الطلب نهائياً
                </>
              )}
            </button>
          </div>
        )}

        {!isSubmitted && (
          <div className="bg-warning/10 border border-warning/30 rounded-2xl p-6 flex items-start gap-4 text-warning-800">
            <svg className="w-6 h-6 shrink-0 mt-0.5 text-warning-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <div>
              <h3 className="font-bold mb-1">الطلب لم يُقدم بعد</h3>
              <p className="text-sm">هذا الطلب لم يتم إدخاله رسمياً بعد. الرجاء العودة إلى قائمة التقديم واستخدام زر (إدخال رقم التأكيد) لربطه.</p>
            </div>
          </div>
        )}

        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/dashboard/submit')}
            className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-700 font-bold transition-colors"
          >
            <svg className="w-4 h-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            العودة إلى قائمة التقديم
          </button>
        </div>
      </div>
    </div>
  )
}
