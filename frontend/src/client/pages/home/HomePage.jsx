import { Link } from 'react-router-dom'

const features = [
  {
    icon: (
      <svg className="w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
    title: 'فحص الصور بالذكاء الاصطناعي',
    desc: 'نظام مدعوم بالذكاء الاصطناعي لفحص صورتك فوراً والتأكد من مطابقتها الدقيقة لمواصفات وزارة الخارجية الأمريكية.',
  },
  {
    icon: (
      <svg className="w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
      </svg>
    ),
    title: 'متابعة حية للطلب',
    desc: 'تتبع حالة طلبك خطوة بخطوة بكل شفافية، من لحظة التقديم وحتى إعلان النتيجة النهائية.',
  },
  {
    icon: (
      <svg className="w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
    title: 'دفع محلي وآمن',
    desc: 'خيارات دفع متعددة وآمنة عبر المحافظ الإلكترونية (كريمي، جيب، ون كاش، موبايل موني) لتسهيل المعاملات.',
  },
]

const steps = [
  {
    num: '1',
    title: 'إنشاء حساب',
    desc: 'سجل برقم هاتفك خلال ثوانٍ معدودة وابدأ رحلتك.',
  },
  {
    num: '2',
    title: 'إدخال البيانات',
    desc: 'أكمل بياناتك الشخصية ومؤهلاتك بكل سهولة ويسر.',
  },
  {
    num: '3',
    title: 'رفع الصورة',
    desc: 'ارفع صورتك ودع نظام الذكاء الاصطناعي يتولى فحصها.',
  },
  {
    num: '4',
    title: 'تأكيد الدفع',
    desc: 'ادفع الرسوم الرمزية واستلم رقم التأكيد الرسمي.',
  },
]

export default function HomePage() {
  return (
    <div className="font-sans text-navy-800">
      {/* Hero Section with Glassmorphism */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center justify-center bg-navy-900">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-navy-900 to-primary-800 opacity-90"></div>
          {/* Decorative shapes */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-gold-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-navy-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center z-10">
          <span className="inline-block py-1 px-3 rounded-full bg-primary-500/20 border border-primary-500/30 text-primary-300 text-sm font-semibold tracking-wider mb-6">
            مرحباً بك في منصة قرعة
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-8 tracking-tight leading-tight">
            بوابتك الآمنة للتسجيل في <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-gold-400">
              قرعة الهجرة الأمريكية
            </span>
          </h1>
          <p className="mt-6 text-xl md:text-2xl text-navy-200 max-w-3xl mx-auto leading-relaxed mb-12">
            نظام ذكي ومتكامل لضمان تقديم طلبك بشكل صحيح بنسبة 100% مع فحص الصور بالذكاء الاصطناعي والدفع المحلي الآمن.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link
              to="/register"
              className="group relative px-8 py-4 bg-primary-500 text-white rounded-xl text-lg font-bold shadow-lg shadow-primary-500/30 hover:bg-primary-400 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
              <span className="relative">ابدأ التسجيل الآن</span>
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl text-lg font-bold hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1"
            >
              تسجيل الدخول
            </Link>
          </div>
        </div>
        
        {/* Custom wave divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg className="relative block w-full h-[100px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118,137.36,116.27,204,103.73,243.68,96.3,283.47,78.29,321.39,56.44Z" fill="#f8fafc"></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-navy-50 py-24 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-bold text-primary-500 tracking-wide uppercase mb-2">مميزاتنا</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-navy-900 mb-4">لماذا تختار منصة قرعة؟</h3>
            <p className="text-lg text-navy-500">نقدم لك تجربة مستخدم سلسة وآمنة مع ميزات تقنية متقدمة تضمن تقديم طلبك بنجاح.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-xl shadow-navy-200/20 border border-navy-100 hover:shadow-2xl hover:border-primary-100 transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-6 text-primary-500 shadow-inner">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-bold text-navy-900 mb-3">{feature.title}</h4>
                <p className="text-navy-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-sm font-bold text-primary-500 tracking-wide uppercase mb-2">الخطوات</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-navy-900 mb-4">كيف يعمل النظام؟</h3>
            <p className="text-lg text-navy-500">أربع خطوات بسيطة تفصلك عن إتمام عملية التسجيل بنجاح.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connection line for desktop */}
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-primary-200 via-primary-300 to-primary-200 z-0"></div>
            
            {steps.map((step, index) => (
              <div key={index} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-white rounded-full border-4 border-primary-50 flex items-center justify-center shadow-lg mb-6 relative group hover:border-primary-200 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-inner group-hover:scale-110 transition-transform duration-300">
                    {step.num}
                  </div>
                </div>
                <h4 className="text-xl font-bold text-navy-900 mb-2">{step.title}</h4>
                <p className="text-navy-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing & CTA Section */}
      <section className="bg-gradient-to-b from-navy-50 to-white py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-3xl shadow-2xl p-10 md:p-16 border border-navy-100 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-gold-400 rounded-full opacity-10 filter blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-primary-400 rounded-full opacity-10 filter blur-3xl"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-4">رسوم التسجيل الرمزية</h2>
              <p className="text-lg text-navy-500 mb-8 max-w-2xl mx-auto">
                نقدم خدمة متكاملة تشمل الفحص الآلي للصور، التدقيق البشري، والمتابعة المستمرة بأسعار منافسة.
              </p>
              
              <div className="inline-flex items-center justify-center bg-navy-50 rounded-2xl py-6 px-12 mb-10 border border-navy-100">
                <span className="text-5xl md:text-6xl font-extrabold text-primary-600 mr-3">1,000</span>
                <div className="text-right">
                  <span className="block text-xl font-bold text-navy-700">ريال يمني</span>
                  <span className="block text-sm text-navy-400">لطلب الواحد</span>
                </div>
              </div>
              
              <div>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-10 py-5 bg-gradient-to-r from-gold-500 to-gold-600 text-white rounded-xl text-xl font-bold shadow-xl shadow-gold-500/30 hover:shadow-gold-500/50 hover:-translate-y-1 transition-all duration-300"
                >
                  سجل الآن واضمن فرصتك
                  <svg className="w-6 h-6 mr-3 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
                <p className="mt-4 text-sm text-navy-400">* يسمح بتقديم طلب واحد فقط لكل شخص في الموسم الواحد</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
