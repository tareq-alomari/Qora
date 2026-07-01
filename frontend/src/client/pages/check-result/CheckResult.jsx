import { useState, useEffect } from 'react'
import api from '@common/services/api'
import { Link } from 'react-router-dom'

export default function CheckResult() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmationNumber, setConfirmationNumber] = useState('')
  const [result, setResult] = useState(null)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders', {
          params: { status: 'submitted,completed', limit: 50 },
        })
        setOrders(data.data || [])
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const handleCheck = async (e) => {
    e.preventDefault()
    if (!confirmationNumber.trim()) return
    setChecking(true)
    try {
      const { data } = await api.get(`/check-result/${encodeURIComponent(confirmationNumber.trim())}`)
      setResult({ selected: data.data.result === 'winner', message: data.data.message })
    } catch {
      setResult({ selected: false, message: 'لم يتم العثور على النتيجة أو أن الرقم غير صحيح.' })
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="min-h-[80vh] bg-navy-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-10">
        
        <div className="text-center">
          <h1 className="text-4xl font-black text-navy-900 mb-4 tracking-tight">فحص النتيجة</h1>
          <p className="text-lg text-navy-500 max-w-xl mx-auto">
            أدخل رقم التأكيد (Confirmation Number) الخاص بك للتحقق من نتيجة قرعة التنوع (DV Lottery) بشكل مباشر.
          </p>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-navy-100/50 border border-navy-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -z-10"></div>
          
          <form onSubmit={handleCheck} className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto relative z-10">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <svg className="w-6 h-6 text-navy-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={confirmationNumber}
                onChange={(e) => setConfirmationNumber(e.target.value)}
                placeholder="أدخل رقم التأكيد (مثل: 2024xxxxxxxx)"
                className="w-full bg-navy-50/50 border border-navy-200 rounded-xl pr-12 pl-4 py-4 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all font-bold text-navy-900 direction-ltr text-center sm:text-left placeholder-navy-300"
                required
              />
            </div>
            <button
              type="submit"
              disabled={checking}
              className="bg-primary-500 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-primary-500/30 hover:bg-primary-600 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 min-w-[140px] flex justify-center items-center gap-2"
            >
              {checking ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  جاري...
                </>
              ) : (
                'تحقق الآن'
              )}
            </button>
          </form>

          {result && (
            <div className={`mt-10 p-8 rounded-2xl text-center shadow-inner ${result.selected ? 'bg-gradient-to-b from-emerald-50 to-white border border-emerald-200' : 'bg-navy-50 border border-navy-100'}`}>
              {result.selected ? (
                <>
                  <div className="text-6xl mb-4 animate-bounce">🎉</div>
                  <h3 className="text-2xl font-black text-emerald-600 mb-2">ألف مبروك!</h3>
                  <p className="text-emerald-800 font-bold text-lg">{result.message}</p>
                  <div className="mt-6 flex justify-center">
                    <Link to="/contact" className="text-sm font-bold text-emerald-600 hover:text-emerald-800 underline">
                      تواصل معنا لاستكمال الإجراءات
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-6xl mb-4 opacity-70">😔</div>
                  <h3 className="text-xl font-bold text-navy-800 mb-2">لم يحالفك الحظ</h3>
                  <p className="text-navy-500 font-medium">{result.message || 'حظاً أوفر في المرة القادمة.'}</p>
                </>
              )}
            </div>
          )}
        </div>

        <div className="pt-6">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="font-bold text-2xl text-navy-900">طلباتك المقدمة السابقة</h2>
            <div className="h-px flex-1 bg-navy-200"></div>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-navy-100 p-10 text-center shadow-sm">
              <p className="text-navy-400 font-medium mb-4">لا توجد لديك طلبات مقدمة في النظام للتحقق من نتيجتها.</p>
              <Link to="/lottery" className="text-primary-600 font-bold hover:underline">
                أنشئ طلباً جديداً الآن
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {orders.map((order) => (
                <div key={order.order_id} className="bg-white p-6 rounded-2xl shadow-sm border border-navy-100 flex flex-col sm:flex-row items-center justify-between gap-4 hover:border-primary-200 transition-colors group cursor-pointer" onClick={() => setConfirmationNumber(order.confirmation_number || '')}>
                  <div className="text-center sm:text-right w-full sm:w-auto">
                    <p className="font-bold text-lg text-navy-900 mb-1">{order.order_number}</p>
                    {order.confirmation_number ? (
                      <p className="text-sm font-semibold text-primary-600 font-mono direction-ltr">
                        {order.confirmation_number}
                      </p>
                    ) : (
                      <p className="text-sm font-medium text-warning">الرقم غير متوفر بعد</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-end">
                    <span className="bg-navy-50 text-navy-600 border border-navy-200 text-xs px-4 py-1.5 rounded-full font-bold">
                      {order.status === 'completed' ? 'مكتمل' : 'مقدم'}
                    </span>
                    {order.confirmation_number && (
                      <button className="text-sm text-primary-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        استخدام
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
