import { useState, useEffect } from 'react'
import api from '@/common/services/api'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/common/stores/authStore'
import { formatDateLong, formatDateTime, getRoleLabel } from '@/common/utils/formatters'
import { ROLE_COLORS } from '@/common/utils/constants'

export default function ProfilePage() {
  const { checkAuth } = useAuthStore()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ full_name: '', email: '' })

  useEffect(() => {
    api.get('/users/profile')
      .then(({ data }) => {
        setProfile(data.data)
        setForm({ full_name: data.data.full_name || '', email: data.data.email || '' })
      })
      .catch((err) => toast.error(err.response?.data?.error?.message || 'فشل تحميل الملف الشخصي'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data } = await api.patch('/users/profile', form)
      setProfile(data.data)
      checkAuth()
      toast.success('تم تحديث الملف الشخصي بنجاح')
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'فشل تحديث الملف الشخصي')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const hasChanges = form.full_name !== (profile?.full_name || '') || form.email !== (profile?.email || '')
  const stats = profile?.stats || {}

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">👤 الملف الشخصي</h1>
        <div className="animate-pulse space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex gap-6">
              <div className="w-20 h-20 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-48" />
                <div className="h-4 bg-gray-200 rounded w-32" />
                <div className="h-4 bg-gray-200 rounded w-40" />
              </div>
            </div>
          </div>
          <div className="h-48 bg-gray-200 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">👤 الملف الشخصي</h1>
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <p className="text-gray-400 text-lg">تعذر تحميل الملف الشخصي</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-primary-500 hover:text-primary-700 text-sm font-medium"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">👤 الملف الشخصي</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile header */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold text-2xl lg:text-3xl shrink-0">
                {profile.full_name?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-gray-800 truncate">{profile.full_name}</h2>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className={`inline-block text-xs px-2.5 py-0.5 rounded-full font-medium ${ROLE_COLORS[profile.role] || 'bg-gray-100 text-gray-700'}`}>
                    {getRoleLabel(profile.role)}
                  </span>
                  {profile.phone && (
                    <span className="text-sm text-gray-500" dir="ltr">{profile.phone}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Edit profile form */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="font-semibold mb-4">📝 تعديل الملف الشخصي</h2>
            <div className="space-y-4 max-w-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={handleChange('full_name')}
                  className="w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="الاسم الكامل"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={handleChange('email')}
                  className="w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="البريد الإلكتروني"
                  dir="ltr"
                />
              </div>
              <div className="pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving || !hasChanges}
                  className="bg-primary-500 text-white px-6 py-2.5 rounded-lg hover:bg-primary-600 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'جاري الحفظ...' : '💾 حفظ التغييرات'}
                </button>
              </div>
            </div>
          </div>

          {/* Change password section */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="font-semibold mb-4">🔑 تغيير كلمة المرور</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              <p className="font-medium mb-1">ملاحظة: نظام المصادقة يعتمد على OTP (رمز التحقق لمرة واحدة)</p>
              <p>يتم استخدام رمز التحقق المرسل إلى هاتفك للدخول، لا حاجة لكلمة مرور تقليدية. يمكنك تحديث رقم هاتفك من خلال التواصل مع الإدارة.</p>
            </div>
          </div>

          {/* Account details */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="font-semibold mb-4">ℹ️ معلومات الحساب</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">رقم الهاتف</span>
                <span className="font-medium text-gray-800" dir="ltr">{profile.phone || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">البريد الإلكتروني</span>
                <span className="font-medium text-gray-800">{profile.email || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">الدور</span>
                <span className={`inline-block text-xs px-2.5 py-0.5 rounded-full font-medium ${ROLE_COLORS[profile.role] || 'bg-gray-100 text-gray-700'}`}>
                  {getRoleLabel(profile.role)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">عضو منذ</span>
                <span className="font-medium text-gray-800">{formatDateLong(profile.created_at)}</span>
              </div>
              {profile.last_login && (
                <div className="flex justify-between">
                  <span className="text-gray-500">آخر تسجيل دخول</span>
                  <span className="font-medium text-gray-800">{formatDateTime(profile.last_login)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order stats */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="font-semibold mb-4">📋 إحصائيات الطلبات</h2>
            {Object.keys(stats).length > 0 ? (
              <div className="space-y-4">
                <div className="bg-primary-50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-primary-600">{stats.total || 0}</div>
                  <div className="text-sm text-primary-700 mt-1">إجمالي الطلبات</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.completed || 0}</div>
                    <div className="text-xs text-green-700 mt-1">مكتمل</div>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-yellow-600">{stats.pending || 0}</div>
                    <div className="text-xs text-yellow-700 mt-1">قيد الانتظار</div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-sm text-center py-6">لا توجد إحصائيات متاحة</p>
            )}
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="font-semibold mb-4">⚡ إجراءات سريعة</h2>
            <div className="space-y-2">
              <a
                href="/dashboard/orders"
                className="block w-full text-center py-2.5 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 font-medium text-sm transition-colors"
              >
                📋 عرض الطلبات
              </a>
              <a
                href="/dashboard/payments"
                className="block w-full text-center py-2.5 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 font-medium text-sm transition-colors"
              >
                💳 عرض المدفوعات
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
