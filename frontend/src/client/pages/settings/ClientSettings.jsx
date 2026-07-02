import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../../common/services/api'
import toast from 'react-hot-toast'
import SEO from '../../../common/components/SEO'

export default function ClientSettings() {
  const [profile, setProfile] = useState({ full_name: '', email: '', phone: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/users/profile')
      .then(({ data }) => {
        const u = data.data || data
        setProfile({ full_name: u.full_name || '', email: u.email || '', phone: u.phone || '' })
      })
      .catch(() => toast.error('فشل تحميل الملف الشخصي'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.patch('/users/profile', profile)
      toast.success('تم حفظ التغييرات')
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'فشل الحفظ')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="max-w-2xl mx-auto px-4 py-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-32" /><div className="h-48 bg-gray-200 rounded-2xl" /></div></div>
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <SEO title="الإعدادات" url="/my-account/settings" />
      <Link to="/my-account" className="text-sm text-primary-600 hover:text-primary-700 mb-4 inline-block">
        &larr; العودة للحساب
      </Link>
      <h1 className="text-2xl font-bold text-navy-900 mb-6">الإعدادات</h1>

      <form onSubmit={handleSave} className="bg-white rounded-2xl p-8 border border-navy-100 space-y-6">
        <div>
          <label className="block text-sm font-bold text-navy-700 mb-2">الاسم الكامل</label>
          <input
            type="text"
            value={profile.full_name}
            onChange={(e) => setProfile(p => ({ ...p, full_name: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-navy-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-navy-700 mb-2">البريد الإلكتروني</label>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => setProfile(p => ({ ...p, email: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-navy-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
            dir="ltr"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-navy-700 mb-2">رقم الهاتف</label>
          <input
            type="tel"
            value={profile.phone}
            disabled
            className="w-full px-4 py-3 rounded-xl border border-navy-200 bg-navy-50 text-navy-400 cursor-not-allowed"
            dir="ltr"
          />
          <p className="text-xs text-navy-400 mt-1">لا يمكن تغيير رقم الهاتف</p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-primary-500 text-white py-3 rounded-xl font-bold hover:bg-primary-600 transition-colors disabled:opacity-50"
        >
          {saving ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
        </button>
      </form>
    </div>
  )
}
