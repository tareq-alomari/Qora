import { Link } from 'react-router-dom'
import SEO, { BreadcrumbSchema } from '../../../common/components/SEO'

const PLANS = [
  {
    name: 'تسجيل اللوتري',
    price: '1,000',
    currency: 'ريال يمني',
    popular: true,
    features: [
      'فحص الصورة بالذكاء الاصطناعي',
      'تدقيق بشري احترافي',
      'تعبئة نموذج التقديم كاملاً',
      'تقديم الطلب إلى الموقع الرسمي',
      'رقم تأكيد (Confirmation Number)',
      'متابعة النتائج بعد الإعلان',
      'إشعارات فورية بحالة الطلب',
    ],
  },
]

const PAYMENT_METHODS = [
  { name: 'كريمي', icon: '/images/payment-logos/kuraimi.svg', desc: 'بنك الكريمي للتمويل الأصغر الإسلامي' },
  { name: 'جيب', icon: '/images/payment-logos/jaib.png', desc: 'محفظة جيب الإلكترونية' },
  { name: 'ون كاش', icon: '/images/payment-logos/onecash.png', desc: 'المحفظة الإلكترونية ONE Cash' },
  { name: 'موبايل موني', icon: '/images/payment-logos/mobile-money.png', desc: 'تحويل عبر موبايل موني (كاك بنك)' },
]

const FAQ = [
  { q: 'هل هناك رسوم إضافية؟', a: 'لا، 1,000 ريال يمني هي الرسوم النهائية لكل طلب. لا توجد رسوم خفية أو إضافية.' },
  { q: 'هل يتم استرداد الرسوم إذا لم أفز؟', a: 'الرسوم هي مقابل الخدمات المقدمة (فحص الصورة، تعبئة النموذج، التقديم، المتابعة)، وليست مقابل الفوز. لا يمكن استردادها في حال عدم الفوز.' },
  { q: 'كيف أدفع؟', a: 'بعد قبول صورتك، نعرض لك رقم حساب قرعة حسب طريقة الدفع التي اخترتها. تقوم بالتحويل وترفع صورة الإشعار.' },
  { q: 'هل يمكن التقديم بأكثر من طلب؟', a: 'ممنوع قانونياً. كل شخص يحق له طلب واحد فقط لكل موسم.' },
]

