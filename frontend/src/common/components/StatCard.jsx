export default function StatCard({ label, value, color = 'bg-primary-500' }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 lg:p-6">
      <div className={`w-10 h-10 rounded-lg ${color} bg-opacity-20 flex items-center justify-center mb-3`}>
        <div className={`w-5 h-5 rounded-sm ${color}`} />
      </div>
      <div className="text-2xl lg:text-3xl font-bold text-gray-800">{value}</div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
  )
}
