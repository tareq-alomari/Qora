import { Link } from 'react-router-dom'

const mockOrders = [
  { id: 1, client: 'أحمد محمد', status: 'مراجعة', statusColor: 'bg-amber-100 text-amber-700', photo: '✅', payment: '⏳', date: '15/09' },
  { id: 2, client: 'سارة علي', status: 'صورة مقبولة', statusColor: 'bg-green-100 text-green-700', photo: '✅', payment: '-', date: '15/09' },
  { id: 3, client: 'خالد عبدالله', status: 'يحتاج تعديل', statusColor: 'bg-red-100 text-red-700', photo: '✅', payment: '✅', date: '14/09' },
  { id: 4, client: 'فاطمة أحمد', status: 'بانتظار الدفع', statusColor: 'bg-blue-100 text-blue-700', photo: '✅', payment: '❌', date: '14/09' },
]

export default function OrdersList() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📋 الطلبات</h1>
        <div className="flex gap-2">
          {['الكل', 'بانتظار المراجعة', 'بانتظار الدفع', 'مقبول', 'مكتمل'].map((filter) => (
            <button key={filter} className="px-3 py-1.5 text-sm rounded-lg border hover:bg-gray-50">
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">#</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">العميل</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">الحالة</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">الصورة</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">الدفع</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">التاريخ</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">إجراء</th>
            </tr>
          </thead>
          <tbody>
            {mockOrders.map((order) => (
              <tr key={order.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">{order.id}</td>
                <td className="px-4 py-3 text-sm font-medium">{order.client}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${order.statusColor}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">{order.photo}</td>
                <td className="px-4 py-3 text-sm">{order.payment}</td>
                <td className="px-4 py-3 text-sm">{order.date}</td>
                <td className="px-4 py-3">
                  <Link
                    to={`/dashboard/orders/${order.id}`}
                    className="text-emerald-600 hover:underline text-sm"
                  >
                    عرض
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
