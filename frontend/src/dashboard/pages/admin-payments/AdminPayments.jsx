import { useState, useEffect } from 'react'
import api from '@/common/services/api'
import toast from 'react-hot-toast'
import SEO from '@/common/components/SEO'
import { exportToCSV } from '@/common/utils/export'
import Pagination from '@/common/components/Pagination'

export default function AdminPayments() {
  const [payments, setPayments] = useState([])
  const [meta, setMeta] = useState({ page: 1, total: 0, total_pages: 1 })
  const [loading, setLoading] = useState(true)

  const load = async (page = 1) => {
    setLoading(true)
    try {
      const { data } = await api.get('/payments/receipts', { params: { page, limit: 20 } })
      setPayments(data.data || [])
      setMeta(data.meta || { page: 1, total: 0, total_pages: 1 })
    } catch (err) {
      toast.error('فشل تحميل المدفوعات')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleExport = () => {
    const rows = payments.map((p) => ({
      order: p.order_number,
      client: p.user_name || p.user_phone,
      amount: p.amount,
      method: p.method,
      status: p.status,
      date: new Date(p.created_at).toLocaleDateString('ar-YE'),
    }))
    exportToCSV(rows, `المدفوعات-${new Date().toISOString().slice(0, 10)}`, [
      { key: 'order', label: 'الطلب' },
      { key: 'client', label: 'العميل' },
      { key: 'amount', label: 'المبلغ' },
      { key: 'method', label: 'طريقة الدفع' },
      { key: 'status', label: 'الحالة' },
      { key: 'date', label: 'التاريخ' },
    ])
    toast.success('تم التصدير')
  }

  return (
    <div>
      <SEO title="المدفوعات - إشراف" />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">المدفوعات</h1>
          <p className="text-navy-500 text-sm">إشراف على جميع المدفوعات</p>
        </div>
        <button onClick={handleExport} className="px-4 py-2.5 bg-white border border-navy-200 rounded-xl text-sm font-bold text-navy-600 hover:bg-navy-50 transition-colors">
          تصدير CSV
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-navy-400">جارٍ التحميل...</div>
      ) : payments.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-navy-100">
          <p className="text-navy-500 font-bold">لا توجد مدفوعات بعد</p>
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
                    <th className="px-4 py-3 text-xs font-bold text-navy-500 uppercase">المبلغ</th>
                    <th className="px-4 py-3 text-xs font-bold text-navy-500 uppercase">طريقة الدفع</th>
                    <th className="px-4 py-3 text-xs font-bold text-navy-500 uppercase">الحالة</th>
                    <th className="px-4 py-3 text-xs font-bold text-navy-500 uppercase">التاريخ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-50">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-navy-25 transition-colors">
                      <td className="px-4 py-3 font-bold text-navy-900">{p.order_number}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-navy-900">{p.user_name || '—'}</p>
                        <p className="text-xs text-navy-400" dir="ltr">{p.user_phone}</p>
                      </td>
                      <td className="px-4 py-3 font-bold text-navy-900">{p.amount}</td>
                      <td className="px-4 py-3 text-sm text-navy-600">{p.method}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold border ${
                          p.status === 'verified' ? 'bg-success/10 text-success border-success/20' :
                          p.status === 'rejected' ? 'bg-error/10 text-error border-error/20' :
                          'bg-gold-50 text-gold-600 border-gold-200'
                        }`}>
                          {p.status === 'verified' ? 'مؤكد' : p.status === 'rejected' ? 'مرفوض' : 'بانتظار التحقق'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-navy-400">
                        {new Date(p.created_at).toLocaleDateString('ar-YE')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {meta.total_pages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination page={meta.page} totalPages={meta.total_pages} onPageChange={load} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
