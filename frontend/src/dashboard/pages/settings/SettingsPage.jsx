import { useState, useEffect } from 'react'
import api from '@/common/services/api'
import toast from 'react-hot-toast'

const defaultSettings = {
  pricing: {
    total_price: 20,
  },
  payment_accounts: [],
  season: {
    active: false,
    start_date: '',
    end_date: '',
  },
  rate_limits: {
    auth_login: '5/min',
    auth_register: '3/hour',
    orders_create: '10/min',
    orders_status: '30/min',
  },
}

export default function SettingsPage() {
  const [settings, setSettings] = useState(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/admin/settings')
      .then(({ data }) => {
        if (data.data) setSettings(data.data)
      })
      .catch((err) => toast.error(err.response?.data?.error?.message || 'فشل تحميل الإعدادات'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/admin/settings', settings)
      toast.success('تم حفظ الإعدادات بنجاح')
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'فشل حفظ الإعدادات')
    } finally {
      setSaving(false)
    }
  }

  const addAccount = () => {
    setSettings(prev => ({
      ...prev,
      payment_accounts: [...(prev.payment_accounts || []), { name: '', account_number: '', provider: '' }],
    }))
  }

  const updateAccount = (idx, field, value) => {
    setSettings(prev => {
      const accounts = [...(prev.payment_accounts || [])]
      accounts[idx] = { ...accounts[idx], [field]: value }
      return { ...prev, payment_accounts: accounts }
    })
  }

  const removeAccount = (idx) => {
    setSettings(prev => ({
      ...prev,
      payment_accounts: (prev.payment_accounts || []).filter((_, i) => i !== idx),
    }))
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-6 bg-gray-200 rounded w-32" />
        <div className="h-48 bg-gray-200 rounded-xl" />
        <div className="h-48 bg-gray-200 rounded-xl" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">⚙️ الإعدادات</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary-500 text-white px-6 py-2.5 rounded-lg hover:bg-primary-600 font-medium disabled:opacity-50"
        >
          {saving ? 'جاري الحفظ...' : '💾 حفظ الإعدادات'}
        </button>
      </div>

      <div className="space-y-6 max-w-3xl">
        {/* Pricing */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="font-semibold mb-4">💰 التسعير</h2>
          <div className="max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-1">سعر التسجيل (USD)</label>
            <input
              type="number"
              min={0}
              value={settings.pricing?.total_price || 0}
              onChange={(e) => setSettings(prev => ({ ...prev, pricing: { ...prev.pricing, total_price: Number(e.target.value) } }))}
              className="w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
        </div>

        {/* Payment Accounts */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">🏦 حسابات الدفع</h2>
            <button
              onClick={addAccount}
              className="text-primary-500 hover:text-primary-700 text-sm font-medium"
            >
              + إضافة حساب
            </button>
          </div>

          {(settings.payment_accounts || []).length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">لا توجد حسابات دفع. أضف حساباً جديداً.</p>
          ) : (
            <div className="space-y-4">
              {settings.payment_accounts.map((account, idx) => (
                <div key={idx} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">حساب {idx + 1}</span>
                    <button
                      onClick={() => removeAccount(idx)}
                      className="text-error hover:text-red-700 text-sm"
                    >
                      حذف
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">اسم الحساب</label>
                      <input
                        type="text"
                        value={account.name}
                        onChange={(e) => updateAccount(idx, 'name', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                        placeholder="مثل: كريمي"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">رقم الحساب</label>
                      <input
                        type="text"
                        value={account.account_number}
                        onChange={(e) => updateAccount(idx, 'account_number', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                        placeholder="رقم الحساب"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">المزود</label>
                      <input
                        type="text"
                        value={account.provider}
                        onChange={(e) => updateAccount(idx, 'provider', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                        placeholder="مثل: كريم"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Season */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="font-semibold mb-4">📅 الموسم</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="season_active"
                checked={settings.season?.active || false}
                onChange={(e) => setSettings(prev => ({ ...prev, season: { ...prev.season, active: e.target.checked } }))}
                className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
              />
              <label htmlFor="season_active" className="text-sm text-gray-700">الموسم نشط</label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ البداية</label>
                <input
                  type="date"
                  value={settings.season?.start_date || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, season: { ...prev.season, start_date: e.target.value } }))}
                  className="w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ النهاية</label>
                <input
                  type="date"
                  value={settings.season?.end_date || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, season: { ...prev.season, end_date: e.target.value } }))}
                  className="w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Rate Limits */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="font-semibold mb-4">🚦 حدود السرعة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(settings.rate_limits || {}).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {rateLimitLabel(key)}
                </label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    rate_limits: { ...prev.rate_limits, [key]: e.target.value },
                  }))}
                  className="w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  dir="ltr"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function rateLimitLabel(key) {
  const labels = {
    auth_login: 'تسجيل الدخول',
    auth_register: 'التسجيل',
    orders_create: 'إنشاء طلب',
    orders_status: 'تحديث حالة',
  }
  return labels[key] || key
}
