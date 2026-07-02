import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '@/common/services/api'
import toast from 'react-hot-toast'
import SEO from '@/common/components/SEO'
import StatusTimeline from '@/common/components/StatusTimeline'

export default function AdminOrderReview() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    api.get(`/orders/${id}`)
      .then(({ data }) => setOrder(data.data))
      .catch((err) => toast.error(err.response?.data?.error?.message || 'فشل تحميل الطلب'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="text-center py-20 text-navy-400">جارٍ التحميل...</div>
  if (!order) return <div className="text-center py-20 text-navy-400">الطلب غير موجود</div>

  return (
    <div>
      <SEO title={`الطلب ${order.order_number || ''}`} />
      <Link to="/dashboard/admin/orders" className="text-sm text-primary-600 hover:text-primary-700 mb-4 inline-block">
        &larr; العودة لإشراف الطلبات
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">طلب #{order.order_number}</h1>
          <p className="text-navy-500 text-sm">عرض تفصيلي للطلب — صلاحية القراءة فقط</p>
        </div>
        <Link
          to={`/dashboard/orders/${id}`}
          className="px-4 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-bold hover:bg-primary-600 transition-colors"
        >
          الانتقال لصفحة المراجعة
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <div className="bg-white rounded-2xl p-6 border border-navy-100">
            <h2 className="text-lg font-bold text-navy-900 mb-4">البيانات الشخصية</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div><dt className="text-navy-400">الاسم الأول</dt><dd className="font-bold text-navy-900">{order.first_name || '—'}</dd></div>
              <div><dt className="text-navy-400">اسم العائلة</dt><dd className="font-bold text-navy-900">{order.last_name || '—'}</dd></div>
              <div><dt className="text-navy-400">البريد</dt><dd className="font-bold text-navy-900" dir="ltr">{order.email || '—'}</dd></div>
              <div><dt className="text-navy-400">الهاتف</dt><dd className="font-bold text-navy-900" dir="ltr">{order.phone || '—'}</dd></div>
              <div><dt className="text-navy-400">الجنس</dt><dd className="font-bold text-navy-900">{order.gender || '—'}</dd></div>
              <div><dt className="text-navy-400">تاريخ الميلاد</dt><dd className="font-bold text-navy-900">{order.birth_date || '—'}</dd></div>
              <div><dt className="text-navy-400">بلد الميلاد</dt><dd className="font-bold text-navy-900">{order.country_of_birth || '—'}</dd></div>
              <div><dt className="text-navy-400">مدينة الميلاد</dt><dd className="font-bold text-navy-900">{order.city_of_birth || '—'}</dd></div>
            </dl>
          </div>

          {/* Qualification */}
          <div className="bg-white rounded-2xl p-6 border border-navy-100">
            <h2 className="text-lg font-bold text-navy-900 mb-4">المؤهل الدراسي</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div><dt className="text-navy-400">المستوى</dt><dd className="font-bold text-navy-900">{order.education_level || '—'}</dd></div>
              <div><dt className="text-navy-400">المؤهل</dt><dd className="font-bold text-navy-900">{order.highest_degree || '—'}</dd></div>
            </dl>
          </div>
        </div>

        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white rounded-2xl p-6 border border-navy-100">
            <h2 className="text-lg font-bold text-navy-900 mb-4">الحالة</h2>
            <StatusTimeline status={order.status} />
          </div>

          {/* Payment */}
          <div className="bg-white rounded-2xl p-6 border border-navy-100">
            <h2 className="text-lg font-bold text-navy-900 mb-4">الدفع</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-navy-400">الحالة</span><span className="font-bold text-navy-900">{order.payment_status || '—'}</span></div>
              {order.payment_amount && <div className="flex justify-between"><span className="text-navy-400">المبلغ</span><span className="font-bold text-navy-900">{order.payment_amount}</span></div>}
              {order.payment_method && <div className="flex justify-between"><span className="text-navy-400">طريقة الدفع</span><span className="font-bold text-navy-900">{order.payment_method}</span></div>}
            </dl>
          </div>

          {/* Confirmation */}
          {order.confirmation_number && (
            <div className="bg-white rounded-2xl p-6 border border-navy-100">
              <h2 className="text-lg font-bold text-navy-900 mb-4">رقم التأكيد</h2>
              <p className="text-xl font-black text-success font-mono tracking-wider text-center" dir="ltr">{order.confirmation_number}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
