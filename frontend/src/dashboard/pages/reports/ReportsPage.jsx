import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import api from '@/common/services/api'
import toast from 'react-hot-toast'
import SEO from '@/common/components/SEO'
import ExportButton from '@/common/components/ExportButton'
import { exportToCSV } from '@/common/utils/export'

const statusLabels = {
  draft: 'مسودة', data_entry_complete: 'بيانات مكتملة', photo_pending: 'بانتظار الصورة',
  photo_rejected: 'الصورة مرفوضة', photo_accepted: 'الصورة مقبولة',
  payment_pending: 'بانتظار الدفع', payment_verification: 'تدقيق الدفع',
  needs_correction: 'يحتاج تعديل', approved: 'مقبول', submitted: 'مقدم',
  completed: 'مكتمل', cancelled: 'ملغي',
}

const methodLabels = { credit: 'بطاقة ائتمان', bank: 'تحويل بنكي', cash: 'نقدي', mobile_money: 'موبايل موني', other: 'أخرى' }

const tabs = [
  { id: 'overview', label: 'نظرة عامة', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
  { id: 'revenue', label: 'الإيرادات', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'employees', label: 'الموظفين', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
]

function numberFormat(n) { return new Intl.NumberFormat('ar-SA').format(n || 0) }
function currencyFormat(n) { return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n || 0) }

export default function ReportsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') || 'overview'
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/stats')
      .then(({ data }) => setStats(data.data))
      .catch((err) => toast.error(err.response?.data?.error?.message || 'فشل تحميل التقارير'))
      .finally(() => setLoading(false))
  }, [])

  const handleExportStatus = () => {
    const rows = Object.entries(stats?.by_status || {}).map(([key, count]) => ({
      status: statusLabels[key] || key, count,
      percentage: stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) + '%' : '0%',
    }))
    exportToCSV(rows, `الطلبات-حسب-الحالة-${new Date().toISOString().slice(0, 10)}`, [
      { key: 'status', label: 'الحالة' }, { key: 'count', label: 'العدد' }, { key: 'percentage', label: 'النسبة' },
    ])
  }

  if (loading) {
    return <div className="animate-pulse space-y-6">
      <div className="h-6 bg-gray-200 rounded w-32" />
      <div className="grid grid-cols-3 gap-4"><div className="h-24 bg-gray-200 rounded-xl" /><div className="h-24 bg-gray-200 rounded-xl" /><div className="h-24 bg-gray-200 rounded-xl" /></div>
      <div className="h-64 bg-gray-200 rounded-xl" />
    </div>
  }

  const totalRevenue = (stats?.total_paid || 0) * (stats?.pricing?.total_price || 20)

  return (
    <div>
      <SEO title="التقارير" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-navy-900">التقارير</h1>
        <div className="flex gap-2">
          <ExportButton onClick={handleExportStatus} label="تصدير CSV" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setSearchParams({ tab: t.id })}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              tab === t.id ? 'bg-primary-500 text-white shadow-sm' : 'bg-white text-navy-500 hover:bg-navy-50 border border-navy-200'
            }`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={t.icon} /></svg>
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-6 border border-navy-100">
              <p className="text-3xl font-black text-navy-900">{numberFormat(stats.total)}</p>
              <p className="text-navy-500 text-sm mt-1">إجمالي الطلبات</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-navy-100">
              <p className="text-3xl font-black text-primary-600">{numberFormat(stats.total_paid)}</p>
              <p className="text-navy-500 text-sm mt-1">مدفوع</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-navy-100">
              <p className="text-3xl font-black text-gold-600">{numberFormat(stats.total_pending)}</p>
              <p className="text-navy-500 text-sm mt-1">بانتظار الدفع</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-navy-100">
              <p className="text-3xl font-black text-success">{numberFormat(stats.total_submitted)}</p>
              <p className="text-navy-500 text-sm mt-1">تم التقديم</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-navy-100">
            <h2 className="text-lg font-bold text-navy-900 mb-4">الطلبات حسب الحالة</h2>
            <div className="space-y-3">
              {Object.entries(stats.by_status || {}).map(([key, count]) => (
                <div key={key} className="flex items-center gap-4">
                  <span className="text-sm text-navy-600 w-40">{statusLabels[key] || key}</span>
                  <div className="flex-1 bg-navy-50 rounded-full h-3 overflow-hidden">
                    <div className="bg-primary-500 h-full rounded-full transition-all duration-500" style={{ width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%` }}></div>
                  </div>
                  <span className="text-sm font-bold text-navy-900 w-12 text-left">{numberFormat(count)}</span>
                  <span className="text-xs text-navy-400 w-12 text-left">{stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : 0}%</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Revenue Tab */}
      {tab === 'revenue' && stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-6 border border-navy-100">
              <p className="text-3xl font-black text-success">{numberFormat(totalRevenue)}</p>
              <p className="text-navy-500 text-sm mt-1">إجمالي الإيرادات (ريال)</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-navy-100">
              <p className="text-3xl font-black text-primary-600">{numberFormat(stats.total_paid)}</p>
              <p className="text-navy-500 text-sm mt-1">الطلبات المدفوعة</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-navy-100">
              <p className="text-3xl font-black text-navy-900">{numberFormat(stats.total)}</p>
              <p className="text-navy-500 text-sm mt-1">إجمالي الطلبات</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-navy-100">
            <h2 className="text-lg font-bold text-navy-900 mb-4">طرق الدفع</h2>
            <div className="space-y-3">
              {Object.entries(stats.by_payment_method || {}).map(([key, count]) => (
                <div key={key} className="flex items-center gap-4">
                  <span className="text-sm text-navy-600 w-40">{methodLabels[key] || key}</span>
                  <div className="flex-1 bg-navy-50 rounded-full h-3 overflow-hidden">
                    <div className="bg-gold-500 h-full rounded-full transition-all duration-500" style={{ width: `${stats.total_paid > 0 ? (count / stats.total_paid) * 100 : 0}%` }}></div>
                  </div>
                  <span className="text-sm font-bold text-navy-900">{numberFormat(count)}</span>
                </div>
              ))}
              {(!stats.by_payment_method || Object.keys(stats.by_payment_method).length === 0) && (
                <p className="text-navy-400 text-sm py-4 text-center">لا توجد بيانات دفع بعد</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* Employees Tab */}
      {tab === 'employees' && stats && (
        <div className="bg-white rounded-2xl p-6 border border-navy-100">
          <h2 className="text-lg font-bold text-navy-900 mb-4">الموظفون</h2>
          <p className="text-navy-500 mb-4">إدارة الموظفين ومتابعة أدائهم.</p>
          <Link to="/dashboard/admin/users" className="inline-block bg-primary-500 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary-600 transition-colors">
            إدارة المستخدمين
          </Link>
        </div>
      )}
    </div>
  )
}
