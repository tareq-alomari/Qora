import { Link } from 'react-router-dom'
import SEO, { OrganizationSchema, WebSiteSchema } from '../../../common/components/SEO'
import AnimatedSection from '../../../common/components/AnimatedSection'
import AnimatedCounter from '../../../common/components/AnimatedCounter'

const features = [
  {
    title: 'قرعة أمريكا (DV Lottery)',
    desc: 'التقديم على تأشيرة التنوع الأمريكية — 55,000 Green Card سنوياً. اليمن مؤهلة للتقديم كل موسم مع فرصة عادلة للجميع.',
  },
  {
    title: 'Green Card + Confirmation #',
    desc: 'نقوم بالتقديم الرسمي على موقع dvprogram.state.gov ونستخرج رقم التأكيد (Confirmation Number) الذي يثبت مشاركتك في القرعة.',
  },
  {
    title: '1,000 ريال — نصف سعر السوق',
    desc: 'خدمة متكاملة: فحص الصورة + تعبئة بيانات + تقديم رسمي + متابعة النتائج. ادفع عبر كريمي، جيب، ون كاش، أو موبايل موني.',
  },
]

const steps = [
  {
    num: '1',
    title: 'إنشاء حساب',
    desc: 'سجل برقم هاتفك اليمني خلال ثوانٍ وابدأ رحلة التقديم على قرعة الهجرة الأمريكية (DV Lottery).',
  },
  {
    num: '2',
    title: 'إدخال بيانات الهجرة',
    desc: 'أدخل بياناتك الشخصية والمؤهلات المطلوبة للتقديم على تأشيرة التنوع الأمريكية (Green Card Lottery).',
  },
  {
    num: '3',
    title: 'رفع الصورة',
    desc: 'ارفع صورتك وفق مواصفات وزارة الخارجية الأمريكية — نفحصها للتأكد من قبولها في طلب اللوتري.',
  },
  {
    num: '4',
    title: 'احصل على Confirmation #',
    desc: 'ادفع 1,000 ريال واستلم رقم التأكيد (Confirmation Number) من موقع dvprogram.state.gov — هنيئاً بمشاركتك!',
  },
]

