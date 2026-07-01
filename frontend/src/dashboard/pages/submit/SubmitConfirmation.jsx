import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '@/common/services/api'
import toast from 'react-hot-toast'

export default function SubmitConfirmation() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(({ data }) => setOrder(data.data))
      .catch((err) => toast.error(err.response?.data?.error?.message || 'فشل تحميل الطلب'))
      .finally(() => setLoading(false))
  }, [id])

  const handleMarkCompleted = async () => {
    setActionLoading(true)
    try {
      await api.patch(`/orders/${id}/status`, {
        action: 'mark_completed',
        notes: 'تم تأكيد الإكتمال',
      })
      toast.success('تم تأكيد اكتمال الطلب')
      navigate('/dashboard/submit')
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'فشل تحديث الحالة')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-6 bg-gray-200 rounded w-48" />
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="h-8 bg-gray-200 rounded w-48" />
        </div>
      </div>
    )
  }

  if (!order) {
    return <div className="text-center py-12 text-gray-500">الطلب غير موجود</div>
  }

  const isSubmitted = order.status === 'submitted' || order.status === 'completed'

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/dashboard/submit" className="hover:text-primary-500">التقديم</Link>
        <span>/</span>
        <span>طلب #{order.order_number || id?.slice(0, 8)}</span>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
          <div className="text-6xl mb-4">
            {order.status === 'completed' ? '🏆' : isSubmitted ? '✅' : '📋'}
          </div>
          <h2 className="text-xl font-bold mb-2">
            {order.status === 'completed' ? 'طلب مكتمل' : isSubmitted ? 'تم الإدخال الرسمي' : 'بانتظار الإدخال'}
          </h2>

          {order.confirmation_number && (
            <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 my-4">
              <p className="text-sm text-primary-600 mb-1">رقم التأكيد</p>
              <p className="text-2xl font-bold font-mono text-primary-700 tracking-wider" dir="ltr">
                {order.confirmation_number}
              </p>
            </div>
          )}

          <div className="space-y-2 text-sm text-right mt-4">
            <div className="flex justify-between">
              <span className="text-gray-500">اسم العميل</span>
              <span className="font-medium">{order.client_name || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">الحالة</span>
              <span className="font-medium">{order.status === 'completed' ? 'مكتمل' : isSubmitted ? 'مقدم' : order.status}</span>
            </div>
            {order.submitted_at && (
              <div className="flex justify-between">
                <span className="text-gray-500">تاريخ التقديم</span>
                <span className="font-medium">{new Date(order.submitted_at).toLocaleString('ar-SA')}</span>
              </div>
            )}
          </div>
        </div>

        {isSubmitted && order.status !== 'completed' && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="font-semibold mb-4">📝 الإجراءات</h3>
            <button
              onClick={handleMarkCompleted}
              disabled={actionLoading}
              className="w-full bg-success text-white py-2.5 rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
            >
              {actionLoading ? 'جاري...' : '✅ تأكيد اكتمال الطلب'}
            </button>
          </div>
        )}

        {!isSubmitted && (
          <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 text-center text-warning text-sm">
            هذا الطلب لم يتم إدخاله رسمياً بعد. الرجاء العودة إلى قائمة التقديم لإدخال رقم التأكيد.
          </div>
        )}

        <div className="text-center">
          <button
            onClick={() => navigate('/dashboard/submit')}
            className="text-primary-500 hover:text-primary-700 text-sm font-medium"
          >
            ← العودة إلى قائمة التقديم
          </button>
        </div>
      </div>
    </div>
  )
}
