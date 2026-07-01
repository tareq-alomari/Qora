import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@/common/services/api'
import toast from 'react-hot-toast'

const STATUS_LABELS = {
  pending: 'بانتظار التأكيد',
  verified: 'تم التأكيد',
  rejected: 'مرفوض',
}

const STATUS_COLORS = {
  pending: 'bg-warning/10 text-warning-700 border-warning/20',
  verified: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  rejected: 'bg-error/10 text-error border-error/20',
}

const METHOD_LABELS = {
  credit: 'بطاقة ائتمان',
  bank: 'تحويل بنكي',
  mobile_money: 'موبايل موني',
  cash: 'نقدي',
  other: 'أخرى',
}

export default function PaymentsList() {
  const navigate = useNavigate()
  const [payments, setPayments] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const limit = 20

  const fetchPayments = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit }
      if (status) params.status = status
      const { data } = await api.get('/payments/receipts', { params })
      setPayments(data.data || [])
      setMeta(data.meta)
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'فشل تحميل المدفوعات')
    } finally {
      setLoading(false)
    }
  }, [page, status])

  useEffect(() => { fetchPayments() }, [fetchPayments])

  const totalPages = meta ? Math.ceil(meta.total / limit) : 1

  return (
    <div className="pb-12 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-navy-900 mb-2 tracking-tight flex items-center gap-3">
            <span>💳</span> سجل المدفوعات
          </h1>
          <p className="text-navy-500 font-medium">مراجعة وتأكيد الحوالات المالية وإشعارات الدفع.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-navy-100 overflow-hidden">
        {/* Filters */}
        <div className="p-6 border-b border-navy-100 flex justify-end bg-navy-50/30">
          <div className="w-full sm:w-auto relative">
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1) }}
              className="w-full sm:w-64 bg-white border border-navy-200 rounded-xl px-4 py-3 text-sm font-medium focus:border-primary-300 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all cursor-pointer appearance-none"
            >
              <option value="">جميع الحالات</option>
              <option value="pending">بانتظار التأكيد ⏳</option>
              <option value="verified">تم التأكيد ✅</option>
              <option value="rejected">مرفوض ❌</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-4 text-navy-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-navy-50/50 border-b border-navy-100">
              <tr>
                <th className="text-right px-6 py-4 text-xs font-bold text-navy-500 uppercase tracking-wider">المبلغ</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-navy-500 uppercase tracking-wider">طريقة الدفع</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-navy-500 uppercase tracking-wider">المزود</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-navy-500 uppercase tracking-wider">رقم الحوالة / المعرف</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-navy-500 uppercase tracking-wider">الحالة</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-navy-500 uppercase tracking-wider">التاريخ</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-navy-500 uppercase tracking-wider">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-20">
                    <div className="inline-flex items-center justify-center gap-3 text-navy-400 font-medium">
                      <svg className="animate-spin w-5 h-5 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      جاري تحميل المدفوعات...
                    </div>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-20 text-navy-400">
                    <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <span className="font-semibold text-lg">{status ? 'لا توجد مدفوعات بهذه الحالة' : 'لا توجد مدفوعات مسجلة بعد'}</span>
                  </td>
                </tr>
              ) : (
                payments.map((pm) => (
                  <tr key={pm.id} className="hover:bg-primary-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-lg font-black text-navy-900 direction-ltr text-right">${pm.amount}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-navy-50 flex items-center justify-center text-navy-500 border border-navy-100">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </div>
                        <span className="text-sm font-bold text-navy-900">{METHOD_LABELS[pm.method] || pm.method}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-navy-700">{pm.provider || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-navy-900 bg-navy-50 px-2.5 py-1 rounded-md font-mono border border-navy-100 inline-block">
                        {pm.transfer_number || 'غير متوفر'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border ${STATUS_COLORS[pm.status] || 'bg-navy-50 text-navy-600 border-navy-200'}`}>
                        {STATUS_LABELS[pm.status] || pm.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-navy-600">
                        {pm.created_at ? new Date(pm.created_at).toLocaleDateString('ar-SA') : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/dashboard/payments/${pm.id}`)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white border border-navy-200 text-primary-600 font-bold text-sm rounded-xl hover:bg-primary-50 hover:border-primary-200 transition-all shadow-sm"
                      >
                        تفاصيل
                        <svg className="w-4 h-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </button>
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
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex items-center justify-center w-10 h-10 bg-white border border-navy-200 rounded-xl text-navy-600 hover:bg-navy-50 hover:text-primary-600 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-navy-600 transition-all"
              >
                <svg className="w-5 h-5 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <div className="flex items-center justify-center px-4 h-10 bg-white border border-navy-200 rounded-xl text-sm font-bold text-navy-700">
                {page} / {totalPages}
              </div>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="inline-flex items-center justify-center w-10 h-10 bg-white border border-navy-200 rounded-xl text-navy-600 hover:bg-navy-50 hover:text-primary-600 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-navy-600 transition-all"
              >
                <svg className="w-5 h-5 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