export default function HomePage() {
  return (
    <div className="font-sans text-navy-800">
      <SEO
        title="منصة التقديم على قرعة اللوتري DV Lottery"
        url="/"
        jsonLd={[OrganizationSchema(), WebSiteSchema()]}
      />
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-screen flex items-center justify-center">
        <div className="absolute inset-0">
          <img
            src="/images/home/passport-usa.jpg"
            alt=""
            className="w-full h-full object-cover scale-105 animate-float"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-navy-900/95 via-navy-900/85 to-primary-900/90"></div>
        </div>

        {/* Decorative floating shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-navy-400/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center z-10">
          <AnimatedSection animation="down" delay={100}>
            <span className="inline-block py-1 px-4 rounded-full bg-primary-500/20 border border-primary-500/30 text-primary-300 text-sm font-semibold tracking-wider mb-6 animate-fade-in-down">
              قرعة الهجرة العشوائية إلى أمريكا (DV Lottery 2026)
            </span>
          </AnimatedSection>

          <AnimatedSection animation="up" delay={300}>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-8 tracking-tight leading-tight">
              سافر إلى أمريكا عبر<br/>
              <span className="gradient-text">
                قرعة اللوتري DV Lottery
              </span>
            </h1>
          </AnimatedSection>

          <AnimatedSection animation="up" delay={500}>
            <p className="mt-6 text-xl md:text-2xl text-navy-200 max-w-3xl mx-auto leading-relaxed mb-12">
              منصة يمنية متخصصة في التقديم لقرعة الهجرة العشوائية الأمريكية. نوفر فحص الصور بالذكاء الاصطناعي، التعبئة والتقديم الرسمي على موقع <span dir="ltr" className="text-gold-400 font-bold">dvprogram.state.gov</span>، واستخراج رقم التأكيد (Confirmation Number) — كل هذا بـ 1,000 ريال فقط.
            </p>
          </AnimatedSection>

          <AnimatedSection animation="up" delay={700}>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link
                to="/register"
                className="group relative px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl text-lg font-bold shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden animate-pulse-glow"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                <span className="relative">ابدأ التسجيل الآن</span>
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 glass text-white rounded-xl text-lg font-bold hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
              >
                تسجيل الدخول
              </Link>
            </div>
          </AnimatedSection>
        </div>

        {/* Animated wave divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg className="relative block w-full h-[100px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118,137.36,116.27,204,103.73,243.68,96.3,283.47,78.29,321.39,56.44Z" fill="#f8fafc"></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 z-20">
        <div className="absolute inset-0">
          <img
            src="/images/home/usa-flag.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-navy-50/95"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="up" className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-bold text-primary-500 tracking-wide uppercase mb-2">لماذا قرعة؟</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-navy-900 mb-4">أفضل منصة يمنية للتقديم على قرعة أمريكا</h3>
            <p className="text-lg text-navy-500">نقدم خدمة متكاملة لليمنيين الراغبين في التقديم على تأشيرة التنوع (DV Lottery) — من فحص الصور إلى التقديم الرسمي ومتابعة النتائج.</p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 stagger-1">
            {features.map((feature, index) => (
              <AnimatedSection key={index} animation="up" delay={index * 150}>
                <div className="group bg-white rounded-2xl p-8 shadow-xl shadow-navy-200/20 border border-navy-100 hover:shadow-2xl hover:border-primary-100 hover-lift transition-all duration-300 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-0 left-0 w-1 h-0 bg-primary-500 group-hover:h-full transition-all duration-500"></div>
                  <h4 className="relative text-xl font-bold text-navy-900 mb-3 group-hover:text-primary-700 transition-colors duration-300">{feature.title}</h4>
                  <p className="relative text-navy-500 leading-relaxed group-hover:text-navy-700 transition-colors duration-300">{feature.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* DV Lottery Info Section with Animated Counters */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/5 to-transparent"></div>

        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-32 h-32 border border-primary-200/30 rounded-full animate-spin-slow"></div>
        <div className="absolute bottom-10 left-10 w-24 h-24 border border-gold-200/20 rounded-full animate-spin-slow animation-delay-2000"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimatedSection animation="up" className="text-center max-w-4xl mx-auto mb-14">
            <h2 className="text-sm font-bold text-primary-500 tracking-wide uppercase mb-2">ما هي قرعة الهجرة؟</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-navy-900 mb-4">Diversity Visa Lottery (DV Lottery)</h3>
            <p className="text-lg text-navy-600 leading-relaxed">
              برنامج هجرة أمريكي يوفّر <strong className="text-primary-600">55,000 تأشيرة</strong> سنوياً لأشخاص من دول ذات معدلات هجرة منخفضة إلى الولايات المتحدة.
              يتم اختيار الفائزين <strong className="text-primary-600">عشوائياً</strong> عن طريق الكمبيوتر، ويمكن للفائز - وزوجته وأولاده غير المتزوجين تحت 21 سنة -
              الحصول على <strong className="text-gold-600">الإقامة الدائمة (Green Card)</strong> والعيش والعمل في أمريكا.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 stagger-1">
            <AnimatedSection animation="scale" delay={0}>
              <div className="group bg-gradient-to-br from-white to-navy-50 rounded-2xl p-6 text-center border border-navy-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <span className="inline-block bg-gradient-to-r from-primary-500 to-primary-700 text-transparent bg-clip-text text-3xl font-black mb-2">
                  <AnimatedCounter end={55000} suffix="+" />
                </span>
                <p className="text-navy-500 text-sm font-medium">تأشيرة (Green Card) سنوياً</p>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="scale" delay={150}>
              <div className="group bg-gradient-to-br from-white to-navy-50 rounded-2xl p-6 text-center border border-navy-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <span className="inline-block bg-gradient-to-r from-gold-500 to-gold-700 text-transparent bg-clip-text text-3xl font-black mb-2">مجاناً</span>
                <p className="text-navy-500 text-sm font-medium">التقديم الرسمي لا يكلف</p>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="scale" delay={300}>
              <div className="group bg-gradient-to-br from-white to-navy-50 rounded-2xl p-6 text-center border border-navy-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <span className="inline-block bg-gradient-to-r from-green-500 to-green-700 text-transparent bg-clip-text text-3xl font-black mb-2">
                  <AnimatedCounter end={2026} />
                </span>
                <p className="text-navy-500 text-sm font-medium">اليمن مؤهلة سنوياً</p>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="scale" delay={450}>
              <div className="group bg-gradient-to-br from-white to-navy-50 rounded-2xl p-6 text-center border border-navy-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <span className="inline-block bg-gradient-to-r from-navy-500 to-navy-700 text-transparent bg-clip-text text-3xl font-black mb-2">يونيو</span>
                <p className="text-navy-500 text-sm font-medium">إعلان النتائج كل عام</p>
              </div>
            </AnimatedSection>
          </div>

          <AnimatedSection animation="fade" delay={300} className="text-center mt-8">
            <p className="text-navy-400 text-sm">
              * ملاحظة: قرعة (Qor3a) منصة مساعدة للتقديم — لا نضمن الفوز بالقرعة. الفوز يعتمد على الاختيار العشوائي من وزارة الخارجية الأمريكية.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0">
          <img
            src="/images/home/immigration.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-navy-50/95"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="up" className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-sm font-bold text-primary-500 tracking-wide uppercase mb-2">خطوات التقديم على اللوتري</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-navy-900 mb-4">كيف تتقدم لقرعة الهجرة الأمريكية؟</h3>
            <p className="text-lg text-navy-500">أربع خطوات بسيطة تفصلك عن الحصول على رقم التأكيد (Confirmation Number) والتقديم الرسمي على قرعة أمريكا (DV Lottery).</p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-primary-200 via-primary-300 to-primary-200 z-0"></div>

            {steps.map((step, index) => (
              <AnimatedSection key={index} animation="up" delay={index * 150} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-white rounded-full border-4 border-primary-50 flex items-center justify-center shadow-lg mb-6 relative group hover:border-primary-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-inner group-hover:scale-110 transition-all duration-300 group-hover:shadow-lg">
                    {step.num}
                  </div>
                </div>
                <h4 className="text-xl font-bold text-navy-900 mb-2 group-hover:text-primary-700 transition-colors">{step.title}</h4>
                <p className="text-navy-500">{step.desc}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing & CTA Section */}
      <section className="bg-gradient-to-b from-navy-50 to-white py-24 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gold-500/5 rounded-full blur-3xl animate-blob animation-delay-2000"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <AnimatedSection animation="up">
            <div className="bg-white rounded-3xl shadow-2xl p-10 md:p-16 border border-navy-100 relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10">
                <AnimatedSection animation="down" delay={100}>
                  <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-4">قدّم على Green Card Lottery بـ 1,000 ريال فقط!</h2>
                </AnimatedSection>

                <AnimatedSection animation="up" delay={200}>
                  <p className="text-lg text-navy-500 mb-8 max-w-2xl mx-auto">
                    نقدّم لك خدمة متكاملة لقرعة الهجرة العشوائية (DV Lottery): تعبئة بيانات ← فحص الصورة ← تقديم رسمي على <span dir="ltr" className="font-bold">dvprogram.state.gov</span> ← استخراج Confirmation Number. نصف سعر السوق!
                  </p>
                </AnimatedSection>

                <AnimatedSection animation="scale" delay={300}>
                  <div className="inline-flex items-center justify-center bg-navy-50 rounded-2xl py-6 px-12 mb-10 border border-navy-100 group/price hover:shadow-lg hover:border-primary-200 transition-all duration-300">
                    <span className="text-5xl md:text-6xl font-extrabold text-primary-600 mr-3 group-hover/price:scale-110 transition-transform duration-300 inline-block">
                      1,000
                    </span>
                    <div className="text-right">
                      <span className="block text-xl font-bold text-navy-700">ريال يمني</span>
                      <span className="block text-sm text-navy-400">للطلب الواحد (السوق: 2,000+)</span>
                    </div>
                  </div>
                </AnimatedSection>

                <AnimatedSection animation="up" delay={400}>
                  <div>
                    <Link
                      to="/register"
                      className="group/btn inline-flex items-center justify-center px-10 py-5 bg-gradient-to-r from-gold-500 to-gold-600 text-white rounded-xl text-xl font-bold shadow-xl shadow-gold-500/30 hover:shadow-gold-500/50 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                      <span className="relative">سجّل وقدّم على Green Card الآن</span>
                      <svg className="relative w-6 h-6 mr-3 transform rotate-180 group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                    <p className="mt-4 text-sm text-navy-400">* يسمح بتقديم طلب واحد فقط لكل شخص في الموسم الواحد حسب قوانين وزارة الخارجية الأمريكية</p>
                  </div>
                </AnimatedSection>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}
