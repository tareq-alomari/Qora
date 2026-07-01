import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
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
        notes: `تم الإدخال الرسمي برقم تأكيد: ${confirmationNumber}`,
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🌐 إدخال رقم التأكيد</h1>
        <span className="text-sm text-gray-500">{meta?.total || 0} طلب جاهز</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">#</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">العميل</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">الدولة</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">تاريخ الإنشاء</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400">جاري التحميل...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400">لا توجد طلبات جاهزة للإدخال الرسمي</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono">{order.order_number || order.id?.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-sm font-medium">{order.client_name || '-'}</td>
                    <td className="px-4 py-3 text-sm">{order.country || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString('ar-SA') : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSubmitModal(order)}
                        className="bg-primary-500 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-primary-600"
                      >
                        إدخال رقم التأكيد
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

      {/* Submit Modal */}
      {submitModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSubmitModal(null)}>
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-2">إدخال رقم التأكيد</h3>
            <p className="text-sm text-gray-500 mb-4">
              الطلب: {submitModal.client_name || submitModal.id}
            </p>
            <input
              type="text"
              placeholder="رقم التأكيد من موقع DV Lottery..."
              value={confirmationNumber}
              onChange={(e) => setConfirmationNumber(e.target.value)}
              className="w-full border rounded-lg px-4 py-2.5 text-sm mb-4 focus:ring-2 focus:ring-primary-500 outline-none"
              autoFocus
              dir="ltr"
            />
            <p className="text-xs text-gray-400 mb-4">
              أدخل رقم التأكيد الذي تم الحصول عليه من موقع وزارة الخارجية الأمريكية
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={actionLoading}
                className="flex-1 bg-primary-500 text-white py-2.5 rounded-lg hover:bg-primary-600 font-medium disabled:opacity-50"
              >
                {actionLoading ? 'جاري الإدخال...' : 'تأكيد الإدخال'}
              </button>
              <button
                onClick={() => { setSubmitModal(null); setConfirmationNumber('') }}
                className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg hover:bg-gray-200 font-medium"
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
