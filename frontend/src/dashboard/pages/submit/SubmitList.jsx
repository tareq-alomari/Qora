import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '@/common/services/api'
import toast from 'react-hot-toast'

export default function SubmitList() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [submitModal, setSubmitModal] = useState(null)
  
  const [confirmationNumber, setConfirmationNumber] = useState('')
  
  const [page, setPage] = useState(1)
  const limit = 20

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/orders', { params: { status: 'approved', page, limit, sort: 'created_at', order: 'desc' } })
      setOrders(data.data || [])
      setMeta(data.meta)
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'فشل تحميل الطلبات')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const handleSubmit = async () => {
    if (!confirmationNumber.trim()) {
      toast.error('الرجاء إدخال رقم التأكيد')
      return
    }
    
    setActionLoading(true)
    try {
      await api.patch(`/orders/${submitModal.id}/status`, {
        action: 'submit_official',
        confirmation_number: confirmationNumber,
        notes: `تم الإدخال الرسمي بنجاح`,
      })
      toast.success('تم إدخال رقم التأكيد بنجاح')
      setSubmitModal(null)
      setConfirmationNumber('')
      fetchOrders()
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'فشل إدخال رقم التأكيد')
    } finally {
      setActionLoading(false)
    }
  }

  const totalPages = meta ? Math.ceil(meta.total / limit) : 1

  return (
    <div className="pb-12 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-navy-900 mb-2 tracking-tight flex items-center gap-3">
            <span>🌐</span> الإدخال الرسمي للطلبات
          </h1>
          <p className="text-navy-500 font-medium">الطلبات المعتمدة (Approved) الجاهزة للإدخال في موقع وزارة الخارجية الأمريكية.</p>
        </div>
        <div className="bg-primary-50 border border-primary-200 text-primary-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></div>
          {meta?.total || 0} طلب جاهز للإدخال
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-navy-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-navy-50/50 border-b border-navy-100">
              <tr>
                <th className="text-right px-6 py-4 text-xs font-bold text-navy-500 uppercase tracking-wider">رقم الطلب</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-navy-500 uppercase tracking-wider">العميل</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-navy-500 uppercase tracking-wider">الدولة</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-navy-500 uppercase tracking-wider">تاريخ الاعتماد</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-navy-500 uppercase tracking-wider">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-20">
                    <div className="inline-flex items-center justify-center gap-3 text-navy-400 font-medium">
                      <svg className="animate-spin w-5 h-5 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      جاري تحميل الطلبات...
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-20 text-navy-400">
                    <svg className="w-12 h-12 mx-auto mb-4 opacity-50 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold text-lg text-navy-900 block">لا توجد طلبات معلقة!</span>
                    <span className="text-sm">جميع الطلبات المعتمدة تم إدخالها بنجاح.</span>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-primary-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-navy-900 bg-navy-50 px-2.5 py-1 rounded-md font-mono border border-navy-100">
                        {order.order_number || order.id?.slice(0, 8)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-navy-900">{order.client_name || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-navy-600">{order.country || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-navy-600">
                        {order.updated_at ? new Date(order.updated_at).toLocaleDateString('ar-SA') : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/dashboard/orders/${order.id}`}
                          className="p-2.5 bg-navy-50 text-navy-600 rounded-xl hover:bg-navy-100 transition-colors border border-navy-200 tooltip-trigger"
                          title="عرض البيانات للنسخ"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </Link>
                        <button
                          onClick={() => setSubmitModal(order)}
                          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-500 text-white font-bold text-sm rounded-xl hover:bg-primary-600 transition-all shadow-md shadow-primary-500/30 hover:-translate-y-0.5"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                          إدخال رقم التأكيد
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.total > limit && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-navy-100 bg-navy-50/50">
            <span className="text-sm font-medium text-navy-500">
              إجمالي <strong className="text-navy-900">{meta.total}</strong> نتيجة
            </span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-10 h-10 bg-white border border-navy-200 rounded-xl text-navy-600 hover:bg-navy-50 disabled:opacity-50">
                <svg className="w-5 h-5 mx-auto rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <div className="px-4 h-10 bg-white border border-navy-200 rounded-xl text-sm font-bold text-navy-700 flex items-center justify-center">
                {page} / {totalPages}
              </div>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-10 h-10 bg-white border border-navy-200 rounded-xl text-navy-600 hover:bg-navy-50 disabled:opacity-50">
                <svg className="w-5 h-5 mx-auto rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Submit Modal */}
      {submitModal && (
        <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => { setSubmitModal(null); setConfirmationNumber('') }}>
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full border border-navy-100" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 bg-primary-50 text-primary-500 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            
            <h3 className="text-2xl font-black text-navy-900 mb-2">إدخال رقم التأكيد الرسمي</h3>
            <p className="text-navy-500 font-medium mb-6">
              للعميل: <strong className="text-navy-900">{submitModal.client_name || submitModal.id}</strong>
            </p>
            
            <div className="space-y-5 mb-8">
              <div>
                <label className="block text-sm font-bold text-navy-700 mb-2">رقم التأكيد (Confirmation Number) <span className="text-error">*</span></label>
                <input
                  type="text"
                  placeholder="2026XX0000000"
                  value={confirmationNumber}
                  onChange={(e) => setConfirmationNumber(e.target.value)}
                  className="w-full bg-navy-50 border border-navy-200 rounded-xl px-4 py-3 text-lg font-mono tracking-wider focus:bg-white focus:border-primary-300 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                  autoFocus
                  dir="ltr"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={handleSubmit}
                disabled={actionLoading}
                className="flex-1 bg-primary-500 text-white py-3.5 rounded-xl hover:bg-primary-600 font-bold disabled:opacity-50 transition-colors shadow-lg shadow-primary-500/30"
              >
                {actionLoading ? 'جاري الحفظ...' : 'تأكيد التسجيل الرسمي'}
              </button>
              <button
                onClick={() => { setSubmitModal(null); setConfirmationNumber('') }}
                className="flex-1 bg-navy-50 text-navy-700 py-3.5 rounded-xl hover:bg-navy-100 font-bold transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
