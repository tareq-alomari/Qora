import { useState, useEffect } from 'react'
import api from '../../../common/services/api'
import toast from 'react-hot-toast'
import SEO from '../../../common/components/SEO'

export default function QueueStatus() {
  const [queue, setQueue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [enqueuing, setEnqueuing] = useState({ submit: false, check: false })

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/headless/queue-status')
      setQueue(data.data)
    } catch (err) {
      toast.error('فشل تحميل حالة الطابور')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])
  useEffect(() => { const iv = setInterval(load, 10000); return () => clearInterval(iv) }, [])

  const handleEnqueue = async (type) => {
    setEnqueuing((prev) => ({ ...prev, [type]: true }))
    try {
      await api.post(`/admin/headless/${type === 'submit' ? 'submit' : 'check-results'}`)
      toast.success(`تمت إضافة الطلبات إلى قائمة ${type === 'submit' ? 'التقديم' : 'الفحص'}`)
      load()
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'فشل')
    } finally {
      setEnqueuing((prev) => ({ ...prev, [type]: false }))
    }
  }

  const StatCard = ({ label, value, color = 'text-navy-900' }) => (
    <div className="bg-white rounded-2xl p-6 border border-navy-100 text-center">
      <p className={`text-2xl font-black ${color}`}>{value ?? '—'}</p>
      <p className="text-navy-500 text-sm mt-1">{label}</p>
    </div>
  )

  if (loading && !queue) return <div className="text-center py-20 text-navy-400">جارٍ التحميل...</div>

  return (
    <div>
      <SEO title="حالة الطابور" />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">حالة طابور التقديم</h1>
          <p className="text-navy-500 text-sm">مراقبة طابور التقديم الآلي وفحص النتائج على dvprogram.state.gov</p>
        </div>
        <button
          onClick={load}
          className="px-4 py-2 bg-white border border-navy-200 rounded-xl text-sm font-bold text-navy-600 hover:bg-navy-50 transition-colors"
        >
          تحديث
        </button>
      </div>

      {queue && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="بانتظار التقديم" value={queue.submit?.waiting || queue.waiting_submit} color="text-primary-600" />
          <StatCard label="قيد التقديم" value={queue.submit?.active || queue.active_submit} color="text-gold-600" />
          <StatCard label="بانتظار فحص النتائج" value={queue.check?.waiting || queue.waiting_check} color="text-primary-600" />
          <StatCard label="قيد الفحص" value={queue.check?.active || queue.active_check} color="text-gold-600" />
        </div>
      )}

      <div className="bg-white rounded-2xl p-8 border border-navy-100">
        <h2 className="text-lg font-bold text-navy-900 mb-6">إجراءات الطابور</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => handleEnqueue('submit')}
            disabled={enqueuing.submit}
            className="flex items-center justify-center gap-3 p-6 bg-primary-50 border-2 border-primary-200 rounded-2xl hover:bg-primary-100 hover:border-primary-300 transition-all disabled:opacity-50"
          >
            <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div className="text-right">
              <p className="font-bold text-navy-900">
                {enqueuing.submit ? 'جارٍ الإضافة...' : 'إضافة طلبات إلى طابور التقديم'}
              </p>
              <p className="text-sm text-navy-500">تقديم الطلبات المعتمدة على الموقع الرسمي</p>
            </div>
          </button>

          <button
            onClick={() => handleEnqueue('check')}
            disabled={enqueuing.check}
            className="flex items-center justify-center gap-3 p-6 bg-gold-50 border-2 border-gold-200 rounded-2xl hover:bg-gold-100 hover:border-gold-300 transition-all disabled:opacity-50"
          >
            <svg className="w-8 h-8 text-gold-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <div className="text-right">
              <p className="font-bold text-navy-900">
                {enqueuing.check ? 'جارٍ الإضافة...' : 'إضافة طلبات لفحص النتائج'}
              </p>
              <p className="text-sm text-navy-500">التحقق من نتائج القرعة على الموقع الرسمي</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
