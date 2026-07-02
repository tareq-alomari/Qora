import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '@/common/services/api'
import toast from 'react-hot-toast'

const STATUS_LABELS = {
  draft: 'مسودة', data_entry_complete: 'بيانات مكتملة', photo_pending: 'بانتظار الصورة (AI)',
  photo_rejected: 'الصورة مرفوضة', photo_accepted: 'الصورة مقبولة',
  payment_pending: 'بانتظار الدفع (من العميل)', payment_verification: 'تدقيق الدفع',
  needs_correction: 'يحتاج تعديل', approved: 'مقبول (جاهز للإدخال)', submitted: 'مقدم رسمياً',
  completed: 'مكتمل', cancelled: 'ملغي',
}

const ACTION_BUTTONS = {
  photo_pending: [
    { action: 'approve_photo', label: '✅ قبول الصورة', variant: 'success' },
    { action: 'reject_photo', label: '❌ رفض الصورة', variant: 'error' },
  ],
  payment_verification: [
    { action: 'approve', label: '✅ اعتماد الدفع والطلب', variant: 'success' },
    { action: 'request_correction', label: '📝 طلب تعديل الدفع', variant: 'warning' },
  ],
  approved: [
    { action: 'submit_official', label: '🌐 إدخال رقم التأكيد الرسمي', variant: 'primary', requiresConfirmation: true },
  ],
  submitted: [
    { action: 'mark_completed', label: '✅ تأكيد الإكتمال النهائي', variant: 'success' },
  ],
  needs_correction: [
    { action: 'request_correction', label: '📝 طلب تعديل مرة أخرى', variant: 'warning' },
  ],
}

const ALWAYS_ACTIONS = [
  { action: 'cancel', label: '❌ إلغاء الطلب نهائياً', variant: 'error' },
]

