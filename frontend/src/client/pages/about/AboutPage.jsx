import { Link } from 'react-router-dom'
import SEO, { OrganizationSchema, BreadcrumbSchema } from '../../../common/components/SEO'

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <SEO
        title="عن المنصة"
        description="قرعة (Qor3a) منصة يمنية متخصصة في التقديم على قرعة الهجرة العشوائية الأمريكية DV Lottery. نخدم اليمنيين منذ 2026."
        url="/about"
        jsonLd={[OrganizationSchema(), BreadcrumbSchema([
          { name: 'الرئيسية', path: '/' },
          { name: 'عن المنصة', path: '/about' },
        ])]}
      />
      <h1 className="text-3xl font-bold text-navy-900 mb-8">عن المنصة</h1>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-navy-800 mb-4">من نحن؟</h2>
        <p className="text-navy-600 leading-relaxed mb-4">
          قرعة هي منصة يمنية متخصصة في مساعدة الراغبين في التقديم على قرعة الهجرة العشوائية
          إلى الولايات المتحدة الأمريكية (DV Lottery). نقدم خدمة متكاملة تشمل التحقق من
          الصور، التقديم الإلكتروني، ومتابعة النتائج.
        </p>
        <p className="text-navy-600 leading-relaxed">
          تأسست المنصة بهدف توفير خدمة موثوقة وبأسعار معقولة لليمنيين في الداخل والخارج،
          بسعر لا يتجاوز نصف ما تقدمه مكاتب الخدمات التقليدية.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-navy-800 mb-4">رؤيتنا</h2>
        <p className="text-navy-600 leading-relaxed">
          أن نكون المنصة الرقمية الأولى والموثوقة في اليمن للخدمات الحكومية الإلكترونية،
          بدءاً من قرعة الهجرة وصولاً إلى خدمات التأشيرات والترجمة وجوازات السفر.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-navy-800 mb-4">قيمنا</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-navy-100">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-bold text-navy-900 mb-2">الموثوقية</h3>
            <p className="text-navy-500 text-sm">بياناتك آمنة ومشفرة، ونلتزم بأعلى معايير الخصوصية.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-navy-100">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-navy-900 mb-2">السرعة</h3>
            <p className="text-navy-500 text-sm">عملية التقديم بأكملها لا تستغرق أكثر من 15 دقيقة.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-navy-100">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-navy-900 mb-2">السعر المعقول</h3>
            <p className="text-navy-500 text-sm">نصف سعر السوق، 1,000 ريال يمني فقط لكل طلب.</p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-navy-800 mb-4">فريق العمل</h2>
        <p className="text-navy-600 leading-relaxed mb-4">
          فريق قرعة مكون من مطورين ومتخصصين في مجال الهجرة والتكنولوجيا،
          يعملون معاً لتقديم أفضل تجربة ممكنة للمستخدمين.
        </p>
        <Link
          to="/help"
          className="inline-flex items-center gap-2 text-primary-600 font-bold hover:text-primary-700"
        >
          تواصل معنا
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </section>
    </div>
  )
}
