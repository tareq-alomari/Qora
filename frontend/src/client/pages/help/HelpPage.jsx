import { useState, useMemo } from 'react'
import SEO, { FAQSchema, BreadcrumbSchema } from '../../../common/components/SEO'

const CATEGORIES = [
  {
    id: 'registration',
    label: 'التسجيل',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
      </svg>
    ),
    items: [
      { q: 'كيف أسجل في قرعة اللوتري؟', a: 'التسجيل بسيط وسريع: أنشئ حساباً برقم هاتفك، ثم املأ بياناتك الشخصية، ارفع صورتك، وقم بالدفع. بعد التدقيق، تستلم رقم تأكيد (Confirmation Number) يثبت مشاركتك.' },
      { q: 'لم أستلم رمز التفعيل (OTP)، ماذا أفعل؟', a: 'تأكد من إدخال رقم الهاتف بشكل صحيح مع مفتاح الدولة (+967 لليمن). تحقق من صندوق الرسائل المزعجة (Spam). إذا استمرت المشكلة، جرب إعادة الإرسال بعد دقيقة أو تواصل مع الدعم الفني.' },
      { q: 'هل يمكنني استخدام رقم هاتف شخص آخر؟', a: 'لا، يجب أن يكون رقم الهاتف مسجلاً باسمك الشخصي. رقم الهاتف يستخدم للتحقق من هويتك وتلقي الإشعارات المهمة.' },
      { q: 'هل يمكنني تقديم أكثر من طلب؟', a: 'ممنوع منعاً باتاً. قانونياً، يحق لكل شخص تقديم طلب واحد فقط لكل موسم. التقديم بأكثر من طلب يؤدي إلى استبعادك تماماً من القرعة.' },
      { q: 'ما هي المؤهلات المطلوبة للتسجيل؟', a: 'يشترط أن يكون لديك شهادة ثانوية عامة أو ما يعادلها، أو سنتين خبرة عملية في مجال مؤهل خلال آخر 5 سنوات.' },
    ],
  },
  {
    id: 'photo',
    label: 'الصورة',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
      </svg>
    ),
    items: [
      { q: 'ما هي مواصفات الصورة المطلوبة؟', a: 'يجب أن تكون الصورة حديثة (خلال 6 أشهر)، خلفية بيضاء، الوجه في المنتصف، إضاءة متساوية بدون ظلال، تعابير وجه محايدة، بدون نظارات شمسية أو أغطية رأس (إلا للأغراض الدينية مع إظهار كامل الوجه).' },
      { q: 'لماذا تم رفض صورتي؟', a: 'الأسباب الأكثر شيوعاً: خلفية غير بيضاء، ظلال على الوجه، إضاءة ضعيفة، تعابير غير محايدة (ابتسامة)، أو وجود نظارات شمسية. نظام AI يفحص الصورة بدقة ويتأكد من مطابقتها لمواصفات وزارة الخارجية الأمريكية.' },
      { q: 'هل يمكنني إعادة رفع الصورة بعد الرفض؟', a: 'نعم، يمكنك إعادة رفع الصورة مرات غير محدودة حتى يتم قبولها. ننصح بقراءة ملاحظات الرفض وتصحيح المشكلة قبل إعادة المحاولة.' },
      { q: 'ما هو فحص الذكاء الاصطناعي (AI)؟', a: 'نظام AI (ذكاء اصطناعي) متخصص في فحص الصور يتحقق تلقائياً من مطابقة صورتك لمواصفات وزارة الخارجية الأمريكية. يفحص الإضاءة، الخلفية، وضعية الوجه، وأي تعديلات رقمية.' },
      { q: 'هل يمكنني تعديل الصورة باستخدام الفوتوشوب؟', a: 'ممنوع منعاً باتاً. وزارة الخارجية الأمريكية ترفض أي صورة معدلة رقمياً (Digitally Altered). لا تقم بتعديل الخلفية أو تحسين الصورة بأي برنامج.' },
      { q: 'كم من الوقت يستغرق فحص الصورة؟', a: 'فحص AI فوري ويتم خلال ثوانٍ. في حالات نادرة، قد يستغرق التدقيق اليدوي من قبل الموظف بضع دقائق.' },
    ],
  },
  {
    id: 'payment',
    label: 'الدفع',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
    items: [
      { q: 'ما هي طرق الدفع المتاحة؟', a: 'يمكنك الدفع عبر: كريمي، جيب، ون كاش، موبايل موني. سيتم عرض رقم حساب قرعة حسب الطريقة التي تختارها.' },
      { q: 'كيف أدفع رسوم التسجيل؟', a: 'بعد قبول صورتك، اختر طريقة الدفع المناسبة لك. سيتم عرض رقم حساب قرعة. قم بتحويل المبلغ (1,000 ريال يمني) ثم ارفع صورة الإشعار.' },
      { q: 'كيف أرفع صورة إشعار الدفع؟', a: 'بعد تحويل المبلغ، التقط صورة واضحة لإشعار التحويل (الحوالة) من هاتفك. ارفعها في قسم الدفع بالمنصة. تأكد من ظهور المبلغ ورقم الحساب والتاريخ بوضوح.' },
      { q: 'كم من الوقت يستغرق تأكيد الدفع؟', a: 'يقوم أحد موظفينا بالتدقيق يدوياً على الإشعار والتأكد من استلام المبلغ. عادةً ما يستغرق ذلك من دقائق إلى ساعات خلال أوقات العمل.' },
      { q: 'هل هناك رسوم إضافية بعد الدفع؟', a: 'الرسوم المدفوعة (1,000 ريال يمني) هي رسوم خدمة التسجيل والتقديم. لا توجد رسوم إضافية مخفية. في حال تم اختيارك كفائز، رسوم المقابلة القنصلية تدفع مباشرة للسفارة الأمريكية.' },
    ],
  },
  {
    id: 'results',
    label: 'النتيجة',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
    items: [
      { q: 'متى تظهر النتائج؟', a: 'نتائج قرعة التنوع (DV Lottery) تعلن عادةً في شهر مايو من كل عام على موقع وزارة الخارجية الأمريكية. سنقوم بإشعارك فور توفر النتيجة.' },
      { q: 'كيف أتحقق من نتيجتي؟', a: 'يمكنك التحقق من نتيجتك من خلال صفحة "فحص النتيجة" في حسابك باستخدام رقم التأكيد الخاص بك. سنرسل لك أيضاً إشعاراً عبر الواتساب فور ظهور النتيجة.' },
      { q: 'ما هو رقم التأكيد (Confirmation Number)؟', a: 'رقم التأكيد هو رقم فريد يصدره موقع وزارة الخارجية الأمريكية بعد تقديم طلبك رسمياً. استخدم هذا الرقم للتحقق من نتيجتك لاحقاً. احتفظ به جيداً.' },
      { q: 'ماذا أفعل إذا فزت بالقرعة؟', a: 'إذا تم اختيارك، ستحتاج إلى استكمال إجراءات المقابلة القنصلية في السفارة الأمريكية. سنقوم بتوجيهك خطوة بخطوة خلال هذه العملية.' },
      { q: 'هل يمكنني تغيير بياناتي بعد التقديم؟', a: 'بعد تقديم الطلب رسمياً على موقع وزارة الخارجية، لا يمكن تعديل البيانات. تأكد من صحة جميع معلوماتك قبل التأكيد النهائي.' },
    ],
  },
  {
    id: 'general',
    label: 'عام',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
      </svg>
    ),
    items: [
      { q: 'هل الخدمة قانونية؟', a: 'نعم، خدمتنا قانونية 100%. نحن نقدم خدمة مساعدة في التسجيل وتدقيق الصور وإدارة الطلبات. قرعة اللوتري نفسها هي برنامج حكومي أمريكي رسمي (Diversity Immigrant Visa Program).' },
      { q: 'ما هي قرعة التنوع (DV Lottery)؟', a: 'قرعة التنوع (DV Lottery) هو برنامج هجرة أمريكي يوفّر 55,000 تأشيرة سنوياً لأشخاص من دول ذات معدلات هجرة منخفضة إلى أمريكا، عن طريق القرعة العشوائية.' },
      { q: 'هل هناك رسوم خدمة؟', a: 'نعم، رسوم خدمة التسجيل والتقديم هي 1,000 ريال يمني لكل طلب. هذه رسوم مقابل خدماتنا (تدقيق الصورة، إدخال البيانات، التقديم الرسمي، المتابعة).' },
      { q: 'هل يتم استرداد الرسوم إذا لم أفز؟', a: 'الرسوم المدفوعة هي مقابل الخدمات المقدمة (التسجيل والتدقيق والتقديم)، وليس مقابل الفوز. لا يمكن استردادها في حال لم يتم الاختيار، تماماً مثل أي خدمة أخرى.' },
      { q: 'كيف تحمي قرعة بياناتي الشخصية؟', a: 'نحن نستخدم تشفيراً متقدماً لحماية بياناتك. لا نشارك معلوماتك مع أطراف ثالثة. بياناتك تستخدم فقط لغرض التقديم على القرعة. يمكنك طلب حذف بياناتك في أي وقت.' },
    ],
  },
]

