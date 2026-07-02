import { Link } from 'react-router-dom'
import SEO, { BreadcrumbSchema } from '../../../common/components/SEO'

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <SEO
        title="سياسة الخصوصية"
        description="سياسة الخصوصية لمنصة قرعة — كيف نحمي بياناتك الشخصية ونستخدمها في تقديم خدمة التقديم على قرعة الهجرة العشوائية DV Lottery."
        url="/privacy"
        jsonLd={[BreadcrumbSchema([
          { name: 'الرئيسية', path: '/' },
          { name: 'الخصوصية', path: '/privacy' },
        ])]}
      />
      <h1 className="text-3xl font-bold text-navy-900 mb-2">سياسة الخصوصية</h1>
      <p className="text-navy-400 text-sm mb-8">آخر تحديث: يوليو 2026</p>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-navy-800 mb-4">1. المعلومات التي نجمعها</h2>
        <p className="text-navy-600 leading-relaxed mb-4">
          نجمع المعلومات التالية لتقديم خدمة التقديم على قرعة الهجرة:
        </p>
        <ul className="list-disc list-inside text-navy-600 space-y-2 mr-4">
          <li>المعلومات الشخصية: الاسم، تاريخ الميلاد، الجنس، الحالة الاجتماعية</li>
          <li>معلومات الاتصال: رقم الهاتف، البريد الإلكتروني</li>
          <li>معلومات جواز السفر</li>
          <li>الصور الشخصية (لأغراض التقديم فقط)</li>
          <li>معلومات الدفع (صورة الإيصال، رقم الحوالة)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-navy-800 mb-4">2. كيفية استخدام المعلومات</h2>
        <p className="text-navy-600 leading-relaxed mb-4">
          تستخدم معلوماتك للأغراض التالية فقط:
        </p>
        <ul className="list-disc list-inside text-navy-600 space-y-2 mr-4">
          <li>تعبئة وتقديم طلب قرعة الهجرة إلى الموقع الرسمي</li>
          <li>التحقق من هويتك</li>
          <li>التواصل معك بخصوص حالة طلبك</li>
          <li>تحسين خدماتنا</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-navy-800 mb-4">3. حماية البيانات</h2>
        <p className="text-navy-600 leading-relaxed mb-4">
          نستخدم أحدث معايير الأمان لحماية بياناتك:
        </p>
        <ul className="list-disc list-inside text-navy-600 space-y-2 mr-4">
          <li>تشفير AES-256 لجميع البيانات الحساسة</li>
          <li>نقل البيانات عبر HTTPS/TLS 1.3</li>
          <li>التحكم الصارم في الوصول إلى البيانات (صلاحيات الموظفين)</li>
          <li>تسجيل جميع عمليات الوصول إلى البيانات في سجل التدقيق</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-navy-800 mb-4">4. مشاركة البيانات</h2>
        <p className="text-navy-600 leading-relaxed mb-4">
          لا نشارك معلوماتك مع أي طرف ثالث إلا في الحالات التالية:
        </p>
        <ul className="list-disc list-inside text-navy-600 space-y-2 mr-4">
          <li>عند تقديم طلب القرعة إلى وزارة الخارجية الأمريكية (الموقع الرسمي)</li>
          <li>عندما يطلب منا القانون ذلك</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-navy-800 mb-4">5. الاحتفاظ بالبيانات</h2>
        <p className="text-navy-600 leading-relaxed mb-4">
          نحتفظ ببياناتك طوال فترة موسم القرعة وبعدها لمدة 6 أشهر، ثم تُحذف جميع
          البيانات الحساسة تلقائياً. يمكنك طلب حذف بياناتك في أي وقت قبل تقديم الطلب.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-navy-800 mb-4">6. حقوقك</h2>
        <p className="text-navy-600 leading-relaxed mb-4">
          لديك الحق في:
        </p>
        <ul className="list-disc list-inside text-navy-600 space-y-2 mr-4">
          <li>الوصول إلى بياناتك الشخصية</li>
          <li>تصحيح أي بيانات غير دقيقة</li>
          <li>طلب حذف بياناتك</li>
          <li>طلب نسخة من بياناتك</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-navy-800 mb-4">7. الاتصال بنا</h2>
        <p className="text-navy-600 leading-relaxed mb-4">
          إذا كان لديك أي استفسار حول سياسة الخصوصية، يرجى التواصل عبر:{' '}
          <span className="font-bold" dir="ltr">support@qor3a.com</span>
        </p>
        <Link
          to="/terms"
          className="inline-flex items-center gap-2 text-primary-600 font-bold hover:text-primary-700"
        >
          راجع الشروط والأحكام
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </section>
    </div>
  )
}
