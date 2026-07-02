import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '@/common/services/api'
import toast from 'react-hot-toast'
import SEO from '@/common/components/SEO'

const tabs = [
  { id: 'pricing', label: 'التسعير', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'accounts', label: 'حسابات الدفع', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
  { id: 'season', label: 'الموسم', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id: 'limits', label: 'حدود السرعة', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { id: 'api-keys', label: 'مفاتيح API', icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z' },
]

const defaultSettings = {
  pricing: { total_price: 20 },
  payment_accounts: [],
  season: { active: false, start_date: '', end_date: '' },
  rate_limits: { auth_login: '5/min', auth_register: '3/hour', orders_create: '10/min', orders_status: '30/min' },
}

export default function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') || 'pricing'
  const [settings, setSettings] = useState(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/admin/settings')
      .then(({ data }) => { if (data.data) setSettings(data.data) })
      .catch((err) => toast.error(err.response?.data?.error?.message || 'فشل تحميل الإعدادات'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.patch('/admin/settings', settings)
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
    return <div className="animate-pulse space-y-6"><div className="h-6 bg-gray-200 rounded w-32" /><div className="h-48 bg-gray-200 rounded-xl" /></div>
  }

  return (
    <div>
      <SEO title="الإعدادات" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-navy-900">الإعدادات</h1>
        <button onClick={handleSave} disabled={saving} className="bg-primary-500 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary-600 transition-colors disabled:opacity-50 shadow-sm">
          {saving ? 'جارٍ الحفظ...' : 'حفظ الإعدادات'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setSearchParams({ tab: t.id })}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              tab === t.id ? 'bg-primary-500 text-white shadow-sm' : 'bg-white text-navy-500 hover:bg-navy-50 border border-navy-200'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={t.icon} />
            </svg>
            {t.label}
          </button>
        ))}
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Pricing Tab */}
        {tab === 'pricing' && (
          <div className="bg-white rounded-2xl p-6 border border-navy-100">
            <h2 className="text-lg font-bold text-navy-900 mb-4">التسعير</h2>
            <div className="max-w-xs">
              <label className="block text-sm font-bold text-navy-700 mb-2">سعر التسجيل (ريال يمني)</label>
              <input
                type="number"
                min={0}
                value={settings.pricing?.total_price || 0}
                onChange={(e) => setSettings(prev => ({ ...prev, pricing: { ...prev.pricing, total_price: Number(e.target.value) } }))}
                className="w-full border border-navy-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>
        )}

        {/* Accounts Tab */}
        {tab === 'accounts' && (
          <div className="bg-white rounded-2xl p-6 border border-navy-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-navy-900">حسابات الدفع</h2>
              <button onClick={addAccount} className="text-primary-500 hover:text-primary-700 text-sm font-bold">
                + إضافة حساب
              </button>
            </div>
            {(settings.payment_accounts || []).length === 0 ? (
              <p className="text-navy-400 text-sm text-center py-8">لا توجد حسابات دفع. أضف حساباً جديداً.</p>
            ) : (
              <div className="space-y-4">
                {settings.payment_accounts.map((account, idx) => (
                  <div key={idx} className="border border-navy-100 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-navy-700">حساب {idx + 1}</span>
                      <button onClick={() => removeAccount(idx)} className="text-error hover:text-red-700 text-sm font-bold">حذف</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-navy-400 mb-1">اسم الحساب</label>
                        <input type="text" value={account.name} onChange={(e) => updateAccount(idx, 'name', e.target.value)} className="w-full border border-navy-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none" placeholder="كريمي" />
                      </div>
                      <div>
                        <label className="block text-xs text-navy-400 mb-1">رقم الحساب</label>
                        <input type="text" value={account.account_number} onChange={(e) => updateAccount(idx, 'account_number', e.target.value)} className="w-full border border-navy-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none" placeholder="رقم الحساب" />
                      </div>
                      <div>
                        <label className="block text-xs text-navy-400 mb-1">المزود</label>
                        <input type="text" value={account.provider} onChange={(e) => updateAccount(idx, 'provider', e.target.value)} className="w-full border border-navy-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none" placeholder="كريم" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Season Tab */}
        {tab === 'season' && (
          <div className="bg-white rounded-2xl p-6 border border-navy-100">
            <h2 className="text-lg font-bold text-navy-900 mb-4">الموسم الحالي</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input type="checkbox" id="season_active" checked={settings.season?.active || false}
                  onChange={(e) => setSettings(prev => ({ ...prev, season: { ...prev.season, active: e.target.checked } }))}
                  className="w-4 h-4 rounded border-navy-300 text-primary-500 focus:ring-primary-500" />
                <label htmlFor="season_active" className="text-sm text-navy-700">الموسم نشط</label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-navy-700 mb-2">تاريخ البداية</label>
                  <input type="date" value={settings.season?.start_date || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, season: { ...prev.season, start_date: e.target.value } }))}
                    className="w-full border border-navy-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-navy-700 mb-2">تاريخ النهاية</label>
                  <input type="date" value={settings.season?.end_date || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, season: { ...prev.season, end_date: e.target.value } }))}
                    className="w-full border border-navy-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rate Limits Tab */}
        {tab === 'limits' && (
          <div className="bg-white rounded-2xl p-6 border border-navy-100">
            <h2 className="text-lg font-bold text-navy-900 mb-4">حدود السرعة (Rate Limits)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(settings.rate_limits || {}).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-bold text-navy-700 mb-2">
                    {({ auth_login: 'تسجيل الدخول', auth_register: 'التسجيل', orders_create: 'إنشاء طلب', orders_status: 'تحديث حالة' })[key] || key}
                  </label>
                  <input type="text" value={value}
                    onChange={(e) => setSettings(prev => ({ ...prev, rate_limits: { ...prev.rate_limits, [key]: e.target.value } }))}
                    className="w-full border border-navy-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none" dir="ltr" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* API Keys Tab */}
        {tab === 'api-keys' && (
          <div className="bg-white rounded-2xl p-6 border border-navy-100">
            <h2 className="text-lg font-bold text-navy-900 mb-4">مفاتيح API</h2>
            <p className="text-navy-500 text-sm mb-6">مفاتيح الوصول للخدمات الخارجية المستخدمة في النظام.</p>
            <div className="space-y-4">
              {[
                { name: '2Captcha API Key', key: 'cap_****_a1b2', status: 'نشط' },
                { name: 'Unsplash Access Key', key: 'uns_****_c3d4', status: 'نشط' },
                { name: 'AI Service Secret', key: 'ai_****_e5f6', status: 'نشط' },
              ].map((k, i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-navy-100 rounded-xl">
                  <div>
                    <p className="font-bold text-navy-900 text-sm">{k.name}</p>
                    <p className="text-xs text-navy-400 font-mono" dir="ltr">{k.key}</p>
                  </div>
                  <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-bold bg-success/10 text-success border border-success/20">
                    {k.status}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-navy-400 mt-4">* يتم إدارة المفاتيح عبر متغيرات البيئة في ملف .env</p>
          </div>
        )}
      </div>
    </div>
  )
}
