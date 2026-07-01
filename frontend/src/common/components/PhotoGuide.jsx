import { useState } from 'react'

const REQUIREMENTS = [
  {
    label: 'خلفية بيضاء',
    desc: 'تأكد من أن الخلفية بيضاء بالكامل وخالية من أي رسومات أو ظلال',
  },
  {
    label: 'الوجه في المنتصف',
    desc: 'يجب أن يكون وجهك في وسط الصورة مع ظهور كامل الرأس والكتفين',
  },
  {
    label: 'إضاءة متساوية',
    desc: 'تأكد من إضاءة متجانسة على الوجه بدون ظلال أو بقع ضوئية',
  },
  {
    label: 'بدون نظارات شمسية',
    desc: 'يمكن ارتداء النظارات الطبية ولكن بدون نظارات شمسية أو ملونة',
  },
  {
    label: 'تعبير محايد',
    desc: 'كن بتعبير وجه طبيعي مع إغلاق الفم وفتح العينين',
  },
]

const VIOLATIONS = [
  { label: 'خلفية ملونة' },
  { label: 'وجه غير مركز' },
  { label: 'ظلال على الوجه' },
  { label: 'نظارات شمسية' },
  { label: 'ابتسامة واسعة' },
]

function GuideContent() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm font-bold text-green-700 mb-3 text-center">✔️ الصحيح</p>
          <div className="space-y-2">
            {REQUIREMENTS.map((req) => (
              <div key={req.label} className="flex items-start gap-2 text-sm">
                <span className="text-success shrink-0 mt-0.5">✓</span>
                <div>
                  <span className="font-semibold text-gray-700">{req.label}</span>
                  <p className="text-gray-500 text-xs">{req.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm font-bold text-red-700 mb-3 text-center">✖️ الخطأ</p>
          <div className="space-y-2">
            {VIOLATIONS.map((v) => (
              <div key={v.label} className="flex items-center gap-2 text-sm">
                <span className="text-error shrink-0">✗</span>
                <span className="text-gray-600">{v.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm font-bold text-amber-700 mb-2">💡 نصائح إضافية</p>
        <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
          <li>استخدم كاميرا بدقة عالية (يفضل 5 ميجابكسل فأكثر)</li>
          <li>تجنب استخدام الفلاش المباشر</li>
          <li>الصورة يجب أن تكون حديثة (خلال آخر 6 أشهر)</li>
          <li>لا ترتدي غطاء رأس إلا للأغراض الدينية مع إظهار كامل الوجه</li>
          <li>تأكد من عدم وجود أشخاص آخرين في الصورة</li>
        </ul>
      </div>
    </div>
  )
}

export default function PhotoGuide({ collapsible = false }) {
  const [open, setOpen] = useState(false)

  if (!collapsible) return <GuideContent />

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-primary-500 text-sm font-semibold hover:underline"
      >
        <svg
          className={`w-4 h-4 transition-transform ${open ? 'rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        إرشادات الصورة الشخصية
      </button>
      {open && (
        <div className="mt-3">
          <GuideContent />
        </div>
      )}
    </div>
  )
}
