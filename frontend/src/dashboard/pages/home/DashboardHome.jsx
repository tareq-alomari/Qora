export default function DashboardHome() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">📊 لوحة التحكم</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'بانتظار المراجعة', value: '12', color: 'bg-amber-50 text-amber-700' },
          { label: 'دفع بانتظار التأكيد', value: '5', color: 'bg-blue-50 text-blue-700' },
          { label: 'جاهز للإدخال الرسمي', value: '3', color: 'bg-green-50 text-green-700' },
          { label: 'يحتاج تعديل', value: '2', color: 'bg-red-50 text-red-700' },
        ].map((card) => (
          <div key={card.label} className={`p-4 rounded-xl ${card.color}`}>
            <div className="text-3xl font-bold">{card.value}</div>
            <div className="text-sm mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="font-semibold mb-4">آخر الطلبات</h2>
        <p className="text-gray-400 text-center py-8">قيد التطوير</p>
      </div>
    </div>
  )
}
