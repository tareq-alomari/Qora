import { Link } from 'react-router-dom'
import SEO, { BreadcrumbSchema } from '../../../common/components/SEO'

const REQUIREMENTS = [
  {
    title: 'خلفية بيضاء تماماً',
    desc: 'خلفية موحدة بياض ناصع بدون أي نقوش أو ظلال أو أشخاص آخرين. الخلفية يجب أن تكون بيضاء بالكامل ومتجانسة الإضاءة.',
    wrong: 'خلفية ملونة، جدار بنقوش، ظلال على الخلفية',
  },
  {
    title: 'الوجه في المنتصف',
    desc: 'مواجه للكاميرا مباشرة، العينان مفتوحتان ومركزيتان في الإطار. الرأس في وضع مستقيم بدون إمالة.',
    wrong: 'وجه مائل، النظر لجهة أخرى، الرأس بعيد أو قريب جداً',
  },
  {
    title: 'إضاءة متساوية بدون ظلال',
    desc: 'إضاءة طبيعية منتظمة على الوجه بالكامل. لا توجد ظلال خلف الرأس أو على الوجه. الإضاءة الضعيفة جداً أو القوية جداً تسبب الرفض.',
    wrong: 'ظلال على الوجه أو خلف الرأس، إضاءة غير كافية، فلاش قوي',
  },
  {
    title: 'تعابير وجه محايدة',
    desc: 'لا ابتسامة، الفم مغلق بشكل طبيعي، نظرة محايدة للأمام مباشرة. تعابير الوجه يجب أن تكون طبيعية بدون مبالغة.',
    wrong: 'ابتسامة، فم مفتوح، رفع الحاجبين، تعابير غير طبيعية',
  },
  {
    title: 'بدون إكسسوارات',
    desc: 'لا نظارات شمسية أو طبية. يُسمح بغطاء الرأس الديني (حجاب، عمامة) بشرط إظهار كامل الوجه من الجبهة إلى الذقن. ممنوع: نظارات، سماعات، قبعات.',
    wrong: 'نظارات طبية أو شمسية، غطاء رأس يخفي جزءاً من الوجه، سماعات',
  },
]

const FORBIDDEN = [
  { icon: '✂️', label: 'تعديل الصورة رقمياً', desc: 'ممنوع منعاً باتاً قص الخلفية أو تغييرها أو تنعيم البشرة أو أي تعديل. وزارة الخارجية الأمريكية تكتشف هذه التعديلات.' },
  { icon: '📸', label: 'صورة سيلفي', desc: 'التقاط صورة ذاتية (سيلفي) قد يؤدي إلى زوايا غير صحيحة أو ظلال غير مرغوب فيها.' },
  { icon: '🖨️', label: 'مسح ضوئي لصورة مطبوعة', desc: 'تصوير أو مسح صورة ورقية قديمة يؤدي إلى فقدان الجودة وظهور أنماط طباعة.' },
  { icon: '⏳', label: 'صورة قديمة', desc: 'يجب أن تكون الصورة حديثة (خلال آخر 6 أشهر) وتعكس مظهرك الحالي.' },
]

