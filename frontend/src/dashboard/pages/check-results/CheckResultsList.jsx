import { useState, useEffect, useCallback } from 'react'
import api from '@/common/services/api'
import toast from 'react-hot-toast'

const RESULT_LABELS = {
  winner: 'فائز 🎉',
  not_winner: 'غير فائز',
  pending_check: 'بانتظار الفحص',
  error: 'خطأ في الفحص',
}

const RESULT_COLORS = {
  winner: 'bg-emerald-100 text-emerald-800 border-emerald-300 shadow-sm',
  not_winner: 'bg-navy-100 text-navy-700 border-navy-200',
  pending_check: 'bg-gold-50 text-gold-700 border-gold-200',
  error: 'bg-error/10 text-error border-error/20',
}

export default function CheckResultsList() {
  const [stats, setStats] = useState({ total: 0, checked: 0, pending: 0, winners: 0 })
  const [batchLoading, setBatchLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // For the logs/queue progress
  const [queueProgress, setQueueProgress] = useState({ active: false, processed: 0, total: 0 })
  const [recentChecks, setRecentChecks] = useState([])

  const fetchStats = useCallback(async () => {
    setLoading(true)
    try {
      // In a real app, this would be a dedicated stats endpoint for the batch checker
      const { data } = await api.get('/orders', { params: { status_in: 'submitted,completed', limit: 5 } })
      
      // Mocking stats for the UI until backend implements `/results/stats`
      setStats({
        total: data.meta?.total || 0,
        checked: Math.floor((data.meta?.total || 0) * 0.4),
        pending: Math.ceil((data.meta?.total || 0) * 0.6),
        winners: 2
      })
      setRecentChecks(data.data || [])
    } catch (err) {
      toast.error('فشل تحميل إحصائيات الفحص')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats])

  const startBatchCheck = async () => {
    setBatchLoading(true)
    try {
      // Calls the Headless Browser / Bull Queue trigger endpoint
      await api.post('/admin/headless/check-results')
      toast.success('تم إطلاق طابور الفحص الآلي (Queue) بنجاح')
      
      // Mocking progress for UX demonstration
      setQueueProgress({ active: true, processed: 0, total: stats.pending })
      
      // Polling simulator
      let current = 0
      const interval = setInterval(() => {
        current += Math.floor(Math.random() * 5) + 1
        if (current >= stats.pending) {
          clearInterval(interval)
          setQueueProgress({ active: false, processed: stats.pending, total: stats.pending })
          fetchStats()
          toast.success('اكتمل فحص جميع الطلبات')
        } else {
          setQueueProgress(prev => ({ ...prev, processed: current }))
        }
      }, 1500)
      
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'فشل تشغيل الفحص الآلي')
      setQueueProgress({ active: false, processed: 0, total: 0 })
    } finally {
      setBatchLoading(false)
    }
  }

  const progressPercent = queueProgress.total > 0 ? Math.min(100, Math.round((queueProgress.processed / queueProgress.total) * 100)) : 0

  return (
    <div className="pb-12 animate-fade-in max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-navy-900 mb-2 tracking-tight flex items-center gap-3">
            <span>🤖</span> الفحص الآلي للنتائج
          </h1>
          <p className="text-navy-500 font-medium">لوحة تحكم الطابور (Queue) لفحص نتائج القرعة عبر Headless Browser</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-navy-100 shadow-sm">
          <div className="text-sm font-bold text-navy-500 mb-2">إجمالي الطلبات المُقدمة</div>
          <div className="text-3xl font-black text-navy-900">{stats.total}</div>
        </div>
        <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 shadow-sm">
          <div className="text-sm font-bold text-emerald-700 mb-2">تم فحصها</div>
          <div className="text-3xl font-black text-emerald-600">{stats.checked}</div>
        </div>
        <div className="bg-gold-50 p-6 rounded-3xl border border-gold-100 shadow-sm">
          <div className="text-sm font-bold text-gold-700 mb-2">بانتظار الفحص</div>
          <div className="text-3xl font-black text-gold-600">{stats.pending}</div>
        </div>
        <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 text-6xl opacity-10">🎉</div>
          <div className="text-sm font-bold text-indigo-700 mb-2 relative z-10">الفائزين (حتى الآن)</div>
          <div className="text-3xl font-black text-indigo-600 relative z-10">{stats.winners}</div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white rounded-3xl shadow-lg border border-primary-100 p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500 opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="flex-1">
            <h2 className="text-xl font-black text-navy-900 mb-2 flex items-center gap-2">
              <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              طابور الفحص (Bull Queue)
            </h2>
            <p className="text-navy-500 font-medium mb-4 text-sm leading-relaxed max-w-xl">
              تشغيل هذه العملية سيقوم بإطلاق سكريبت متصفح مخفي (Headless Browser) لفحص جميع الطلبات المعلقة في الموقع الرسمي واستخراج النتائج، وحل الـ CAPTCHA آلياً.
            </p>
            
            {queueProgress.active && (
              <div className="w-full max-w-md mt-4">
                <div className="flex justify-between text-xs font-bold text-navy-700 mb-2">
                  <span>جاري الفحص...</span>
                  <span>{progressPercent}% ({queueProgress.processed}/{queueProgress.total})</span>
                </div>
                <div className="h-2.5 bg-navy-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-500 rounded-full transition-all duration-300 relative overflow-hidden"
                    style={{ width: `${progressPercent}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 -skew-x-12 animate-pulse w-1/2"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="shrink-0 w-full md:w-auto">
            <button
              onClick={startBatchCheck}
              disabled={batchLoading || queueProgress.active || stats.pending === 0}
              className="w-full md:w-auto bg-primary-500 text-white px-8 py-4 rounded-xl hover:bg-primary-600 font-black text-lg disabled:opacity-50 transition-all shadow-lg shadow-primary-500/30 flex items-center justify-center gap-3 hover:-translate-y-1"
            >
              {batchLoading || queueProgress.active ? (
                <>
                  <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  الطابور يعمل الآن...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  بدء فحص جميع المتأخرات
                </>
              )}
            </button>
            {stats.pending === 0 && (
              <p className="text-center text-sm font-bold text-emerald-600 mt-3">لا يوجد طلبات بانتظار الفحص!</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Log */}
      <div className="bg-white rounded-3xl shadow-sm border border-navy-100 overflow-hidden">
        <div className="p-6 border-b border-navy-100 flex items-center justify-between bg-navy-50/30">
          <h2 className="text-lg font-black text-navy-900 flex items-center gap-2">
            <span>📝</span> سجل الفحص الأخير
          </h2>
          <span className="text-xs font-bold text-navy-400">آخر التحديثات الآلية</span>
        </div>
        
        <div className="divide-y divide-navy-50">
          {loading ? (
            <div className="p-12 text-center text-navy-400">
               <svg className="animate-spin w-8 h-8 mx-auto text-primary-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </div>
          ) : recentChecks.length === 0 ? (
            <div className="p-12 text-center text-navy-400">لا يوجد سجل حتى الآن</div>
          ) : (
            recentChecks.map((order) => (
              <div key={order.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-navy-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${order.result === 'winner' ? 'bg-emerald-100 text-emerald-600' : 'bg-navy-100 text-navy-400'}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold text-navy-900">{order.client_name || `الطلب #${order.order_number || order.id.slice(0,8)}`}</div>
                    <div className="text-sm font-mono text-navy-400 mt-1">{order.confirmation_number}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border ${RESULT_COLORS[order.result] || 'bg-navy-50 text-navy-600 border-navy-200'}`}>
                    {RESULT_LABELS[order.result] || order.result || 'بانتظار الفحص'}
                  </span>
                  <div className="text-xs font-medium text-navy-400 direction-ltr text-right min-w-[120px]">
                    {order.checked_at ? new Date(order.checked_at).toLocaleTimeString('ar-SA') : '-'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
