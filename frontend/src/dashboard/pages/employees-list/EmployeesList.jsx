import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '@/common/services/api'
import toast from 'react-hot-toast'
import SEO from '@/common/components/SEO'

export default function EmployeesList() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/users', { params: { role: 'employee', limit: 100 } })
      .then(({ data }) => setEmployees(data.data || []))
      .catch((err) => toast.error('فشل تحميل الموظفين'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-20 text-navy-400">جارٍ التحميل...</div>

  return (
    <div>
      <SEO title="الموظفون" />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">الموظفون</h1>
          <p className="text-navy-500 text-sm">قائمة بجميع الموظفين</p>
        </div>
        <Link to="/dashboard/admin/users" className="px-4 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-bold hover:bg-primary-600 transition-colors">
          إدارة المستخدمين
        </Link>
      </div>

      {employees.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-navy-100">
          <p className="text-navy-500 font-bold">لا يوجد موظفون</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((emp) => (
            <Link
              key={emp.id}
              to={`/dashboard/admin/users/${emp.id}`}
              className="bg-white rounded-2xl p-6 border border-navy-100 hover:shadow-lg hover:border-primary-100 transition-all group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-lg">
                  {emp.full_name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="font-bold text-navy-900 group-hover:text-primary-700 transition-colors">{emp.full_name}</p>
                  <p className="text-xs text-navy-400" dir="ltr">{emp.email || emp.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-navy-400">
                <span className={`inline-block px-2 py-0.5 rounded-full font-bold ${
                  emp.is_active !== false ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                }`}>
                  {emp.is_active !== false ? 'نشط' : 'موقوف'}
                </span>
                <span>{new Date(emp.created_at).toLocaleDateString('ar-YE')}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
