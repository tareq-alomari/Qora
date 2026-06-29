import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16 text-center">
      <h1 className="text-5xl font-bold text-gray-900 mb-4">
        🎯 سجّل في قرعة اللوتري
        <br />
        <span className="text-emerald-600">في أقل من 5 دقائق</span>
      </h1>
      <p className="text-xl text-gray-500 mb-8 max-w-2xl mx-auto">
        صور احترافية مطابقة للمواصفات • مراجعة البيانات • فحص النتيجة تلقائياً
      </p>

      <div className="flex justify-center gap-4 mb-16">
        <Link
          to="/register"
          className="bg-emerald-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-emerald-700 shadow-lg"
        >
          🚀 ابدأ التسجيل الآن
        </Link>
        <Link
          to="/login"
          className="border-2 border-emerald-600 text-emerald-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-emerald-50"
        >
          دخول
        </Link>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-right">
        {[
          { step: '1', title: 'أدخل بياناتك', desc: 'اسمك، تاريخ ميلادك، مؤهلك العلمي', icon: '📝' },
          { step: '2', title: 'صوّر صورتك', desc: 'كاميرتك + AI يفحصها فوراً', icon: '📸' },
          { step: '3', title: 'ادفع أونلاين', desc: 'حوالة كريمي أو بنك', icon: '💳' },
          { step: '4', title: 'استلم رقم التأكيد', desc: 'ونحن نفحص النتيجة لك', icon: '✅' },
        ].map((item) => (
          <div key={item.step} className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="text-4xl mb-3">{item.icon}</div>
            <h3 className="font-bold text-lg mb-1">{item.title}</h3>
            <p className="text-gray-500 text-sm">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
