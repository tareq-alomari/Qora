import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../../common/services/api'
import toast from 'react-hot-toast'
import SEO from '../../../common/components/SEO'

const levelColors = {
  1: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  2: 'bg-orange-100 text-orange-700 border-orange-200',
  3: 'bg-error/10 text-error border-error/20',
}

const levelLabels = { 1: 'منخفض', 2: 'متوسط', 3: 'عالي' }

export default function FraudFlags() {
  const [flags, setFlags] = useState([])
  const [meta, setMeta] = useState({ page: 1, total: 0, total_pages: 1 })
  const [loading, setLoading] = useState(true)
  const [levelFilter, setLevelFilter] = useState('')

  const load = async (page = 1) => {
    setLoading(true)
    try {
      const params = { page, limit: 20 }
      if (levelFilter) params.level = levelFilter
      const { data } = await api.get('/admin/fraud-flags', { params })
      setFlags(data.data)
      setMeta(data.meta)
    } catch (err) {
      toast.error('فشل تحميل علامات الاحتيال')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [levelFilter])

  return (
    <div>
      <SEO title="علامات الاحتيال" />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">علامات الاحتيال</h1>
          <p className="text-navy-500 text-sm">طلبات مشبوهة تم اكتشافها تلقائياً</p>
        </div>
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border border-navy-200 bg-white text-sm font-medium outline-none focus:border-primary-500"
        >
          <option value="">جميع المستويات</option>
          <option value="1">منخفض</option>
          <option value="2">متوسط</option>
          <option value="3">عالي</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-20 text-navy-400">جارٍ التحميل...</div>
      ) : flags.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-navy-100">
          <svg className="w-16 h-16 text-success/30 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-navy-500 font-bold text-lg">لا توجد علامات احتيال</p>
          <p className="text-navy-400 text-sm mt-1">النظام نظيف، لم يتم اكتشاف أي طلبات مشبوهة</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-navy-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-navy-50 text-right">
                    <th className="px-4 py-3 text-xs font-bold text-navy-500 uppercase">الطلب</th>
                    <th className="px-4 py-3 text-xs font-bold text-navy-500 uppercase">العميل</th>
                    <th className="px-4 py-3 text-xs font-bold text-navy-500 uppercase">المستوى</th>
                    <th className="px-4 py-3 text-xs font-bold text-navy-500 uppercase">السبب</th>
                    <th className="px-4 py-3 text-xs font-bold text-navy-500 uppercase">تاريخ التبليغ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-50">
                  {flags.map((f) => (
                    <tr key={f.id} className="hover:bg-navy-25 transition-colors">
                      <td className="px-4 py-3">
                        <Link to={`/dashboard/orders/${f.id}`} className="font-bold text-primary-600 hover:text-primary-700">
                          {f.order_number}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-navy-900">{f.user_name || '—'}</p>
                        <p className="text-xs text-navy-400" dir="ltr">{f.user_phone}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold border ${levelColors[f.fraud_level] || ''}`}>
                          {levelLabels[f.fraud_level] || f.fraud_level}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-navy-600 max-w-xs truncate">{f.fraud_reason || '—'}</td>
                      <td className="px-4 py-3 text-sm text-navy-400">
                        {new Date(f.flagged_at).toLocaleDateString('ar-YE')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {meta.total_pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              {Array.from({ length: meta.total_pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => load(p)}
                  className={`w-10 h-10 rounded-xl text-sm font-bold transition-colors ${
                    p === meta.page ? 'bg-primary-500 text-white' : 'bg-white text-navy-500 hover:bg-navy-50 border border-navy-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