const PHOTO_REQUIREMENTS = [
  { label: 'خلفية بيضاء تماماً', desc: 'خلفية موحدة بياض ناصع بدون أي نقوش أو ظلال' },
  { label: 'الوجه في المنتصف', desc: 'مواجه للكاميرا، العينان مفتوحتان، مركزياً في الإطار' },
  { label: 'إضاءة متساوية بدون ظلال', desc: 'إضاءة طبيعية منتظمة على الوجه بالكامل، لا ظلال خلف الرأس أو على الوجه' },
  { label: 'تعابير وجه محايدة', desc: 'لا ابتسامة، الفم مغلق، نظرة طبيعية للأمام' },
  { label: 'بدون إكسسوارات', desc: 'لا نظارات شمسية أو عادية. يُسمح بغطاء الرأس الديني مع إظهار كامل الوجه من الجبهة للذقن' },
]

export default function HelpPage() {
  const [search, setSearch] = useState('')
  const [openItem, setOpenItem] = useState(null)

  const filtered = useMemo(() => {
    if (!search.trim()) return CATEGORIES
    const q = search.toLowerCase()
    return CATEGORIES.map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) => item.q.includes(q) || item.a.includes(q)
      ),
    })).filter((cat) => cat.items.length > 0)
  }, [search])

  const toggleItem = (id) => {
    setOpenItem((prev) => (prev === id ? null : id))
  }

  const faqItems = [
    { question: 'ما هي قرعة اللوتري DV Lottery؟', answer: 'قرعة الهجرة العشوائية (Diversity Visa Lottery) هي برنامج أمريكي يوفّر 55,000 تأشيرة سنوياً لأشخاص من دول ذات معدلات هجرة منخفضة.' },
    { question: 'هل اليمن مؤهلة لقرعة اللوتري؟', answer: 'نعم، اليمن مؤهلة سنوياً للتقديم على قرعة الهجرة العشوائية الأمريكية.' },
    { question: 'كم تكلفة التقديم عبر قرعة؟', answer: '1,000 ريال يمني فقط - نصف سعر السوق. تشمل فحص الصورة، تعبئة البيانات، والتقديم الرسمي.' },
    { question: 'كيف أحصل على Confirmation Number؟', answer: 'بعد الدفع، نقوم بالتقديم نيابة عنك على dvprogram.state.gov ونستخرج رقم التأكيد.' },
    { question: 'هل تضمنون الفوز بالقرعة؟', answer: 'لا، نحن منصة مساعدة للتقديم فقط. الفوز يعتمد على الاختيار العشوائي من وزارة الخارجية الأمريكية.' },
  ]

  return (
    <div className="min-h-screen bg-navy-50 font-sans pb-16">
      <SEO
        title="المساعدة والدعم"
        description="أسئلة شائعة حول قرعة الهجرة العشوائية DV Lottery: طريقة التقديم، الشروط، التكلفة، وكيفية الحصول على Confirmation Number."
        url="/help"
        jsonLd={[
          FAQSchema(faqItems),
          BreadcrumbSchema([
            { name: 'الرئيسية', path: '/' },
            { name: 'المساعدة', path: '/help' },
          ]),
        ]}
      />
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-navy-900 to-navy-800 opacity-90 z-0"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        
        <div className="max-w-5xl mx-auto px-4 py-20 md:py-28 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">الأسئلة الشائعة</h1>
          <p className="text-lg text-navy-300 max-w-xl mx-auto font-medium">
            كل ما تحتاج معرفته عن التسجيل في قرعة اللوتري (DV Lottery) بوضوح وشفافية
          </p>
        </div>
      </section>

      {/* Search */}
      <div className="max-w-3xl mx-auto px-4 -mt-8 relative z-20 mb-12">
        <div className="bg-white rounded-2xl shadow-xl shadow-navy-100/50 border border-navy-100 p-2 flex items-center">
          <svg className="w-6 h-6 text-primary-500 mr-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="عن ماذا تبحث؟ (مثال: طريقة الدفع، مواصفات الصورة...)"
            className="flex-1 py-4 px-3 outline-none text-navy-900 font-bold placeholder-navy-300 bg-transparent"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-navy-400 hover:text-error pl-4 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* FAQ Categories */}
      <div className="max-w-4xl mx-auto px-4 mb-16 space-y-12">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-navy-100 shadow-sm">
            <div className="text-6xl mb-6 opacity-80">🔍</div>
            <h3 className="text-2xl font-bold text-navy-900 mb-2">لا توجد نتائج مطابقة لبحثك</h3>
            <p className="text-navy-500 font-medium">حاول استخدام كلمات مختلفة أو تصفح الأقسام أدناه</p>
          </div>
        ) : (
          filtered.map((cat) => (
            <section key={cat.id} className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-navy-100 flex items-center justify-center text-primary-500">
                  {cat.icon}
                </div>
                <h2 className="text-2xl font-black text-navy-900">{cat.label}</h2>
                <span className="text-sm font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-lg border border-primary-100">
                  {cat.items.length} أسئلة
                </span>
              </div>
              
              <div className="space-y-3">
                {cat.items.map((item, i) => {
                  const itemId = `${cat.id}-${i}`
                  const isOpen = openItem === itemId
                  return (
                    <div
                      key={itemId}
                      className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
                        isOpen ? 'border-primary-300 shadow-md shadow-primary-500/10' : 'border-navy-100 shadow-sm hover:border-primary-200 hover:shadow-md'
                      }`}
                    >
                      <button
                        onClick={() => toggleItem(itemId)}
                        className="w-full flex items-center justify-between p-5 md:p-6 text-right transition-colors hover:bg-navy-50/50"
                      >
                        <span className={`font-bold text-lg ${isOpen ? 'text-primary-700' : 'text-navy-900'}`}>{item.q}</span>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mr-4 transition-all duration-300 ${isOpen ? 'bg-primary-500 text-white rotate-180' : 'bg-navy-50 text-navy-400'}`}>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                          </svg>
                        </div>
                      </button>
                      
                      <div 
                        className={`transition-all duration-300 ease-in-out ${
                          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        }`}
                      >
                        <div className="px-5 md:px-6 pb-6 pt-2 text-navy-600 font-medium leading-relaxed border-t border-navy-50">
                          {item.a}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          ))
        )}
      </div>

      {/* Photo Guide Section */}
      <section className="bg-white py-16 border-y border-navy-100">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-primary-600 font-bold tracking-wider text-sm mb-2 block uppercase">متطلبات ضرورية</span>
            <h2 className="text-3xl font-black text-navy-900 mb-3">دليل الصورة المثالية للوتري</h2>
            <p className="text-navy-500 font-medium max-w-2xl mx-auto">
              الصورة هي السبب الأول لرفض الطلبات في اللوتري. اتبع هذه الشروط الخمسة لضمان قبول طلبك عبر نظامنا الذكي.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {PHOTO_REQUIREMENTS.map((req, i) => (
              <div key={i} className="bg-navy-50 p-6 rounded-2xl border border-navy-100 hover:border-primary-200 hover:shadow-md transition-all group">
                <div className="w-12 h-12 bg-white text-primary-500 rounded-xl shadow-sm flex items-center justify-center font-black text-xl mb-4 group-hover:scale-110 group-hover:bg-primary-500 group-hover:text-white transition-all">
                  {i + 1}
                </div>
                <h3 className="font-bold text-navy-900 mb-2">{req.label}</h3>
                <p className="text-navy-500 text-sm font-medium leading-relaxed">{req.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="bg-gradient-to-br from-primary-900 to-navy-900 rounded-3xl p-10 md:p-14 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
          
          <div className="relative z-10 text-white">
            <h2 className="text-3xl font-black mb-4">لم تجد إجابة لسؤالك؟</h2>
            <p className="text-primary-100 font-medium mb-10 max-w-lg mx-auto">
              فريق الدعم الفني لدينا متواجد دائماً لمساعدتك والإجابة على كافة استفساراتك المتعلقة بالتسجيل أو الدفع أو النتائج.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a
                href="https://wa.me/967770000000"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 bg-green-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-green-600 transition-all shadow-lg hover:-translate-y-1"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                تواصل عبر واتساب
              </a>
              <a
                href="tel:+967770000000"
                className="flex items-center justify-center gap-3 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-bold hover:bg-white/20 transition-all border border-white/20"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                +967 770 000 000
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
