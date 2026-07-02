import { useState, useEffect, useCallback } from 'react'
import api from '@/common/services/api'
import toast from 'react-hot-toast'

const actionLabels = {
  create: 'إنشاء', update: 'تحديث', approve_photo: 'قبول صورة', reject_photo: 'رفض صورة',
  verify_payment: 'تأكيد دفع', reject_payment: 'رفض دفع', approve: 'اعتماد',
  request_correction: 'طلب تعديل', submit_official: 'إدخال رسمي', mark_completed: 'تأكيد اكتمال',
  cancel: 'إلغاء', status_change: 'تغيير حالة',
}

const statusLabels = {
  draft: 'مسودة', data_entry_complete: 'بيانات مكتملة', photo_pending: 'بانتظار الصورة',
  photo_rejected: 'الصورة مرفوضة', photo_accepted: 'الصورة مقبولة',
  payment_pending: 'بانتظار الدفع', payment_verification: 'تدقيق الدفع',
  needs_correction: 'يحتاج تعديل', approved: 'مقبول', submitted: 'مقدم',
  completed: 'مكتمل', cancelled: 'ملغي',
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const limit = 30

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit }
      if (dateFrom) params.date_from = dateFrom
      if (dateTo) params.date_to = dateTo
      const { data } = await api.get('/admin/audit-logs', { params })
      setLogs(data.data || [])
      setMeta(data.meta)
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'فشل تحميل سجل التدقيق')
    } finally {
      setLoading(false)
    }
  }, [page, dateFrom, dateTo])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const totalPages = meta ? Math.ceil(meta.total / limit) : 1

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">📝 سجل التدقيق</h1>
        <div className="flex gap-2 items-center">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
            className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          />
          <span className="text-gray-400">إلى</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
            className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          />
          {(dateFrom || dateTo) && (
            <button
              onClick={() => { setDateFrom(''); setDateTo(''); setPage(1) }}
              className="text-sm text-error hover:underline"
            >
              إلغاء الفلتر
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">التاريخ</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">المستخدم</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">الإجراء</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">من حالة</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">إلى حالة</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">رقم الطلب</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">جاري التحميل...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">لا توجد سجلات</td>
                </tr>
              ) : (
                logs.map((log, idx) => (
                  <tr key={log.id || idx} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      {log.created_at ? new Date(log.created_at).toLocaleString('ar-SA') : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">{log.user_name || log.user_id || '-'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                        {actionLabels[log.action] || log.action || 'تغيير حالة'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {log.from_status ? (
                        <span className="text-gray-500">{statusLabels[log.from_status] || log.from_status}</span>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {log.to_status ? (
                        <span>{statusLabels[log.to_status] || log.to_status}</span>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono">
                      {log.order_number || log.order_id?.slice(0, 8) || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                      {log.metadata?.notes || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta && meta.total > limit && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
            <span className="text-sm text-gray-500">إجمالي {meta.total} سجل</span>
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