export default function PhotoRequirements() {
  return (
    <div className="bg-navy-50 min-h-screen font-sans">
      <SEO
        title="مواصفات الصورة - شروط صورة قرعة اللوتري DV Lottery"
        description="تعرف على مواصفات الصورة المطلوبة لقرعة الهجرة العشوائية الأمريكية. خلفية بيضاء، الوجه في المنتصف، إضاءة مناسبة بدون ظلال."
        url="/photo-requirements"
        jsonLd={[BreadcrumbSchema([
          { name: 'الرئيسية', path: '/' },
          { name: 'مواصفات الصورة', path: '/photo-requirements' },
        ])]}
      />
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-navy-900 to-navy-800 opacity-90 z-0"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

        <div className="max-w-4xl mx-auto px-4 py-20 md:py-28 text-center relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl mb-6 border border-white/20">
            <svg className="w-8 h-8 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">متطلبات الصورة الشخصية</h1>
          <p className="text-lg text-navy-300 max-w-2xl mx-auto font-medium">
            الصورة هي الخطوة الأهم في طلبك. نظام الذكاء الاصطناعي لدينا يفحص صورتك وفقاً لمواصفات وزارة الخارجية الأمريكية بدقة عالية.
          </p>
        </div>
      </section>

      {/* Requirements Grid */}
      <section className="max-w-5xl mx-auto px-4 -mt-10 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {REQUIREMENTS.map((req, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-lg border border-navy-100 hover:border-primary-200 transition-all">
              <div className="w-10 h-10 bg-primary-500 text-white rounded-xl flex items-center justify-center font-black text-lg mb-4 shadow-md shadow-primary-200">
                {i + 1}
              </div>
              <h3 className="font-bold text-navy-900 mb-2">{req.title}</h3>
              <p className="text-navy-500 text-sm leading-relaxed mb-3">{req.desc}</p>
              <div className="bg-error/5 rounded-xl p-3 border border-error/10">
                <p className="text-xs font-bold text-error mb-1">ممنوع:</p>
                <p className="text-xs text-error/80">{req.wrong}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Do Not Section */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-navy-900 mb-3">ممنوعات قطعية</h2>
          <p className="text-navy-500 font-medium">هذه الأخطاء تؤدي إلى رفض الصورة فوراً من قبل نظام AI</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {FORBIDDEN.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-navy-100 flex gap-4 items-start hover:border-error/30 transition-all">
              <span className="text-2xl shrink-0 w-12 h-12 bg-error/5 rounded-xl flex items-center justify-center">{item.icon}</span>
              <div>
                <h3 className="font-bold text-navy-900 mb-1">{item.label}</h3>
                <p className="text-navy-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats / AI Info */}
      <section className="bg-white border-y border-navy-100 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="text-4xl font-black text-primary-500 mb-2">100%</div>
              <p className="text-navy-500 font-medium">فحص آلي لكل الصور المرفوعة</p>
            </div>
            <div className="p-6 border-x border-navy-100">
              <div className="text-4xl font-black text-primary-500 mb-2">لا تعديل</div>
              <p className="text-navy-500 font-medium">ممنوع تعديل أي بكسل في الصورة</p>
            </div>
            <div className="p-6">
              <div className="text-4xl font-black text-primary-500 mb-2">ثوانٍ</div>
              <p className="text-navy-500 font-medium">مدة فحص الصورة فورية</p>
            </div>
          </div>
        </div>
      </section>

      {/* Guide */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-black text-navy-900 mb-6">كيف يتم فحص الصورة؟</h2>
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-navy-100 flex gap-4">
            <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center font-black shrink-0">1</div>
            <div>
              <h3 className="font-bold text-navy-900 mb-1">رفع الصورة</h3>
              <p className="text-navy-500 text-sm">ترفع الصورة من جهازك بصيغة JPEG أو PNG بدقة لا تقل عن 600×600 بكسل.</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-navy-100 flex gap-4">
            <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center font-black shrink-0">2</div>
            <div>
              <h3 className="font-bold text-navy-900 mb-1">فحص AI</h3>
              <p className="text-navy-500 text-sm">نظام الذكاء الاصطناعي يفحص: الخلفية، الإضاءة، وضعية الوجه، تعابير الوجه، وأي تعديلات رقمية. الفحص فوري ويستغرق ثوانٍ.</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-navy-100 flex gap-4">
            <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center font-black shrink-0">3</div>
            <div>
              <h3 className="font-bold text-navy-900 mb-1">نتيجة الفحص</h3>
              <p className="text-navy-500 text-sm">إذا كانت الصورة مطابقة للمواصفات، يتم قبولها وتنتقل للخطوة التالية. إذا كانت مرفوضة، يظهر لك سبب الرفض لتتمكن من إعادة المحاولة بصورة صحيحة.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="bg-gradient-to-br from-primary-900 to-navy-900 rounded-3xl p-10 md:p-14 text-center text-white shadow-2xl">
          <h2 className="text-2xl md:text-3xl font-black mb-4">جاهز لبدء التسجيل؟</h2>
          <p className="text-primary-100 mb-8 max-w-lg mx-auto">تأكد من صورتك وابدأ رحلة التقديم على قرعة الهجرة العشوائية.</p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-white text-primary-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-primary-50 transition-all shadow-lg hover:-translate-y-1">
            إنشاء حساب جديد
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </Link>
        </div>
      </section>
    </div>
  )
}
