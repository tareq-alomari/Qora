import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../../common/services/api'
import toast from 'react-hot-toast'
import SEO from '../../../common/components/SEO'

export default function EmployeePerformance() {
  const { id } = useParams()
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    api.get(`/admin/users/${id}`)
      .then(({ data }) => setEmployee(data.data))
      .catch((err) => toast.error(err.response?.data?.error?.message || 'فشل تحميل بيانات الموظف'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="text-center py-20 text-navy-400">جارٍ التحميل...</div>
  if (!employee) return <div className="text-center py-20 text-navy-400">الموظف غير موجود</div>

  return (
    <div>
      <SEO title={`أداء الموظف - ${employee.full_name || ''}`} />
      <div className="mb-6">
        <Link to="/dashboard/admin/users" className="text-sm text-primary-600 hover:text-primary-700 mb-2 inline-block">
          &larr; العودة إلى المستخدمين
        </Link>
        <h1 className="text-2xl font-bold text-navy-900">{employee.full_name}</h1>
        <p className="text-navy-500 text-sm">{employee.email || employee.phone}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-navy-100 text-center">
          <p className="text-3xl font-black text-primary-600">—</p>
          <p className="text-navy-500 text-sm mt-1">طلبات اليوم</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-navy-100 text-center">
          <p className="text-3xl font-black text-gold-600">—</p>
          <p className="text-navy-500 text-sm mt-1">طلبات هذا الأسبوع</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-navy-100 text-center">
          <p className="text-3xl font-black text-success">—</p>
          <p className="text-navy-500 text-sm mt-1">معدل الإنجاز</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-8 border border-navy-100">
        <h2 className="text-lg font-bold text-navy-900 mb-4">معلومات الموظف</h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-xs font-bold text-navy-400 uppercase mb-1">الاسم</dt>
            <dd className="text-navy-900 font-medium">{employee.full_name || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold text-navy-400 uppercase mb-1">البريد الإلكتروني</dt>
            <dd className="text-navy-900 font-medium" dir="ltr">{employee.email || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold text-navy-400 uppercase mb-1">رقم الهاتف</dt>
            <dd className="text-navy-900 font-medium" dir="ltr">{employee.phone || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold text-navy-400 uppercase mb-1">الدور</dt>
            <dd className="text-navy-900 font-medium">{employee.role === 'admin' ? 'مدير' : 'موظف'}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold text-navy-400 uppercase mb-1">تاريخ التسجيل</dt>
            <dd className="text-navy-900 font-medium">
              {employee.created_at ? new Date(employee.created_at).toLocaleDateString('ar-YE') : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold text-navy-400 uppercase mb-1">الحالة</dt>
            <dd className="text-navy-900 font-medium">{employee.is_active !== false ? 'نشط' : 'موقوف'}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
