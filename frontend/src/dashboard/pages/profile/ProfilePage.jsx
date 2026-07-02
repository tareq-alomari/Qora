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
      <div className="animate-fade-in">
        <h1 className="text-3xl font-black text-navy-900 mb-8">👤 الملف الشخصي</h1>
        <div className="animate-pulse space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-navy-100 p-8">
            <div className="flex gap-6 items-center">
              <div className="w-24 h-24 bg-navy-200 rounded-full" />
              <div className="flex-1 space-y-4">
                <div className="h-6 bg-navy-200 rounded w-48" />
                <div className="h-4 bg-navy-100 rounded w-32" />
                <div className="h-4 bg-navy-100 rounded w-40" />
              </div>
            </div>
          </div>
          <div className="h-64 bg-navy-50 rounded-3xl" />
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div>
        <h1 className="text-3xl font-black text-navy-900 mb-8">👤 الملف الشخصي</h1>
        <div className="bg-white rounded-3xl shadow-sm border border-navy-100 p-12 text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-navy-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <p className="text-navy-500 text-lg font-medium">تعذر تحميل الملف الشخصي</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-primary-50 text-primary-600 font-bold rounded-xl hover:bg-primary-100 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-12 animate-fade-in">
      <h1 className="text-3xl font-black text-navy-900 mb-8 tracking-tight">👤 الملف الشخصي</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Profile header */}
          <div className="bg-white rounded-3xl shadow-sm border border-navy-100 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500 opacity-5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="flex items-center gap-6 relative z-10">
              <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-tr from-primary-600 to-primary-400 text-white flex items-center justify-center font-black text-3xl lg:text-4xl shrink-0 shadow-lg shadow-primary-500/30 border-4 border-white">
                {profile.full_name?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0">
                <h2 className="text-2xl font-black text-navy-900 truncate tracking-tight">{profile.full_name}</h2>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className={`inline-block text-xs px-3 py-1 rounded-full font-bold border ${ROLE_COLORS[profile.role] || 'bg-navy-50 text-navy-600 border-navy-200'}`}>
                    {getRoleLabel(profile.role)}
                  </span>
                  {profile.phone && (
                    <span className="text-sm font-medium text-navy-500 bg-navy-50 px-3 py-1 rounded-full border border-navy-100 direction-ltr">
                      {profile.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Edit profile form */}
          <div className="bg-white rounded-3xl shadow-sm border border-navy-100 p-8">
            <h2 className="text-xl font-black text-navy-900 mb-6 flex items-center gap-2">
              <span>📝</span> تعديل البيانات الأساسية
            </h2>
            <div className="space-y-6 max-w-xl">
              <div>
                <label className="block text-sm font-bold text-navy-700 mb-2">الاسم الكامل</label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={handleChange('full_name')}
                  className="w-full bg-navy-50 border border-navy-200 rounded-xl px-4 py-3 text-sm font-medium focus:bg-white focus:border-primary-300 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                  placeholder="الاسم الكامل"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-navy-700 mb-2">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={handleChange('email')}
                  className="w-full bg-navy-50 border border-navy-200 rounded-xl px-4 py-3 text-sm font-medium focus:bg-white focus:border-primary-300 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                  placeholder="البريد الإلكتروني"
                  dir="ltr"
                />
              </div>
              <div className="pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving || !hasChanges}
                  className="bg-primary-500 text-white px-8 py-3.5 rounded-xl hover:bg-primary-600 font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary-500/30 hover:-translate-y-0.5"
                >
                  {saving ? 'جاري الحفظ...' : '💾 حفظ التغييرات'}
                </button>
              </div>
            </div>
          </div>

          {/* Change password section */}
          <div className="bg-white rounded-3xl shadow-sm border border-navy-100 p-8">
            <h2 className="text-xl font-black text-navy-900 mb-6 flex items-center gap-2">
              <span>🔐</span> أمان الحساب
            </h2>
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6 flex gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm text-indigo-500">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <div>
                <h3 className="font-bold text-indigo-900 mb-1">تسجيل الدخول بدون كلمات مرور</h3>
                <p className="text-sm font-medium text-indigo-700/80 leading-relaxed">
                  نظام قرعة يعتمد على أمان متقدم باستخدام رمز التحقق المرسل للهاتف (OTP). 
                  لست بحاجة لتذكر كلمة مرور بعد اليوم. إذا احتجت لتغيير رقم هاتفك، يرجى التواصل مع مسؤول النظام (Admin).
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Account details */}
          <div className="bg-white rounded-3xl shadow-sm border border-navy-100 p-8">
            <h2 className="text-lg font-black text-navy-900 mb-6 flex items-center gap-2">
              <span>ℹ️</span> معلومات النظام
            </h2>
            <div className="space-y-4">
              <InfoRow label="رقم الهاتف الأساسي" value={profile.phone || '-'} dir="ltr" />
              <InfoRow label="البريد المعتمد" value={profile.email || '-'} />
              <InfoRow label="الصلاحية (الدور)" value={
                <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-bold border ${ROLE_COLORS[profile.role] || 'bg-navy-50 text-navy-600 border-navy-200'}`}>
                  {getRoleLabel(profile.role)}
                </span>
              } />
              <InfoRow label="تاريخ الانضمام" value={formatDateLong(profile.created_at)} />
              {profile.last_login && (
                <InfoRow label="آخر تسجيل دخول" value={formatDateTime(profile.last_login)} />
              )}
            </div>
          </div>

          {/* Order stats */}
          <div className="bg-white rounded-3xl shadow-sm border border-navy-100 p-8">
            <h2 className="text-lg font-black text-navy-900 mb-6 flex items-center gap-2">
              <span>📈</span> نشاطك في النظام
            </h2>
            {Object.keys(stats).length > 0 ? (
              <div className="space-y-4">
                <div className="bg-primary-50 rounded-2xl p-6 text-center border border-primary-100 relative overflow-hidden">
                  <div className="text-4xl font-black text-primary-600 relative z-10">{stats.total || 0}</div>
                  <div className="text-sm font-bold text-primary-700 mt-2 relative z-10">إجمالي الطلبات المُعالجة</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
                    <div className="text-2xl font-black text-emerald-600">{stats.completed || 0}</div>
                    <div className="text-xs font-bold text-emerald-700 mt-1">مكتمل</div>
                  </div>
                  <div className="bg-warning/10 border border-warning/20 rounded-2xl p-4 text-center">
                    <div className="text-2xl font-black text-warning-700">{stats.pending || 0}</div>
                    <div className="text-xs font-bold text-warning-800 mt-1">قيد الانتظار</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-navy-50 border-2 border-dashed border-navy-200 rounded-2xl p-8 text-center text-navy-400">
                <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                <p className="text-sm font-bold">لا توجد إحصائيات نشاط متاحة حتى الآن</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value, dir = 'rtl' }) {
  return (
    <div className="flex flex-col gap-1.5 pb-4 border-b border-navy-50 last:border-0 last:pb-0">
      <span className="text-xs font-bold text-navy-400">{label}</span>
      <span className="font-semibold text-navy-900" dir={dir}>{value}</span>
    </div>
  )
}
