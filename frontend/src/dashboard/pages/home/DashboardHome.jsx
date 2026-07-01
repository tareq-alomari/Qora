import { useState, useEffect } from 'react'
import api from '@/common/services/api'
import toast from 'react-hot-toast'

const STATUS_LABELS = {
  draft: 'مسودة', data_entry_complete: 'بيانات مكتملة', photo_pending: 'بانتظار الصورة',
  photo_rejected: 'الصورة مرفوضة', photo_accepted: 'الصورة مقبولة',
  payment_pending: 'بانتظار الدفع', payment_verification: 'تدقيق الدفع',
  needs_correction: 'يحتاج تعديل', approved: 'مقبول', submitted: 'مقدم',
  completed: 'مكتمل', cancelled: 'ملغي',
}

const METHOD_LABELS = { credit: 'بطاقة ائتمان', bank: 'تحويل بنكي', cash: 'نقدي', mobile_money: 'موبايل موني', other: 'أخرى' }

function numberFormat(n) {
  return new Intl.NumberFormat('ar-SA').format(n || 0)
}

function currencyFormat(n) {
  return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'YER', minimumFractionDigits: 0 }).format(n || 0)
}

export default function DashboardHome() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/stats')
      .then(({ data }) => setStats(data.data))
      .catch((err) => toast.error(err.response?.data?.error?.message || 'فشل تحميل الإحصائيات'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-navy-200/50 rounded-xl animate-pulse mb-8" />
        
        {/* Skeleton Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-navy-100 animate-pulse h-36" />
          ))}
        </div>
        
        {/* Skeleton Revenue */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-navy-100 animate-pulse h-40" />
          ))}
        </div>

        {/* Skeleton Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-3xl border border-navy-100 h-80 animate-pulse" />
          <div className="bg-white p-8 rounded-3xl border border-navy-100 h-80 animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-navy-900 mb-2 tracking-tight">نظرة عامة 📊</h1>
          <p className="text-navy-500 font-medium">مرحباً بك في لوحة تحكم الإدارة. إليك ملخص لأداء النظام.</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-navy-400 bg-white px-4 py-2 rounded-xl shadow-sm border border-navy-100">
          <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          آخر تحديث: الآن
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="إجمالي الطلبات" 
          value={numberFormat(stats?.total)} 
          color="primary"
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />}
        />
        <StatCard 
          label="طلبات اليوم" 
          value={numberFormat(stats?.today)} 
          color="emerald"
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
        />
        <StatCard 
          label="طلبات هذا الأسبوع" 
          value={numberFormat(stats?.this_week)} 
          color="gold"
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />}
        />
        <StatCard 
          label="طلبات هذا الشهر" 
          value={numberFormat(stats?.this_month)} 
          color="purple"
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />}
        />
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <RevenueCard label="إجمالي الإيرادات" value={currencyFormat(stats?.revenue_total)} subtitle="منذ بداية النظام" />
        <RevenueCard label="إيرادات اليوم" value={currencyFormat(stats?.revenue_today)} subtitle="آخر 24 ساعة" featured />
        <RevenueCard label="إيرادات الأسبوع" value={currencyFormat(stats?.revenue_this_week)} subtitle="آخر 7 أيام" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Orders by Status */}
        <div className="bg-white rounded-3xl shadow-sm border border-navy-100 p-8 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-navy-50 text-navy-500 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-navy-900">توزيع الطلبات حسب الحالة</h2>
          </div>
          
          {stats?.by_status && Object.keys(stats.by_status).length > 0 ? (
            <div className="space-y-5">
              {Object.entries(stats.by_status).map(([key, count], idx) => {
                const max = Math.max(...Object.values(stats.by_status))
                const percentage = Math.min((count / max) * 100, 100)
                
                return (
                  <div key={key} className="group">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-sm font-bold text-navy-700">{STATUS_LABELS[key] || key}</span>
                      <span className="text-sm font-black text-primary-600">{numberFormat(count)}</span>
                    </div>
                    <div className="bg-navy-50 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-primary-500 h-full rounded-full transition-all duration-1000 ease-out group-hover:bg-primary-400"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-navy-400">
              <svg className="w-12 h-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="font-semibold">لا توجد بيانات متاحة</p>
            </div>
          )}
        </div>

        {/* Revenue by Method */}
        <div className="bg-white rounded-3xl shadow-sm border border-navy-100 p-8 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gold-50 text-gold-500 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-navy-900">الإيرادات حسب طريقة الدفع</h2>
          </div>

          {stats?.by_method && Object.keys(stats.by_method).length > 0 ? (
            <div className="space-y-5">
              {Object.entries(stats.by_method).map(([key, amount]) => {
                const max = Math.max(...Object.values(stats.by_method))
                const percentage = Math.min((amount / max) * 100, 100)
                
                return (
                  <div key={key} className="group">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-sm font-bold text-navy-700">{METHOD_LABELS[key] || key}</span>
                      <span className="text-sm font-black text-gold-600 direction-ltr">{currencyFormat(amount)}</span>
                    </div>
                    <div className="bg-navy-50 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gold-400 h-full rounded-full transition-all duration-1000 ease-out group-hover:bg-gold-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-navy-400">
              <svg className="w-12 h-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-semibold">لا توجد إيرادات بعد</p>
            </div>
          )}
        </div>
      </div>

      {/* AI Stats */}
      {stats?.ai_stats && (
        <div className="bg-gradient-to-br from-navy-900 to-navy-800 rounded-3xl shadow-xl overflow-hidden relative">
          <div className="absolute inset-0 bg-primary-500/10 opacity-50 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-400/20 via-transparent to-transparent"></div>
          
          <div className="p-8 lg:p-10 relative z-10">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-primary-300 backdrop-blur-sm border border-white/10 shadow-inner">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-white">إحصائيات الذكاء الاصطناعي (AI) 🤖</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <AICard label="إجمالي الصور المفحوصة" value={numberFormat(stats.ai_stats.total_checked)} color="text-white" />
              <AICard label="مقبولة تلقائياً" value={numberFormat(stats.ai_stats.accepted)} color="text-success" />
              <AICard label="مرفوضة بذكاء" value={numberFormat(stats.ai_stats.rejected)} color="text-error" />
              <AICard label="متوسط دقة الفحص" value={stats.ai_stats.avg_confidence ? `${stats.ai_stats.avg_confidence}%` : '-'} color="text-primary-300" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, color, icon }) {
  const colors = {
    primary: 'bg-primary-50 text-primary-600 border-primary-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    gold: 'bg-gold-50 text-gold-600 border-gold-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-navy-100 p-6 flex flex-col hover:shadow-md transition-shadow group">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border transition-transform group-hover:scale-110 ${colors[color]}`}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {icon}
          </svg>
        </div>
      </div>
      <div className="text-3xl font-black text-navy-900 tracking-tight mb-1">{value}</div>
      <div className="text-sm font-semibold text-navy-500">{label}</div>
    </div>
  )
}

function RevenueCard({ label, value, subtitle, featured }) {
  return (
    <div className={`rounded-3xl p-8 border transition-all hover:-translate-y-1 hover:shadow-lg ${
      featured 
        ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-primary-500/30 border-transparent' 
        : 'bg-white text-navy-900 shadow-sm border-navy-100'
    }`}>
      <div className={`text-sm font-bold mb-2 ${featured ? 'text-primary-100' : 'text-navy-500'}`}>{label}</div>
      <div className={`text-3xl lg:text-4xl font-black font-mono tracking-tighter direction-ltr mb-3 ${featured ? 'text-white' : 'text-success'}`}>{value}</div>
      <div className={`text-xs font-semibold ${featured ? 'text-primary-200' : 'text-navy-400'}`}>{subtitle}</div>
    </div>
  )
}

function AICard({ label, value, color }) {
  return (
    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-colors">
      <div className={`text-3xl md:text-4xl font-black mb-2 tracking-tight ${color}`}>{value}</div>
      <div className="text-sm font-medium text-navy-300">{label}</div>
    </div>
  )
}