export default function OrderReview() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [notes, setNotes] = useState('')
  const [confirmationNumber, setConfirmationNumber] = useState('')
  const [showConfirm, setShowConfirm] = useState(null)
  const [enlargeImage, setEnlargeImage] = useState(null)

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(({ data }) => setOrder(data.data))
      .catch((err) => toast.error(err.response?.data?.error?.message || 'فشل تحميل الطلب'))
      .finally(() => setLoading(false))
  }, [id])

  const handleAction = async (action) => {
    if (action === 'submit_official' && !confirmationNumber) {
      toast.error('الرجاء إدخال رقم التأكيد')
      return
    }

    setActionLoading(true)
    try {
      const dataPayload = { action, notes: notes || undefined }
      if (confirmationNumber) dataPayload.confirmation_number = confirmationNumber

      const { data } = await api.patch(`/orders/${id}/status`, dataPayload)
      toast.success('تم تحديث الحالة بنجاح')
      setNotes('')
      setConfirmationNumber('')
      const refreshed = await api.get(`/orders/${id}`)
      setOrder(refreshed.data.data)
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'فشل تحديث الحالة')
    } finally {
      setActionLoading(false)
      setShowConfirm(null)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-6 bg-navy-200 rounded w-48 mb-8" />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-6">
            <div className="h-64 bg-white border border-navy-100 rounded-3xl" />
            <div className="h-48 bg-white border border-navy-100 rounded-3xl" />
          </div>
          <div className="space-y-6">
            <div className="h-[400px] bg-white border border-navy-100 rounded-3xl" />
          </div>
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
        <Link to="/dashboard/orders" className="mt-6 px-6 py-2 bg-primary-50 text-primary-600 font-bold rounded-xl hover:bg-primary-100 transition-colors">العودة للطلبات</Link>
      </div>
    )
  }

  const pd = order.personal_data || {}
  const ci = order.contact_info || {}
  const edu = order.education_status || {}
  const payment = order.payment || {}
  const fullName = [pd.first_name, pd.middle_name, pd.last_name].filter(Boolean).join(' ')

  return (
    <div className="pb-12 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-navy-500 mb-2">
            <Link to="/dashboard/orders" className="hover:text-primary-500 transition-colors">الطلبات</Link>
            <span className="text-navy-300">/</span>
            <span>مراجعة الطلب</span>
          </div>
          <h1 className="text-3xl font-black text-navy-900 tracking-tight flex items-center gap-3">
            طلب #{order.order_number || id?.slice(0, 8)}
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold border shadow-sm ${statusColor(order.status)}`}>
              {STATUS_LABELS[order.status] || order.status}
            </span>
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <InfoCard title="البيانات الشخصية" icon="👤">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
              <InfoRow label="الاسم الكامل" value={fullName || '-'} />
              <InfoRow label="الجنس" value={pd.gender === 'male' ? 'ذكر' : pd.gender === 'female' ? 'أنثى' : pd.gender || '-'} />
              <InfoRow label="تاريخ الميلاد" value={pd.birth_date ? new Date(pd.birth_date).toLocaleDateString('ar-SA') : '-'} />
              <InfoRow label="مكان الولادة" value={pd.birth_city || '-'} />
              <InfoRow label="بلد الميلاد" value={pd.birth_country || '-'} />
              <InfoRow label="بلد الأهلية" value={pd.country_of_eligibility || '-'} />
            </div>
          </InfoCard>

          <InfoCard title="معلومات الاتصال" icon="📞">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
              <InfoRow label="الهاتف" value={ci.phone || '-'} direction="ltr" />
              <InfoRow label="البريد الإلكتروني" value={ci.email || '-'} />
              <InfoRow label="هاتف بديل" value={ci.alt_phone || '-'} />
              <InfoRow label="العنوان" value={[ci.street, ci.city, ci.district].filter(Boolean).join(', ') || '-'} className="md:col-span-2" />
            </div>
          </InfoCard>

          <InfoCard title="التعليم والحالة الاجتماعية" icon="🎓">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
              <InfoRow label="المستوى التعليمي" value={edu.education_level || '-'} />
              <InfoRow label="الحالة الاجتماعية" value={edu.marital_status || '-'} />
              <InfoRow label="رقم جواز السفر" value={edu.passport_number || '-'} />
              <InfoRow label="تاريخ انتهاء الجواز" value={edu.passport_expiry ? new Date(edu.passport_expiry).toLocaleDateString('ar-SA') : '-'} />
            </div>
          </InfoCard>

          {order.spouse_data && (order.spouse_data.first_name || order.spouse_data.last_name) && (
            <InfoCard title="معلومات الزوج/ة" icon="👫" highlight>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                <InfoRow label="الاسم" value={[order.spouse_data.first_name, order.spouse_data.last_name].filter(Boolean).join(' ')} />
                <InfoRow label="تاريخ الميلاد" value={order.spouse_data.birth_date ? new Date(order.spouse_data.birth_date).toLocaleDateString('ar-SA') : '-'} />
                <InfoRow label="الجنس" value={order.spouse_data.gender === 'male' ? 'ذكر' : order.spouse_data.gender === 'female' ? 'أنثى' : '-'} />
              </div>
            </InfoCard>
          )}

          {order.children_data?.length > 0 && (
            <InfoCard title="الأطفال" icon="👶" highlight>
              <div className="space-y-6">
                {order.children_data.map((child, idx) => (
                  <div key={idx} className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${idx > 0 ? 'border-t border-navy-100 pt-6' : ''}`}>
                    <div className="md:col-span-3 font-bold text-navy-800 text-lg mb-2">الطفل {idx + 1}</div>
                    <InfoRow label="الاسم الكامل" value={[child.first_name, child.last_name].filter(Boolean).join(' ') || '-'} />
                    <InfoRow label="تاريخ الميلاد" value={child.birth_date ? new Date(child.birth_date).toLocaleDateString('ar-SA') : '-'} />
                    <InfoRow label="الجنس" value={child.gender === 'male' ? 'ذكر' : child.gender === 'female' ? 'أنثى' : '-'} />
                  </div>
                ))}
              </div>
            </InfoCard>
          )}

          {order.audit_log?.length > 0 && (
            <InfoCard title="سجل الحالة (Audit Log)" icon="📜">
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-navy-200 before:to-transparent">
                {order.audit_log.map((log, idx) => (
                  <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-primary-100 text-primary-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-2xl border border-navy-100 shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-navy-900">{STATUS_LABELS[log.to_status] || log.to_status}</h4>
                      </div>
                      <p className="text-xs font-semibold text-navy-400 mb-2">
                        {log.created_at ? new Date(log.created_at).toLocaleString('ar-SA') : ''}
                        {log.user?.full_name ? ` • بواسطة ${log.user.full_name}` : ' • آلي (System/AI)'}
                      </p>
                      {log.notes && <div className="bg-navy-50 p-3 rounded-lg text-sm text-navy-700 font-medium">{log.notes}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </InfoCard>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-lg shadow-navy-100/50 border border-primary-100 p-6 lg:p-8 sticky top-24">
            <h2 className="text-xl font-black text-navy-900 mb-6 flex items-center gap-2">
              <span>⚙️</span> لوحة الإجراءات
            </h2>

            {(ACTION_BUTTONS[order.status] || []).length > 0 ? (
              ACTION_BUTTONS[order.status].map((btn) => (
                <div key={btn.action} className="mb-4">
                  <button
                    onClick={() => setShowConfirm(btn)}
                    disabled={actionLoading}
                    className={`w-full py-4 rounded-xl font-black mb-3 text-sm transition-all shadow-md hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0 ${
                      btn.variant === 'primary' ? 'bg-primary-500 text-white shadow-primary-500/30 hover:bg-primary-600' :
                      btn.variant === 'success' ? 'bg-emerald-500 text-white shadow-emerald-500/30 hover:bg-emerald-600' :
                      btn.variant === 'error' ? 'bg-error text-white shadow-error/30 hover:bg-red-600' :
                      'bg-gold-500 text-white shadow-gold-500/30 hover:bg-gold-600'
                    }`}
                  >
                    {btn.label}
                  </button>
                </div>
              ))
            ) : (
              <div className="bg-navy-50 p-4 rounded-xl border border-navy-100 text-center mb-6">
                <svg className="w-8 h-8 text-navy-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-sm font-bold text-navy-600">لا توجد إجراءات للموظف في هذه المرحلة.</p>
                <p className="text-xs text-navy-400 mt-1">الطلب بانتظار العميل أو النظام الآلي.</p>
              </div>
            )}

            {(order.status !== 'completed' && order.status !== 'cancelled') && (
              <>
                <hr className="my-6 border-navy-100" />
                <div className="space-y-3">
                  {ALWAYS_ACTIONS.map((btn) => (
                    <button
                      key={btn.action}
                      onClick={() => setShowConfirm(btn)}
                      disabled={actionLoading}
                      className={`w-full py-3 rounded-xl font-bold text-sm transition-all border disabled:opacity-50 ${
                        btn.variant === 'error' 
                          ? 'bg-error/5 text-error border-error/20 hover:bg-error hover:text-white' 
                          : 'bg-gold-50 text-gold-600 border-gold-200 hover:bg-gold-500 hover:text-white'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </>
            )}

            <div className="mt-6">
              <label className="block text-sm font-bold text-navy-700 mb-2">ملاحظات الإجراء (اختياري)</label>
              <textarea
                placeholder="اكتب سبب الرفض أو التعديل هنا..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-navy-50 border border-navy-200 rounded-xl p-4 text-sm focus:bg-white focus:border-primary-300 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all resize-none"
                rows={4}
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-navy-100 overflow-hidden">
            <div className="p-6 border-b border-navy-100">
              <h2 className="text-lg font-black text-navy-900 flex items-center gap-2">
                <span>📸</span> مراجعة الصورة
              </h2>
            </div>
            
            <div className="p-6 bg-navy-50/50">
              {order.photo_url ? (
                <div className="relative group cursor-pointer" onClick={() => setEnlargeImage(order.photo_url)}>
                  <img
                    src={order.photo_url}
                    alt="صورة شخصية"
                    className="w-full rounded-2xl shadow-sm border border-navy-200 object-cover bg-white"
                    style={{ aspectRatio: '1/1' }}
                  />
                  <div className="absolute inset-0 bg-navy-900/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <span className="text-white font-bold flex items-center gap-2 bg-black/50 px-4 py-2 rounded-full">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                      تكبير الصورة
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border-2 border-dashed border-navy-200 h-64 flex flex-col items-center justify-center text-navy-400">
                  <svg className="w-12 h-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <span className="font-semibold">لم يتم رفع صورة</span>
                </div>
              )}
            </div>

            {order.photo_validation && (
              <div className="p-6 border-t border-navy-100">
                <h3 className="text-sm font-bold text-navy-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  نتيجة الذكاء الاصطناعي (AI)
                </h3>
                <div className="space-y-3">
                  <ValidationResult label="تمركز الوجه" value={order.photo_validation.checks?.face_center} />
                  <ValidationResult label="الخلفية البيضاء" value={order.photo_validation.checks?.white_background} />
                  <ValidationResult label="توزيع الإضاءة" value={order.photo_validation.checks?.lighting} />
                  <ValidationResult label="وضوح الصورة" value={order.photo_validation.checks?.clarity} />
                  
                  {order.photo_validation.confidence && (
                    <div className="mt-4 pt-4 border-t border-navy-100">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-navy-700">مستوى الثقة</span>
                        <span className={`font-black text-lg ${order.photo_validation.confidence >= 0.8 ? 'text-emerald-500' : order.photo_validation.confidence >= 0.6 ? 'text-gold-500' : 'text-error'}`}>
                          {Math.round(order.photo_validation.confidence * 100)}%
                        </span>
                      </div>
                      <div className="h-2 bg-navy-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${order.photo_validation.confidence >= 0.8 ? 'bg-emerald-500' : order.photo_validation.confidence >= 0.6 ? 'bg-gold-500' : 'bg-error'}`}
                          style={{ width: `${Math.round(order.photo_validation.confidence * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-navy-100 p-6 lg:p-8">
            <h2 className="text-lg font-black text-navy-900 mb-6 flex items-center gap-2">
              <span>💳</span> بيانات الدفع
            </h2>
            {payment.id ? (
              <div className="space-y-4">
                <div className="bg-navy-50 rounded-2xl p-4 flex items-center justify-between border border-navy-100">
                  <span className="text-navy-500 font-semibold text-sm">المبلغ المحول</span>
                  <span className="text-xl font-black text-success direction-ltr">{payment.amount || '0'} YR</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs font-bold text-navy-400 mb-1">طريقة الدفع</span>
                    <span className="font-semibold text-navy-900">{payment.provider || payment.payment_method || '-'}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-navy-400 mb-1">الحالة</span>
                    <span className={`font-semibold ${payment.status === 'verified' ? 'text-emerald-600' : payment.status === 'rejected' ? 'text-error' : 'text-gold-600'}`}>
                      {payment.status === 'verified' ? 'تم التأكيد' : payment.status === 'rejected' ? 'مرفوض' : 'بانتظار التأكيد'}
                    </span>
                  </div>
                </div>

                {payment.receipt_image_path && (
                  <button
                    onClick={() => setEnlargeImage(`/uploads/${payment.receipt_image_path}`)}
                    className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-white border border-primary-200 text-primary-600 font-bold rounded-xl hover:bg-primary-50 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                    عرض إشعار الحوالة
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-navy-400 bg-navy-50/50 rounded-2xl border border-dashed border-navy-200">
                <svg className="w-10 h-10 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                <span className="font-semibold text-sm">بانتظار العميل لرفع الإشعار</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowConfirm(null)}>
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-navy-100" onClick={(e) => e.stopPropagation()}>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
              showConfirm.variant === 'primary' ? 'bg-primary-50 text-primary-500' :
              showConfirm.variant === 'success' ? 'bg-emerald-50 text-emerald-500' :
              showConfirm.variant === 'error' ? 'bg-error/10 text-error' :
              'bg-gold-50 text-gold-500'
            }`}>
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-2xl font-black text-navy-900 mb-2">تأكيد الإجراء</h3>
            <p className="text-navy-500 font-medium mb-6 leading-relaxed">
              تأكيد الانتقال للحالة: <strong className="text-navy-900 bg-navy-50 px-2 py-1 rounded">{showConfirm.label}</strong>
            </p>
            
            {showConfirm.requiresConfirmation && (
              <div className="mb-6 space-y-4 border-t border-navy-100 pt-6">
                <div>
                  <label className="block text-sm font-bold text-navy-700 mb-2">رقم التأكيد (Confirmation Number) <span className="text-error">*</span></label>
                  <input
                    type="text"
                    placeholder="2026XX0000000"
                    value={confirmationNumber}
                    onChange={(e) => setConfirmationNumber(e.target.value)}
                    className="w-full bg-navy-50 border border-navy-200 rounded-xl px-4 py-3 font-mono tracking-wider focus:bg-white focus:border-primary-300 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                    autoFocus
                  />
                </div>
              </div>
            )}

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => handleAction(showConfirm.action)}
                disabled={actionLoading}
                className={`flex-1 text-white py-3.5 rounded-xl font-bold disabled:opacity-50 transition-all shadow-lg hover:-translate-y-0.5 ${
                  showConfirm.variant === 'primary' ? 'bg-primary-500 hover:bg-primary-600 shadow-primary-500/30' :
                  showConfirm.variant === 'success' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30' :
                  showConfirm.variant === 'error' ? 'bg-error hover:bg-red-600 shadow-error/30' :
                  'bg-gold-500 hover:bg-gold-600 shadow-gold-500/30'
                }`}
              >
                {actionLoading ? 'جاري التنفيذ...' : 'تأكيد'}
              </button>
              <button
                onClick={() => setShowConfirm(null)}
                className="flex-1 bg-navy-50 text-navy-700 py-3.5 rounded-xl hover:bg-navy-100 font-bold transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {enlargeImage && (
        <div className="fixed inset-0 bg-navy-900/90 backdrop-blur-md z-50 flex items-center justify-center p-4 lg:p-12 animate-fade-in" onClick={() => setEnlargeImage(null)}>
          <button onClick={() => setEnlargeImage(null)} className="absolute top-6 right-6 text-white/50 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <img src={enlargeImage} alt="صورة مكبرة" className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain bg-white/5" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}

function InfoCard({ title, icon, children, highlight }) {
  return (
    <div className={`rounded-3xl shadow-sm border p-6 lg:p-8 ${highlight ? 'bg-primary-50/30 border-primary-100' : 'bg-white border-navy-100'}`}>
      <h2 className="text-xl font-black text-navy-900 mb-6 flex items-center gap-2"><span>{icon}</span> {title}</h2>
      {children}
    </div>
  )
}

function InfoRow({ label, value, className = '', direction = 'rtl' }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <span className="text-sm font-bold text-navy-400">{label}</span>
      <span className={`font-semibold text-navy-900 bg-navy-50/50 px-3 py-2 rounded-lg border border-navy-100/50 ${direction === 'ltr' ? 'direction-ltr text-right' : ''}`}>
        {value || <span className="text-navy-300">-</span>}
      </span>
    </div>
  )
}

function ValidationResult({ label, value }) {
  if (value === undefined || value === null) return null
  const isGood = value >= 70
  return (
    <div className="flex items-center justify-between py-2 border-b border-navy-50 last:border-0">
      <span className="font-semibold text-navy-700">{label}</span>
      <div className="flex items-center gap-3">
        <span className={`font-bold ${isGood ? 'text-emerald-500' : 'text-error'}`}>{value}%</span>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-sm ${isGood ? 'bg-emerald-100 text-emerald-600' : 'bg-error/10 text-error'}`}>
          {isGood ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>}
        </div>
      </div>
    </div>
  )
}

function statusColor(status) {
  const map = {
    draft: 'bg-navy-100 text-navy-700 border-navy-200',
    data_entry_complete: 'bg-primary-100 text-primary-700 border-primary-200',
    photo_pending: 'bg-warning/20 text-warning-800 border-warning/30',
    photo_rejected: 'bg-error/10 text-error border-error/20',
    photo_accepted: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    payment_pending: 'bg-gold-100 text-gold-700 border-gold-200',
    payment_verification: 'bg-purple-100 text-purple-700 border-purple-200',
    needs_correction: 'bg-orange-100 text-orange-700 border-orange-200',
    approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    submitted: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    completed: 'bg-success/20 text-success-700 border-success/30',
    cancelled: 'bg-error/10 text-error border-error/20',
  }
  return map[status] || 'bg-navy-100 text-navy-700 border-navy-200'
}
