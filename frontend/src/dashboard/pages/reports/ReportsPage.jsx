import { useState, useEffect } from 'react'
import api from '@/common/services/api'
import toast from 'react-hot-toast'
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

function numberFormat(n) { return new Intl.NumberFormat('ar-SA').format(n || 0) }
function currencyFormat(n) { return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n || 0) }

export default function ReportsPage() {
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
      status: statusLabels[key] || key,
      count,
      percentage: stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) + '%' : '0%',
    }))
    const filename = `الطلبات-حسب-الحالة-${new Date().toISOString().slice(0, 10)}`
    exportToCSV(rows, filename, [
      { key: 'status', label: 'الحالة' },
      { key: 'count', label: 'العدد' },
      { key: 'percentage', label: 'النسبة' },
    ])
  }

  const handleExportRevenue = () => {
    const rows = Object.entries(stats?.by_method || {}).map(([key, amount]) => ({
      method: methodLabels[key] || key,
      revenue: currencyFormat(amount),
      percentage: stats.revenue_total > 0 ? ((amount / stats.revenue_total) * 100).toFixed(1) + '%' : '0%',
    }))
    const filename = `الإيرادات-حسب-طريقة-الدفع-${new Date().toISOString().slice(0, 10)}`
    exportToCSV(rows, filename, [
      { key: 'method', label: 'طريقة الدفع' },
      { key: 'revenue', label: 'الإيراد' },
      { key: 'percentage', label: 'النسبة' },
    ])
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-6 bg-gray-200 rounded w-32" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📈 التقارير</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <p className="text-sm text-gray-500 mb-1">إجمالي الطلبات</p>
          <p className="text-3xl font-bold text-primary-500">{numberFormat(stats?.total)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <p className="text-sm text-gray-500 mb-1">إجمالي الإيرادات</p>
          <p className="text-3xl font-bold text-success">{currencyFormat(stats?.revenue_total)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <p className="text-sm text-gray-500 mb-1">متوسط الإيراد لكل طلب</p>
          <p className="text-3xl font-bold text-gold-500">
            {stats?.total > 0 ? currencyFormat((stats.revenue_total || 0) / stats.total) : '$0'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Today / Week / Month */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="font-semibold mb-4">الطلبات حسب الفترة</h2>
          <div className="space-y-4">
            <PeriodRow label="اليوم" value={numberFormat(stats?.today)} color="text-success" />
            <PeriodRow label="هذا الأسبوع" value={numberFormat(stats?.this_week)} color="text-primary-500" />
            <PeriodRow label="هذا الشهر" value={numberFormat(stats?.this_month)} color="text-gold-500" />
          </div>
        </div>

        {/* Revenue Period */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="font-semibold mb-4">الإيرادات حسب الفترة</h2>
          <div className="space-y-4">
            <PeriodRow label="إيرادات اليوم" value={currencyFormat(stats?.revenue_today)} color="text-success" />
            <PeriodRow label="إيرادات الأسبوع" value={currencyFormat(stats?.revenue_this_week)} color="text-primary-500" />
          </div>
        </div>
      </div>

      {/* Orders by Status */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">توزيع الطلبات حسب الحالة</h2>
          <ExportButton onExport={handleExportStatus} disabled={!stats?.by_status || Object.keys(stats.by_status).length === 0} />
        </div>
        {stats?.by_status && Object.keys(stats.by_status).length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">الحالة</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">العدد</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">النسبة</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(stats.by_status).map(([key, count]) => (
                  <tr key={key} className="border-b">
                    <td className="px-4 py-3 text-sm">{statusLabels[key] || key}</td>
                    <td className="px-4 py-3 text-sm font-medium">{count}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">لا توجد بيانات</p>
        )}
      </div>

      {/* Revenue by Method */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">الإيرادات حسب طريقة الدفع</h2>
          <ExportButton onExport={handleExportRevenue} disabled={!stats?.by_method || Object.keys(stats.by_method).length === 0} />
        </div>
        {stats?.by_method && Object.keys(stats.by_method).length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">طريقة الدفع</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">الإيراد</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">النسبة</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(stats.by_method).map(([key, amount]) => (
                  <tr key={key} className="border-b">
                    <td className="px-4 py-3 text-sm">{methodLabels[key] || key}</td>
                    <td className="px-4 py-3 text-sm font-medium">{currencyFormat(amount)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {stats.revenue_total > 0 ? ((amount / stats.revenue_total) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">لا توجد بيانات</p>
        )}
      </div>
    </div>
  )
}

function PeriodRow({ label, value, color }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`text-lg font-bold ${color}`}>{value}</span>
    </div>
  )
}
