import { useState, useEffect } from 'react'
import api from '@/common/services/api'
import toast from 'react-hot-toast'
import { STATUS_LABELS } from '@/common/utils/constants'
import { formatDateTime } from '@/common/utils/formatters'

const TARGET_OPTIONS = [
  { value: 'all_clients', label: 'جميع العملاء', role: 'client' },
  { value: 'all_employees', label: 'جميع الموظفين', role: 'employee' },
  { value: 'by_status', label: 'حسب حالة الطلب', role: null },
]

const CHANNEL_OPTIONS = [
  { value: 'pwa', label: 'تطبيق فقط' },
  { value: 'whatsapp', label: 'تطبيق + واتساب' },
]

export default function BulkNotificationsPage() {
  const [target, setTarget] = useState('all_clients')
  const [statusFilter, setStatusFilter] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [channel, setChannel] = useState('pwa')
  const [sending, setSending] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    setLoadingHistory(true)
    try {
      const { data } = await api.get('/notifications?page=1&limit=20')
      setHistory(data.data || [])
    } catch {
      // silent
    } finally {
      setLoadingHistory(false)
    }
  }

  const selectedRole = TARGET_OPTIONS.find(o => o.value === target)?.role

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error('يرجى إدخال عنوان ومحتوى الإشعار')
      return
    }

    setSending(true)
    setShowConfirm(false)

    try {
      const payload = {
        title: title.trim(),
        body: body.trim(),
        channel,
        filters: {},
      }

      if (selectedRole) {
        payload.filters.role = selectedRole
      }
      if (statusFilter) {
        payload.filters.status = statusFilter
      }

      const { data: result } = await api.post('/admin/bulk-notifications', payload)
      toast.success(`تم إرسال ${result.data.sent} إشعار بنجاح`)
      setTitle('')
      setBody('')
      setChannel('pwa')
      setTarget('all_clients')
      setStatusFilter('')
      fetchHistory()
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'فشل إرسال الإشعارات')
    } finally {
      setSending(false)
    }
  }

  const estimatedRecipients = target === 'all_clients' ? 'جميع العملاء'
    : target === 'all_employees' ? 'جميع الموظفين'
    : STATUS_LABELS[statusFilter] || '—'

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold">🔔 إرسال إشعار جماعي</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
        {/* Target Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">المستهدفون</label>
          <div className="flex flex-wrap gap-3">
            {TARGET_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => { setTarget(opt.value); setStatusFilter('') }}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  target === opt.value
                    ? 'bg-primary-50 border-primary-300 text-primary-700'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {target === 'by_status' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="mt-3 w-full max-w-xs border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="">اختر حالة الطلب</option>
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">عنوان الإشعار</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={255}
            className="w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            placeholder="أدخل عنوان الإشعار"
          />
        </div>

        {/* Body */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">محتوى الإشعار</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={500}
            rows={4}
            className="w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none"
            placeholder="أدخل محتوى الإشعار"
          />
          <p className={`text-xs mt-1 ${body.length >= 500 ? 'text-error' : 'text-gray-400'}`}>
            {body.length} / 500
          </p>
        </div>

        {/* Channel */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">قناة الإرسال</label>
          <div className="flex flex-wrap gap-3">
            {CHANNEL_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setChannel(opt.value)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  channel === opt.value
                    ? 'bg-primary-50 border-primary-300 text-primary-700'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {channel === 'whatsapp' && (
            <p className="text-xs text-amber-600 mt-2">ملاحظة: يتطلب إرسال واتساب تفعيل API token في الإعدادات</p>
          )}
        </div>

        {/* Preview */}
        <div className="bg-gray-50 rounded-lg p-4 border">
          <h3 className="text-sm font-medium text-gray-500 mb-3">👁️ معاينة الإشعار</h3>
          <div className="bg-white rounded-lg shadow-sm border p-4 max-w-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                ق
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{title || 'عنوان الإشعار'}</p>
                <p className="text-sm text-gray-600 mt-1">{body || 'محتوى الإشعار'}</p>
                <p className="text-xs text-gray-400 mt-2">
                  المستلم: {estimatedRecipients}
                  {' · '}
                  {channel === 'whatsapp' ? 'تطبيق + واتساب' : 'تطبيق فقط'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Send Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={() => setShowConfirm(true)}
            disabled={sending || !title.trim() || !body.trim()}
            className="bg-primary-500 text-white px-8 py-2.5 rounded-lg hover:bg-primary-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {sending ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                جاري الإرسال...
              </>
            ) : (
              '🚀 إرسال الإشعار'
            )}
          </button>
        </div>
      </div>

      {/* History Section */}
      <div className="bg-white rounded-xl shadow-sm border mt-6 overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="font-semibold">📋 آخر الإشعارات المرسلة</h2>
        </div>

        {loadingHistory ? (
          <div className="text-center py-12 text-gray-400">جاري التحميل...</div>
        ) : history.length === 0 ? (
          <div className="text-center py-12 text-gray-400">لا توجد إشعارات مرسلة بعد</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">العنوان</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">المحتوى</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">القناة</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">الحالة</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {history.filter(n => n.type === 'bulk').slice(0, 20).map((notif, idx) => (
                  <tr key={notif.id || idx} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{notif.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{notif.body || '-'}</td>
                    <td className="px-4 py-3 text-sm">{notif.channel === 'whatsapp' ? 'واتساب' : 'تطبيق'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        notif.status === 'sent' ? 'bg-green-100 text-green-700'
                        : notif.status === 'failed' ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {notif.status === 'sent' ? 'مرسل' : notif.status === 'failed' ? 'فشل' : 'بانتظار الإرسال'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{formatDateTime(notif.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowConfirm(false)}>
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">تأكيد إرسال الإشعار</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p><span className="font-medium text-gray-800">العنوان:</span> {title}</p>
              <p><span className="font-medium text-gray-800">المحتوى:</span> {body}</p>
              <p><span className="font-medium text-gray-800">المستهدفون:</span> {estimatedRecipients}</p>
              <p><span className="font-medium text-gray-800">القناة:</span> {channel === 'whatsapp' ? 'تطبيق + واتساب' : 'تطبيق فقط'}</p>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-6 py-2.5 border rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                إلغاء
              </button>
              <button
                onClick={handleSend}
                className="px-6 py-2.5 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600"
              >
                تأكيد الإرسال
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
