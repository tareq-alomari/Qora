import { useState, useEffect, useCallback } from 'react'
import api from '@/common/services/api'
import toast from 'react-hot-toast'

const statusLabels = {
  draft: 'مسودة', data_entry_complete: 'بيانات مكتملة', photo_pending: 'بانتظار الصورة',
  photo_rejected: 'الصورة مرفوضة', photo_accepted: 'الصورة مقبولة',
  payment_pending: 'بانتظار الدفع', payment_verification: 'تدقيق الدفع',
  needs_correction: 'يحتاج تعديل', approved: 'مقبول', submitted: 'مقدم',
  completed: 'مكتمل', cancelled: 'ملغي',
}

const resultLabels = {
  winner: 'فائز',
  not_winner: 'غير فائز',
  pending_check: 'بانتظار الفحص',
  error: 'خطأ في الفحص',
}

const resultColors = {
  winner: 'bg-emerald-100 text-emerald-700',
  not_winner: 'bg-gray-100 text-gray-700',
  pending_check: 'bg-yellow-100 text-yellow-700',
  error: 'bg-red-100 text-red-700',
}

export default function CheckResultsList() {
  const [orders, setOrders] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [checkingId, setCheckingId] = useState(null)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const limit = 20

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit, sort: 'created_at', order: 'desc' }
      if (statusFilter) params.status = statusFilter
      else params.status_in = 'submitted,completed'
      const { data } = await api.get('/orders', { params })
      setOrders(data.data || [])
      setMeta(data.meta)
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'فشل تحميل الطلبات')
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const handleCheck = async (order) => {
    setCheckingId(order.id)
    try {
      // In production, this would call the headless browser service
      const { data } = await api.post(`/orders/${order.id}/check-result`)
      toast.success('تم فحص النتيجة')
      fetchOrders()
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'فشل فحص النتيجة')
    } finally {
      setCheckingId(null)
    }
  }

  const totalPages = meta ? Math.ceil(meta.total / limit) : 1

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">🔍 فحص النتائج</h1>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value="">جميع المقدمة</option>
          <option value="submitted">مقدم</option>
          <option value="completed">مكتمل</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">#</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">العميل</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">رقم التأكيد</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">الحالة</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">النتيجة</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">آخر فحص</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">جاري التحميل...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">لا توجد طلبات مقدمة</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono">{order.order_number || order.id?.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-sm font-medium">{order.client_name || '-'}</td>
                    <td className="px-4 py-3 text-sm font-mono" dir="ltr">
                      {order.confirmation_number || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {order.result ? (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${resultColors[order.result] || 'bg-gray-100 text-gray-700'}`}>
                          {resultLabels[order.result] || order.result}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {order.checked_at ? new Date(order.checked_at).toLocaleDateString('ar-SA') : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleCheck(order)}
                        disabled={checkingId === order.id}
                        className="bg-primary-500 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-primary-600 disabled:opacity-50"
                      >
                        {checkingId === order.id ? 'جاري الفحص...' : '🔍 فحص'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta && meta.total > limit && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
            <span className="text-sm text-gray-500">إجمالي {meta.total} نتيجة</span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-white"
              >
                السابق
              </button>
              <span className="px-3 py-1.5 text-sm text-gray-600">صفحة {page} من {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-white"
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
