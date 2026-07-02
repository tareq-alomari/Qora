import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '@/common/services/api'
import toast from 'react-hot-toast'

const METHOD_LABELS = {
  kuraimi: 'كريمي',
  jeeb: 'جيب',
  one_cash: 'ون كاش',
  mobile_money: 'موبايل موني',
}

export default function PaymentVerify() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [enlargeImage, setEnlargeImage] = useState(null)

  useEffect(() => {
    api.get(`/payments/receipts`)
      .then(({ data }) => {
        const found = (data.data || []).find(p => p.id === id)
        if (found) setPayment(found)
        else toast.error('الدفعة غير موجودة')
      })
      .catch((err) => toast.error(err.response?.data?.error?.message || 'فشل تحميل معلومات الدفع'))
      .finally(() => setLoading(false))
  }, [id])

  const handleVerify = async () => {
    setActionLoading(true)
    try {
      // payment_verification -> approved
      await api.patch(`/orders/${payment.order_id}/status`, {
        action: 'approve', // Matches State Machine: approved status
        notes: 'تم تأكيد الدفع بنجاح واعتماد الطلب',
      })
      toast.success('تم تأكيد الدفع واعتماد الطلب بنجاح')
      navigate('/dashboard/payments')
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'فشل تأكيد الدفع')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('الرجاء إدخال سبب الرفض')
      return
    }
    setActionLoading(true)
    try {
      // payment_verification -> needs_correction
      await api.patch(`/orders/${payment.order_id}/status`, {
        action: 'request_correction', // Matches State Machine
        notes: `مرفوض بسبب: ${rejectReason}`,
      })
      toast.success('تم رفض الدفع وطلب التعديل من العميل')
      navigate('/dashboard/payments')
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'فشل رفض الدفع')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6 max-w-3xl mx-auto">
        <div className="h-6 bg-navy-200 rounded w-48 mb-8" />
        <div className="bg-white rounded-3xl border border-navy-100 p-8 space-y-4">
          <div className="h-6 bg-navy-200 rounded w-32 mb-6" />
          <div className="space-y-3">
            <div className="h-4 bg-navy-100 rounded w-full" />
            <div className="h-4 bg-navy-100 rounded w-5/6" />
            <div className="h-4 bg-navy-100 rounded w-4/6" />
          </div>
        </div>
        <div className="h-64 bg-white border border-navy-100 rounded-3xl" />
      </div>
    )
  }

  if (!payment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-navy-400">
        <svg className="w-16 h-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-xl font-bold text-navy-900 mb-2">الدفعة غير موجودة</h2>
        <p>لا يمكن العثور على معلومات الدفع المطلوبة.</p>
        <Link to="/dashboard/payments" className="mt-6 px-6 py-2 bg-primary-50 text-primary-600 font-bold rounded-xl hover:bg-primary-100 transition-colors">
          العودة للمدفوعات
        </Link>
      </div>
    )
  }

  return (
    <div className="pb-12 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-navy-500 mb-2">
            <Link to="/dashboard/payments" className="hover:text-primary-500 transition-colors">المدفوعات</Link>
            <span className="text-navy-300">/</span>
            <span>تأكيد الدفع</span>
          </div>
          <h1 className="text-3xl font-black text-navy-900 tracking-tight flex items-center gap-3">
            تفاصيل الحوالة
            {payment.status === 'pending' && <span className="bg-warning/20 text-warning-800 text-sm px-3 py-1 rounded-full border border-warning/30">قيد المراجعة ⏳</span>}
            {payment.status === 'verified' && <span className="bg-emerald-100 text-emerald-700 text-sm px-3 py-1 rounded-full border border-emerald-200">تم التأكيد ✅</span>}
            {payment.status === 'rejected' && <span className="bg-error/10 text-error text-sm px-3 py-1 rounded-full border border-error/20">مرفوض ❌</span>}
          </h1>
        </div>
        <div>
          <Link to={`/dashboard/orders/${payment.order_id}`} className="inline-flex items-center gap-2 bg-white border border-navy-200 text-primary-600 font-bold px-5 py-2.5 rounded-xl hover:bg-navy-50 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            عرض الطلب المرتبط
          </Link>
        </div>
      </div>

      <div className="space-y-8">
        {/* Payment Details */}
        <div className="bg-white rounded-3xl shadow-sm border border-navy-100 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500 opacity-5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="p-8">
            <h2 className="text-xl font-black text-navy-900 mb-6 flex items-center gap-2">
              <span>💳</span> معلومات الدفعة
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="bg-navy-50 rounded-2xl p-6 md:col-span-2 flex items-center justify-between border border-navy-100">
                <span className="text-navy-600 font-bold text-lg">المبلغ المحول</span>
                <span className="text-4xl font-black text-success direction-ltr tracking-tighter">${payment.amount}</span>
              </div>
              
              <InfoRow label="طريقة الدفع" value={METHOD_LABELS[payment.provider] || payment.provider} />
              <InfoRow label="رقم الحوالة / المعرف" value={payment.transfer_number || '-'} isMono />
              <InfoRow label="تاريخ التحويل" value={payment.created_at ? new Date(payment.created_at).toLocaleString('ar-SA') : '-'} direction="ltr" />
              
              {payment.notes && (
                <div className="md:col-span-2 bg-warning/10 p-4 rounded-xl border border-warning/20">
                  <span className="block text-xs font-bold text-warning-700 mb-1">ملاحظات التحويل</span>
                  <span className="font-semibold text-warning-900">{payment.notes}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Receipt Image */}
        <div className="bg-white rounded-3xl shadow-sm border border-navy-100 p-8">
          <h2 className="text-xl font-black text-navy-900 mb-6 flex items-center gap-2">
            <span>📎</span> صورة الإشعار (السند)
          </h2>
          
          {payment.receipt_image_path ? (
            <div className="relative group rounded-2xl overflow-hidden border border-navy-200 cursor-pointer bg-navy-50 flex items-center justify-center max-h-[600px]" onClick={() => setEnlargeImage(`/uploads/${payment.receipt_image_path}`)}>
              <img
                src={`/uploads/${payment.receipt_image_path}`}
                alt="إشعار الدفع"
                className="max-w-full max-h-[600px] object-contain"
              />
              <div className="absolute inset-0 bg-navy-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                <span className="text-white font-bold flex items-center gap-2 bg-black/60 px-6 py-3 rounded-xl border border-white/20">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                  عرض بالحجم الكامل
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-navy-50 rounded-2xl h-64 flex flex-col items-center justify-center text-navy-400 border-2 border-dashed border-navy-200">
              <svg className="w-12 h-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <span className="font-semibold text-lg">لم يتم إرفاق صورة إشعار</span>
            </div>
          )}
        </div>

        {/* Actions Section */}
        {payment.status === 'pending' && (
          <div className="bg-white rounded-3xl shadow-lg border border-primary-100 p-8 sticky bottom-6 z-10 animate-fade-in-up">
            <h2 className="text-xl font-black text-navy-900 mb-6 flex items-center gap-2">
              <span>⚖️</span> قرار التدقيق
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Approve */}
              <div className="space-y-4 border-b md:border-b-0 md:border-l border-navy-100 pb-6 md:pb-0 md:pl-6">
                <p className="text-sm font-semibold text-navy-500 mb-4">في حال كان الإشعار سليماً والمبلغ مطابقاً، قم بالتأكيد ليعتمد الطلب فوراً.</p>
                <button
                  onClick={handleVerify}
                  disabled={actionLoading}
                  className="w-full bg-emerald-500 text-white py-4 rounded-xl hover:bg-emerald-600 font-bold disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 text-lg hover:-translate-y-1"
                >
                  {actionLoading ? 'جاري...' : (
                    <>
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      اعتماد الطلب (تأكيد الدفع)
                    </>
                  )}
                </button>
              </div>
              
              {/* Reject */}
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-navy-500">في حال وجود مشكلة، اذكر السبب ليعود الطلب للعميل للتعديل.</label>
                <textarea
                  placeholder="مثال: الإشعار غير واضح، المبلغ ناقص..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full bg-navy-50 border border-navy-200 rounded-xl p-3 text-sm focus:bg-white focus:border-error focus:ring-4 focus:ring-error/10 outline-none transition-all resize-none"
                  rows={2}
                />
                <button
                  onClick={handleReject}
                  disabled={actionLoading || !rejectReason.trim()}
                  className="w-full bg-error text-white py-3 rounded-xl hover:bg-red-600 font-bold disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                  رفض الدفع وطلب التعديل
                </button>
              </div>
            </div>
          </div>
        )}

        {payment.status === 'verified' && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex items-center gap-4 text-emerald-700">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm text-emerald-500">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            <div>
              <h3 className="font-bold text-lg">تم تأكيد هذه الحوالة مسبقاً</h3>
              <p className="text-emerald-600/80 font-medium text-sm">تم اعتماد الدفع وتحديث حالة الطلب المرتبط إلى (مقبول).</p>
            </div>
          </div>
        )}

        {payment.status === 'rejected' && (
          <div className="bg-error/10 border border-error/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-error">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm text-error">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            </div>
            <div className="text-center sm:text-right">
              <h3 className="font-bold text-lg mb-1">تم رفض هذه الحوالة</h3>
              {payment.notes && (
                <p className="bg-white/50 text-error-800 font-medium px-4 py-2 rounded-lg mt-2 inline-block">
                  <span className="font-bold">السبب:</span> {payment.notes}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {enlargeImage && (
        <div className="fixed inset-0 bg-navy-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 lg:p-12 animate-fade-in" onClick={() => setEnlargeImage(null)}>
          <button onClick={() => setEnlargeImage(null)} className="absolute top-6 right-6 text-white/50 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <img
            src={enlargeImage}
            alt="إشعار الدفع مكبر"
            className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain bg-white/5"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}

function InfoRow({ label, value, isMono = false, direction = 'rtl' }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-bold text-navy-400">{label}</span>
      <span className={`font-semibold text-navy-900 bg-white px-4 py-3 rounded-xl border border-navy-100 ${isMono ? 'font-mono tracking-wider' : ''} ${direction === 'ltr' ? 'direction-ltr text-right' : ''}`}>
        {value || <span className="text-navy-300">-</span>}
      </span>
    </div>
  )
}
