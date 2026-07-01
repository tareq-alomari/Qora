import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@/common/services/api'
import toast from 'react-hot-toast'
import Pagination from '@/common/components/Pagination'
import StatusBadge from '@/common/components/StatusBadge'
import { formatDate } from '@/common/utils/formatters'
import { STATUS_LABELS, PAYMENT_STATUS_LABELS, PAYMENT_STATUS_COLORS } from '@/common/utils/constants'

const fraudLevels = {
  L1: { label: 'L1 - منخفض', color: 'bg-green-100 text-green-700' },
  L2: { label: 'L2 - متوسط', color: 'bg-yellow-100 text-yellow-700' },
  L3: { label: 'L3 - مرتفع', color: 'bg-orange-100 text-orange-700' },
  L4: { label: 'L4 - خطير', color: 'bg-red-100 text-red-700' },
}

const statusOptions = [
  { value: '', label: 'كل الحالات' },
  ...Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label })),
]

const paymentStatusOptions = [
  { value: '', label: 'كل حالات الدفع' },
  ...Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => ({ value, label })),
]

export default function AdminOrdersList() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const limit = 20

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit, sort: 'created_at', order: 'desc' }
      if (search) params.search = search
      if (status) params.status = status
      if (paymentStatus) params.payment_status = paymentStatus
      if (dateFrom) params.date_from = dateFrom
      if (dateTo) params.date_to = dateTo
      const { data } = await api.get('/orders', { params })
      setOrders(data.data || [])
      setMeta(data.meta)
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'فشل تحميل الطلبات')
    } finally {
      setLoading(false)
    }
  }, [page, search, status, paymentStatus, dateFrom, dateTo])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const handleSearch = (e) => {
    setSearch(e.target.value)
    setPage(1)
  }

  const handleExport = () => {
    toast('تصدير البيانات - قريباً', { icon: 'ℹ️' })
  }

  const totalPages = meta ? Math.ceil(meta.total / limit) : 1
  const hasFilters = search || status || paymentStatus || dateFrom || dateTo

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">📋 إشراف الطلبات</h1>
          {meta && (
            <p className="text-sm text-gray-500 mt-1">
              إجمالي {meta.total} طلب
              {hasFilters && orders.length !== meta.total && ` (عرض ${orders.length})`}
            </p>
          )}
        </div>
        <div className="relative group">
          <button
            onClick={handleExport}
            className="bg-primary-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-600 transition"
          >
            📥 تصدير
          </button>
          <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block">
            <div className="bg-gray-800 text-white text-xs rounded-lg px-3 py-1.5 whitespace-nowrap">
              قريباً
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <input
            type="text"
            placeholder="بحث برقم الطلب أو اسم العميل أو الهاتف..."
            value={search}
            onChange={handleSearch}
            className="w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          />
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1) }}
            className="border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            value={paymentStatus}
            onChange={(e) => { setPaymentStatus(e.target.value); setPage(1) }}
            className="border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          >
            {paymentStatusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
            className="border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            title="من تاريخ"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
            className="border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            title="إلى تاريخ"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">#</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">العميل</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">الهاتف</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">الحالة</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">الموظف المسؤول</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">حالة الدفع</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">مؤشر الاحتيال</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">تاريخ الإنشاء</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">تفاصيل</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-gray-400">
                    جاري التحميل...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="py-12">
                      <div className="text-center">
                        <div className="text-5xl mb-4">📋</div>
                        <p className="text-gray-700 text-lg mb-2">
                          {hasFilters ? 'لا توجد نتائج للبحث' : 'لا توجد طلبات بعد'}
                        </p>
                        <p className="text-gray-400">
                          {hasFilters ? 'حاول تغيير معايير البحث أو الفلتر' : ''}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/dashboard/orders/${order.id}`)}
                  >
                    <td className="px-4 py-3 text-sm font-mono">
                      {order.order_number || order.id?.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {order.client_name || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">{order.phone || '-'}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {order.assigned_employee_name || (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {order.payment_status ? (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PAYMENT_STATUS_COLORS[order.payment_status] || 'bg-gray-100 text-gray-700'}`}>
                          {PAYMENT_STATUS_LABELS[order.payment_status] || order.payment_status}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {order.fraud_level ? (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${fraudLevels[order.fraud_level]?.color || 'bg-gray-100 text-gray-700'}`}>
                          {fraudLevels[order.fraud_level]?.label || order.fraud_level}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/orders/${order.id}`) }}
                        className="text-primary-500 hover:text-primary-700 text-sm font-medium"
                      >
                        عرض
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          total={meta?.total}
          onPageChange={setPage}
        />
      </div>
    </div>
  )
}
