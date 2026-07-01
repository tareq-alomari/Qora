import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@/common/services/api'
import toast from 'react-hot-toast'
import ExportButton from '@/common/components/ExportButton'
import { exportToCSV } from '@/common/utils/export'

const statusColors = {
  draft: 'bg-navy-50 text-navy-600 border-navy-200',
  data_entry_complete: 'bg-primary-50 text-primary-600 border-primary-200',
  photo_pending: 'bg-warning/10 text-warning-700 border-warning/20',
  photo_rejected: 'bg-error/10 text-error border-error/20',
  photo_accepted: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  payment_pending: 'bg-gold-50 text-gold-600 border-gold-200',
  payment_verification: 'bg-purple-50 text-purple-600 border-purple-200',
  needs_correction: 'bg-orange-50 text-orange-600 border-orange-200',
  approved: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  submitted: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  completed: 'bg-success/10 text-success-700 border-success/20',
  cancelled: 'bg-error/10 text-error border-error/20',
}

const statusLabels = {
  draft: 'مسودة', data_entry_complete: 'بيانات مكتملة', photo_pending: 'بانتظار الصورة',
  photo_rejected: 'الصورة مرفوضة', photo_accepted: 'الصورة مقبولة',
  payment_pending: 'بانتظار الدفع', payment_verification: 'تدقيق الدفع',
  needs_correction: 'يحتاج تعديل', approved: 'مقبول', submitted: 'مقدم',
  completed: 'مكتمل', cancelled: 'ملغي',
}

const statusOptions = [
  { value: '', label: 'كل الحالات' },
  ...Object.entries(statusLabels).map(([value, label]) => ({ value, label })),
]

export default function OrdersList() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const limit = 20

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit, sort: 'created_at', order: 'desc' }
      if (search) params.search = search
      if (status) params.status = status
      const { data } = await api.get('/orders', { params })
      setOrders(data.data || [])
      setMeta(data.meta)
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'فشل تحميل الطلبات')
    } finally {
      setLoading(false)
    }
  }, [page, search, status])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const handleSearch = (e) => {
    setSearch(e.target.value)
    setPage(1)
  }

  const handleExport = async (format) => {
    try {
      const params = { sort: 'created_at', order: 'desc' }
      if (status) params.status = status
      if (search) params.search = search
      const { data } = await api.get('/admin/export/orders', { params })
      const rows = (data.data || data || []).map(o => ({
        order_number: o.order_number || o.id?.slice(0, 8),
        client_name: o.client_name || (o.first_name && o.last_name ? `${o.first_name} ${o.last_name}` : '-'),
        phone: o.client_phone || o.phone || '-',
        status: statusLabels[o.status] || o.status,
        amount: o.payment_amount || o.amount || '',
        created_at: o.created_at ? new Date(o.created_at).toLocaleDateString('ar-SA') : '-',
      }))
      const filename = `الطلبات-${new Date().toISOString().slice(0, 10)}`
      exportToCSV(rows, filename, [
        { key: 'order_number', label: 'رقم الطلب' },
        { key: 'client_name', label: 'العميل' },
        { key: 'phone', label: 'الهاتف' },
        { key: 'status', label: 'الحالة' },
        { key: 'amount', label: 'المبلغ' },
        { key: 'created_at', label: 'تاريخ الإنشاء' },
      ])
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'فشل تصدير البيانات')
    }
  }

  const totalPages = meta ? Math.ceil(meta.total / limit) : 1

  return (
    <div className="pb-12 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-navy-900 mb-2 tracking-tight flex items-center gap-3">
            <span>📋</span> سجل الطلبات
          </h1>
          <p className="text-navy-500 font-medium">إدارة وتدقيق جميع طلبات اللوتري المقدمة من العملاء.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-navy-100 overflow-hidden">
        {/* Filters & Actions */}
        <div className="p-6 border-b border-navy-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-navy-50/30">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-1">
            <div className="relative w-full sm:max-w-md">
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="ابحث برقم الطلب، اسم العميل، أو الهاتف..."
                value={search}
                onChange={handleSearch}
                className="w-full bg-white border border-navy-200 rounded-xl pr-12 pl-4 py-3 text-sm font-medium focus:border-primary-300 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
              />
            </div>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1) }}
              className="w-full sm:w-auto bg-white border border-navy-200 rounded-xl px-4 py-3 text-sm font-medium focus:border-primary-300 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all cursor-pointer"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <ExportButton onExport={handleExport} disabled={!orders.length && !meta} />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-navy-50/50 border-b border-navy-100">
              <tr>
                <th className="text-right px-6 py-4 text-xs font-bold text-navy-500 uppercase tracking-wider">رقم الطلب</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-navy-500 uppercase tracking-wider">العميل</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-navy-500 uppercase tracking-wider">الهاتف</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-navy-500 uppercase tracking-wider">الحالة</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-navy-500 uppercase tracking-wider">تاريخ الإنشاء</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-navy-500 uppercase tracking-wider">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-20">
                    <div className="inline-flex items-center justify-center gap-3 text-navy-400 font-medium">
                      <svg className="animate-spin w-5 h-5 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      جاري تحميل الطلبات...
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-20 text-navy-400">
                    <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    <span className="font-semibold text-lg">{search || status ? 'لا توجد نتائج مطابقة لبحثك' : 'لا توجد طلبات بعد'}</span>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-primary-50/30 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/dashboard/orders/${order.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-navy-900 bg-navy-50 px-2.5 py-1 rounded-md font-mono border border-navy-100 group-hover:bg-white group-hover:border-primary-200 transition-colors">
                          {order.order_number || order.id?.slice(0, 8)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-navy-900">{order.client_name || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-navy-600 direction-ltr text-right">{order.phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${statusColors[order.status] || 'bg-navy-50 text-navy-600 border-navy-200'}`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-navy-600">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString('ar-SA') : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/orders/${order.id}`) }}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white border border-navy-200 text-primary-600 font-bold text-sm rounded-xl hover:bg-primary-50 hover:border-primary-200 transition-all shadow-sm group-hover:shadow-md"
                      >
                        عرض
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
