import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../../common/services/api'
import toast from 'react-hot-toast'
import SEO from '../../../common/components/SEO'

export default function OrderResult() {
  const { id } = useParams()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    if (!id) return
    api.get(`/orders/${id}`)
      .then(({ data }) => setResult(data.data))
      .catch((err) => toast.error(err.response?.data?.error?.message || 'فشل تحميل الطلب'))
      .finally(() => setLoading(false))
  }, [id])

  const handleCheckResult = async () => {
    setChecking(true)
    try {
      const { data } = await api.post(`/orders/${id}/check-result`, {})
      setResult((prev) => ({ ...prev, ...data.data }))
      toast.success('تم فحص النتيجة')
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'فشل فحص النتيجة')
    } finally {
      setChecking(false)
    }
  }

  if (loading) return <div className="text-center py-20 text-navy-400">جارٍ التحميل...</div>
  if (!result) return <div className="text-center py-20 text-navy-400">الطلب غير موجود</div>

  const isWinner = result.result_status === 'won'
  const hasResult = result.result_status && result.result_status !== 'pending'

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <SEO title={`نتيجة الطلب ${result.order_number || ''}`} />
      <Link to="/my-account" className="text-sm text-primary-600 hover:text-primary-700 mb-4 inline-block">
        &larr; العودة للطلبات
      </Link>

      <div className={`rounded-3xl p-8 md:p-12 text-center border-2 mb-8 ${
        hasResult
          ? isWinner
            ? 'bg-success/5 border-success/20'
            : 'bg-navy-50 border-navy-200'
          : 'bg-white border-navy-100'
      }`}>
        {hasResult ? (
          <>
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
              isWinner ? 'bg-success/10' : 'bg-navy-100'
            }`}>
              {isWinner ? (
                <svg className="w-10 h-10 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-10 h-10 text-navy-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <h1 className={`text-3xl md:text-4xl font-black mb-4 ${isWinner ? 'text-success' : 'text-navy-500'}`}>
              {isWinner ? 'مبروك! أنت فائز بالقرعة 🎉' : 'نأسف، لم توفق هذه المرة'}
            </h1>
            <p className={`text-lg mb-2 ${isWinner ? 'text-navy-700' : 'text-navy-400'}`}>
              {isWinner
                ? 'تم اختيارك في قرعة الهجرة العشوائية (DV Lottery). سيتم التواصل معك لاستكمال الإجراءات.'
                : 'حظاً أوفر في المرات القادمة. يمكنك التقديم مرة أخرى في الموسم القادم.'}
            </p>
            {result.confirmation_number && (
              <div className="inline-block bg-white rounded-2xl px-6 py-4 border border-navy-100 mt-6">
                <p className="text-xs text-navy-400 mb-1">رقم التأكيد (Confirmation Number)</p>
                <p className="text-xl font-black text-navy-900 tracking-wider font-mono" dir="ltr">
                  {result.confirmation_number}
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-gold-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gold-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-black text-navy-900 mb-4">النتيجة غير متاحة بعد</h1>
            <p className="text-lg text-navy-500 mb-8">
              لم يتم فحص نتيجة هذا الطلب بعد. سيتم فحص النتائج تلقائياً عند الإعلان الرسمي من وزارة الخارجية الأمريكية.
            </p>
            <button
              onClick={handleCheckResult}
              disabled={checking}
              className="bg-primary-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              {checking ? 'جارٍ الفحص...' : 'فحص النتيجة الآن'}
            </button>
          </>
        )}
      </div>

      <div className="bg-white rounded-2xl p-6 border border-navy-100">
        <h2 className="font-bold text-navy-900 mb-4">تفاصيل الطلب</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-navy-400">رقم الطلب</dt>
            <dd className="font-bold text-navy-900">{result.order_number}</dd>
          </div>
          <div>
            <dt className="text-navy-400">الحالة</dt>
            <dd className="font-bold text-navy-900">{result.status}</dd>
          </div>
          <div>
            <dt className="text-navy-400">تاريخ الإنشاء</dt>
            <dd className="font-bold text-navy-900">
              {result.created_at ? new Date(result.created_at).toLocaleDateString('ar-YE') : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-navy-400">رقم التأكيد</dt>
            <dd className="font-bold text-navy-900 font-mono" dir="ltr">{result.confirmation_number || '—'}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