export default function PricingPage() {
  return (
    <div className="bg-navy-50 min-h-screen">
      <SEO
        title="الأسعار - التقديم على DV Lottery"
        description="قدّم على قرعة الهجرة العشوائية الأمريكية DV Lottery بـ 1,000 ريال يمني فقط. ادفع عبر كريمي، جيب، ون كاش، أو موبايل موني."
        url="/pricing"
        jsonLd={[BreadcrumbSchema([
          { name: 'الرئيسية', path: '/' },
          { name: 'الأسعار', path: '/pricing' },
        ])]}
      />
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-navy-900 to-navy-800 opacity-90 z-0"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

        <div className="max-w-4xl mx-auto px-4 py-20 md:py-28 text-center relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl mb-6 border border-white/20">
            <svg className="w-8 h-8 text-gold-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">الباقات والأسعار</h1>
          <p className="text-lg text-navy-300 max-w-2xl mx-auto font-medium">
            نصف سعر السوق — خدمة متكاملة بأسعار معقولة للجميع
          </p>
        </div>
      </section>

      {/* Pricing Card */}
      <section className="max-w-lg mx-auto px-4 -mt-10 relative z-20">
        {PLANS.map((plan, i) => (
          <div key={i} className={`bg-white rounded-3xl shadow-xl border-2 overflow-hidden ${plan.popular ? 'border-gold-400 shadow-gold-200/50' : 'border-navy-100'}`}>
            {plan.popular && (
              <div className="bg-gradient-to-l from-gold-500 to-gold-600 text-white text-center py-2 text-sm font-bold tracking-wider">
                الأكثر طلباً
              </div>
            )}
            <div className="p-8 text-center">
              <h2 className="text-2xl font-black text-navy-900 mb-4">{plan.name}</h2>
              <div className="flex items-center justify-center gap-2 mb-6">
                <span className="text-5xl font-extrabold text-primary-600">{plan.price}</span>
                <div className="text-right">
                  <span className="block text-lg font-bold text-navy-700">{plan.currency}</span>
                  <span className="block text-sm text-navy-400">لطلب الواحد</span>
                </div>
              </div>
              <ul className="text-right space-y-3 mb-8">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-3 text-navy-600">
                    <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/login" className="block w-full bg-gradient-to-l from-gold-500 to-gold-600 text-white py-4 rounded-xl font-bold text-lg hover:from-gold-600 hover:to-gold-700 transition-all shadow-lg shadow-gold-500/30 hover:-translate-y-0.5">
                ابدأ التسجيل
              </Link>
            </div>
          </div>
        ))}
      </section>

      {/* Payment Methods */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-navy-900 mb-3">طرق الدفع المتاحة</h2>
          <p className="text-navy-500 font-medium">اختر طريقة الدفع المناسبة لك</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {PAYMENT_METHODS.map((method, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 text-center border border-navy-100 hover:border-primary-200 hover:shadow-md transition-all flex flex-col items-center justify-center min-h-[180px]">
              <img src={method.icon} alt={method.name} className="h-10 mb-3 max-w-[120px] object-contain" />
              <h3 className="font-bold text-navy-900 mb-1">{method.name}</h3>
              <p className="text-navy-400 text-xs">{method.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Compare */}
      <section className="bg-white border-y border-navy-100 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-black text-navy-900 text-center mb-10">لماذا قرعة؟</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6">
              <div className="text-3xl font-black text-primary-500 mb-2">1,000 YR</div>
              <p className="text-navy-600 font-bold mb-1">سعر قرعة</p>
              <p className="text-sm text-navy-400">فحص AI + تدقيق بشري + تقديم رسمي + متابعة</p>
            </div>
            <div className="text-center p-6 border-x border-navy-100">
              <div className="text-3xl font-black text-navy-300 mb-2">2,000 YR</div>
              <p className="text-navy-600 font-bold mb-1">سعر السوق</p>
              <p className="text-sm text-navy-400">مكاتب الخدمات التقليدية بدون ضمان جودة</p>
            </div>
            <div className="text-center p-6">
              <div className="text-3xl font-black text-emerald-500 mb-2">50%</div>
              <p className="text-navy-600 font-bold mb-1">وفر</p>
              <p className="text-sm text-navy-400">نصف السعر مع خدمة أفضل وتقنية متطورة</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-black text-navy-900 text-center mb-8">أسئلة عن التسعير</h2>
        <div className="space-y-4">
          {FAQ.map((item, i) => (
            <details key={i} className="bg-white rounded-2xl border border-navy-100 group open:border-primary-200 open:shadow-md transition-all">
              <summary className="p-5 font-bold text-navy-900 cursor-pointer list-none flex items-center justify-between">
                {item.q}
                <svg className="w-5 h-5 text-navy-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-5 pb-5 text-navy-500 text-sm leading-relaxed border-t border-navy-100 pt-4">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="bg-gradient-to-br from-primary-900 to-navy-900 rounded-3xl p-10 md:p-14 text-center text-white shadow-2xl">
          <h2 className="text-2xl md:text-3xl font-black mb-4">ابدأ الآن بسعر رمزي</h2>
          <p className="text-primary-100 mb-8 max-w-lg mx-auto">1,000 ريال يمني فقط — نصف سعر السوق — وفر وقتك وجهدك مع قرعة.</p>
          <Link to="/login" className="inline-flex items-center gap-2 bg-white text-primary-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-primary-50 transition-all shadow-lg hover:-translate-y-1">
            سجل الآن
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </Link>
        </div>
      </section>
    </div>
  )
}
