import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../../common/services/api'
import toast from 'react-hot-toast'
import SEO from '../../../common/components/SEO'
import Pagination from '../../../common/components/Pagination'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [meta, setMeta] = useState({ page: 1, total: 0, total_pages: 1 })
  const [loading, setLoading] = useState(true)

  const load = async (page = 1) => {
    setLoading(true)
    try {
      const { data } = await api.get('/notifications', { params: { page, limit: 20 } })
      setNotifications(data.data || [])
      setMeta(data.meta || { page: 1, total: 0, total_pages: 1 })
    } catch (err) {
      toast.error('فشل تحميل الإشعارات')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`)
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n))
    } catch { /* ignore */ }
  }

  const typeIcons = {
    order_status: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    payment: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    result: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    system: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <SEO title="الإشعارات" url="/my-account/notifications" />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">الإشعارات</h1>
          <p className="text-navy-500 text-sm">آخر التحديثات على طلباتك</p>
        </div>
        <Link to="/my-account" className="text-sm text-primary-600 hover:text-primary-700 font-bold">
          العودة للحساب
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20 text-navy-400">جارٍ التحميل...</div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-navy-100">
          <svg className="w-16 h-16 text-navy-200 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <p className="text-navy-500 font-bold text-lg">لا توجد إشعارات</p>
          <p className="text-navy-400 text-sm mt-1">ستظهر هنا آخر التحديثات على طلباتك</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer hover:shadow-md ${
                n.is_read ? 'border-navy-100' : 'border-primary-200 shadow-sm'
              }`}
              onClick={() => !n.is_read && markAsRead(n.id)}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  n.is_read ? 'bg-navy-100 text-navy-500' : 'bg-primary-100 text-primary-600'
                }`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={typeIcons[n.type] || typeIcons.system} />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${n.is_read ? 'text-navy-700' : 'text-navy-900 font-bold'}`}>
                    {n.title}
                  </p>
                  <p className={`text-xs mt-1 ${n.is_read ? 'text-navy-400' : 'text-navy-600'}`}>
                    {n.message}
                  </p>
                  <p className="text-xs text-navy-300 mt-2">
                    {new Date(n.created_at).toLocaleDateString('ar-YE', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {!n.is_read && <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 shrink-0"></span>}
              </div>
            </div>
          ))}

          {meta.total_pages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination page={meta.page} totalPages={meta.total_pages} onPageChange={load} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
