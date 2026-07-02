import { Link } from 'react-router-dom'
import SEO, { BreadcrumbSchema } from '../../../common/components/SEO'

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <SEO
        title="الشروط والأحكام"
        description="الشروط والأحكام لاستخدام منصة قرعة للتقديم على قرعة الهجرة العشوائية الأمريكية DV Lottery."
        url="/terms"
        jsonLd={[BreadcrumbSchema([
          { name: 'الرئيسية', path: '/' },
          { name: 'الشروط', path: '/terms' },
        ])]}
      />
      <h1 className="text-3xl font-bold text-navy-900 mb-2">الشروط والأحكام</h1>
      <p className="text-navy-400 text-sm mb-8">آخر تحديث: يوليو 2026</p>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-navy-800 mb-4">1. قبول الشروط</h2>
        <p className="text-navy-600 leading-relaxed mb-4">
          باستخدامك لمنصة قرعة، فإنك توافق على هذه الشروط والأحكام. إذا كنت لا توافق
          على أي جزء من هذه الشروط، يجب عليك التوقف عن استخدام المنصة فوراً.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-navy-800 mb-4">2. وصف الخدمة</h2>
        <p className="text-navy-600 leading-relaxed mb-4">
          قرعة هي منصة تقنية تقدم خدمة المساعدة في تعبئة طلبات قرعة الهجرة العشوائية
          (DV Lottery) وتقديمها إلكترونياً. نحن لسنا جهة حكومية ولا نضمن الفوز بالقرعة.
        </p>
        <p className="text-navy-600 leading-relaxed mb-4">
          خدماتنا تشمل:
        </p>
        <ul className="list-disc list-inside text-navy-600 space-y-2 mr-4">
          <li>التحقق الآلي من الصور الشخصية حسب مواصفات وزارة الخارجية الأمريكية</li>
          <li>تعبئة نموذج التقديم الإلكتروني</li>
          <li>تقديم الطلب إلى الموقع الرسمي</li>
          <li>متابعة النتائج في الموعد الرسمي</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-navy-800 mb-4">3. مسؤولية المستخدم</h2>
        <p className="text-navy-600 leading-relaxed mb-4">
          يتحمل المستخدم المسؤولية الكاملة عن:
        </p>
        <ul className="list-disc list-inside text-navy-600 space-y-2 mr-4">
          <li>صحة ودقة المعلومات المدخلة في الطلب</li>
          <li>مطابقة الصورة الشخصية للمواصفات الرسمية</li>
          <li>الاحتفاظ برقم التأكيد (Confirmation Number) بعد التقديم</li>
          <li>عدم مشاركة معلومات الحساب مع أي شخص آخر</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-navy-800 mb-4">4. إخلاء مسؤولية</h2>
        <p className="text-navy-600 leading-relaxed mb-4">
          لا نضمن الفوز بقرعة الهجرة. قرعة الهجرة العشوائية هي عملية انتقائية تعتمد
          على معايير وزارة الخارجية الأمريكية وحدها. نحن نقدم خدمة مساعدة في التقديم فقط.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-navy-800 mb-4">5. الخصوصية</h2>
        <p className="text-navy-600 leading-relaxed mb-4">
          جميع بيانات المستخدمين مشفرة ومحمية. لمعرفة المزيد، راجع{' '}
          <Link to="/privacy" className="text-primary-600 hover:text-primary-700 font-bold">سياسة الخصوصية</Link>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-navy-800 mb-4">6. الإلغاء والاسترداد</h2>
        <p className="text-navy-600 leading-relaxed mb-4">
          بعد تقديم الطلب رسمياً إلى موقع القرعة، لا يمكن استرداد الرسوم. يمكن إلغاء
          الطلب قبل التقديم الرسمي وسيتم استرداد المبلغ بالكامل.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-navy-800 mb-4">7. التواصل</h2>
        <p className="text-navy-600 leading-relaxed mb-4">
          للاستفسارات، يرجى التواصل عبر البريد الإلكتروني:{' '}
          <span className="font-bold" dir="ltr">support@qor3a.com</span>
        </p>
      </section>
    </div>
  )
}
