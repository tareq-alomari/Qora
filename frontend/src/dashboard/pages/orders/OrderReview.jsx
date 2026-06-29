import { useParams, Link } from 'react-router-dom'

export default function OrderReview() {
  const { id } = useParams()

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/dashboard/orders" className="hover:text-emerald-600">الطلبات</Link>
        <span>/</span>
        <span>طلب #{id}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Right: Photo + AI */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="font-semibold mb-4">📸 الصورة الشخصية</h2>
          <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center text-gray-400 mb-4">
            الصورة هنا
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-green-600">✅ مركز الوجه: 95%</p>
            <p className="text-green-600">✅ الخلفية بيضاء: 88%</p>
            <p className="text-green-600">✅ الإضاءة: 92%</p>
            <p className="text-green-600">✅ الوضوح: 90%</p>
          </div>
        </div>

        {/* Middle: Client Info */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="font-semibold mb-4">👤 معلومات العميل</h2>
          <div className="space-y-3 text-sm">
            {[
              ['الاسم', 'أحمد محمد عبدالله'],
              ['تاريخ الميلاد', '15/05/1990'],
              ['الدولة', 'اليمن'],
              ['المؤهل', 'بكالوريوس'],
              ['الحالة', 'متزوج'],
              ['الأبناء', '2'],
              ['البريد', 'ahmed@email.com'],
              ['الهاتف', '777123456'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <span className="text-gray-500">{label}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Left: Payment + Actions */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="font-semibold mb-4">💳 معلومات الدفع</h2>
            <div className="space-y-2 text-sm">
              <p>المبلغ: <strong>$20</strong></p>
              <p>الطريقة: <strong>كريمي</strong></p>
              <p>رقم الحوالة: <strong>123456789</strong></p>
              <button className="text-emerald-600 hover:underline text-sm">عرض صورة الإشعار</button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="font-semibold mb-4">📝 الإجراء</h2>
            <div className="space-y-3">
              <button className="w-full bg-emerald-600 text-white py-2.5 rounded-lg hover:bg-emerald-700 font-medium">
                ✅ اعتماد الطلب
              </button>
              <button className="w-full bg-amber-500 text-white py-2.5 rounded-lg hover:bg-amber-600 font-medium">
                📝 يحتاج تعديل
              </button>
              <button className="w-full bg-red-500 text-white py-2.5 rounded-lg hover:bg-red-600 font-medium">
                ❌ رفض
              </button>
              <textarea
                placeholder="ملاحظات..."
                className="w-full border rounded-lg p-3 text-sm mt-2"
                rows="3"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
