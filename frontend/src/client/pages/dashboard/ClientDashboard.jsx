import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '@common/services/api'
import StatusTimeline from '@common/components/StatusTimeline' // We will assume this exists or use a simpler visual

const STATUS_MAP = {
  draft: { label: 'مسودة', color: 'bg-navy-100 text-navy-700 border-navy-200' },
  data_entry_complete: { label: 'بيانات مكتملة', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  photo_pending: { label: 'بانتظار الصورة', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  photo_accepted: { label: 'الصورة مقبولة', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  photo_rejected: { label: 'الصورة مرفوضة', color: 'bg-red-100 text-red-700 border-red-200' },
  payment_pending: { label: 'بانتظار الدفع', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  payment_verification: { label: 'تدقيق الدفع', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  needs_correction: { label: 'يحتاج تعديل', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  approved: { label: 'معتمد للتقديم', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  submitted: { label: 'مقدم رسمياً', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  completed: { label: 'مكتمل', color: 'bg-green-100 text-green-700 border-green-200' },
  cancelled: { label: 'ملغي', color: 'bg-red-100 text-red-700 border-red-200' },
}

export default function ClientDashboard() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders', { params: { limit: 50 } })
        setOrders(data.data || [])
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const handleNewOrder = () => navigate('/lottery')
  const handleResume = (orderId) => navigate(`/lottery?orderId=${orderId}`)

  return (
    <div className="min-h-[80vh] bg-navy-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-navy-900 mb-2">طلباتي</h1>
            <p className="text-navy-500 text-sm">تابع حالة طلباتك واستكمل النواقص بكل سهولة</p>
          </div>
          <button
            onClick={handleNewOrder}
            className="group flex items-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary-500/30 hover:bg-primary-600 hover:-translate-y-0.5 transition-all duration-300"
          >
            <svg className="w-5 h-5 transition-transform group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            إنشاء طلب جديد
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <svg className="animate-spin h-10 w-10 text-primary-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <p className="text-navy-500 font-medium">جاري تحميل طلباتك...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl shadow-xl shadow-navy-100/50 border border-navy-100 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -z-10"></div>
            <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-navy-900 mb-3">لا توجد طلبات بعد</h3>
            <p className="text-navy-500 max-w-md mx-auto mb-8">
              لم تقم بإنشاء أي طلبات للوتري حتى الآن. ابدأ رحلتك نحو فرصة جديدة بالضغط على الزر أدناه.
            </p>
            <button
              onClick={handleNewOrder}
              className="bg-primary-500 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-primary-500/30 hover:bg-primary-600 hover:-translate-y-0.5 transition-all duration-300"
            >
              ابدأ التسجيل الآن
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {orders.map((order) => {
              const status = STATUS_MAP[order.status] || { label: order.status, color: 'bg-navy-100 text-navy-700 border-navy-200' }
              const isFinished = order.status === 'submitted' || order.status === 'completed'
              const needsAction = ['draft', 'photo_pending', 'photo_rejected', 'payment_pending', 'needs_correction'].includes(order.status)
              
              return (
                <div
                  key={order.order_id}
                  onClick={() => handleResume(order.order_id)}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-xl shadow-navy-100/50 border border-navy-100 hover:border-primary-200 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col md:flex-row relative"
                >
                  {/* Decorative side border */}
                  <div className={`absolute top-0 right-0 w-1.5 h-full ${
                    isFinished ? 'bg-success' : needsAction ? 'bg-warning' : 'bg-primary-500'
                  }`}></div>

                  <div className="p-6 md:p-8 flex-1">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-bold text-navy-400 uppercase tracking-wider bg-navy-50 px-2 py-1 rounded-md">
                            رقم الطلب
                          </span>
                          <h3 className="font-extrabold text-xl text-navy-900 tracking-tight">
                            {order.order_number}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-navy-500 font-medium">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {order.created_at ? new Date(order.created_at).toLocaleDateString('ar-YE', {
                            year: 'numeric', month: 'long', day: 'numeric',
                          }) : '-'}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-start md:items-end gap-2">
                        <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold border ${status.color}`}>
                          {status.label}
                        </span>
                        {order.confirmation_number && (
                          <div className="text-sm font-semibold text-primary-600 bg-primary-50 px-3 py-1 rounded-lg border border-primary-100">
                            التأكيد: {order.confirmation_number}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Visual Progress Bar (Simplified Timeline) */}
                    <div className="relative pt-4 mt-4 border-t border-navy-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-navy-400">البيانات</span>
                        <span className="text-xs font-bold text-navy-400">الصورة</span>
                        <span className="text-xs font-bold text-navy-400">الدفع</span>
                        <span className="text-xs font-bold text-navy-400">مكتمل</span>
                      </div>
                      <div className="h-2 w-full bg-navy-100 rounded-full overflow-hidden flex">
                        <div className={`h-full ${order.status !== 'draft' ? 'bg-success w-1/4' : 'bg-primary-400 w-1/8'}`}></div>
                        <div className={`h-full ${['photo_accepted', 'payment_pending', 'payment_verification', 'approved', 'submitted', 'completed'].includes(order.status) ? 'bg-success w-1/4' : ['photo_pending', 'photo_rejected'].includes(order.status) ? 'bg-warning w-1/4' : ''}`}></div>
                        <div className={`h-full ${['approved', 'submitted', 'completed'].includes(order.status) ? 'bg-success w-1/4' : ['payment_pending', 'payment_verification'].includes(order.status) ? 'bg-warning w-1/4' : ''}`}></div>
                        <div className={`h-full ${['submitted', 'completed'].includes(order.status) ? 'bg-success w-1/4' : ''}`}></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-navy-50 md:w-48 p-6 flex flex-col items-center justify-center border-t md:border-t-0 md:border-r border-navy-100 group-hover:bg-primary-50 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-primary-500 mb-3 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={isFinished ? "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" : "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"} />
                      </svg>
                    </div>
                    <span className="text-sm font-bold text-navy-700">
                      {isFinished ? 'عرض التفاصيل' : needsAction ? 'متابعة الطلب' : 'تتبع الحالة'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
