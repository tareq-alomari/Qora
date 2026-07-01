import { useState, useEffect, useCallback } from 'react'
import api from '@/common/services/api'
import toast from 'react-hot-toast'
import ExportButton from '@/common/components/ExportButton'
import { exportToCSV } from '@/common/utils/export'

const roleLabels = { admin: 'مدير', employee: 'موظف', client: 'عميل' }
const roleColors = { admin: 'bg-purple-100 text-purple-700', employee: 'bg-blue-100 text-blue-700', client: 'bg-green-100 text-green-700' }

const emptyUser = { full_name: '', phone: '', email: '', password: '', role: 'employee', is_active: true }

export default function UsersManagement() {
  const [users, setUsers] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [saving, setSaving] = useState(false)
  const limit = 20

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit }
      if (search) params.search = search
      const { data } = await api.get('/admin/users', { params })
      setUsers(data.data || [])
      setMeta(data.meta)
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'فشل تحميل المستخدمين')
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const openCreate = () => {
    setEditUser({ ...emptyUser })
    setModalOpen(true)
  }

  const openEdit = (user) => {
    setEditUser({ full_name: user.full_name, phone: user.phone, email: user.email, password: '', role: user.role, is_active: user.is_active })
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!editUser.full_name || !editUser.phone) {
      toast.error('الاسم والهاتف مطلوبان')
      return
    }
    setSaving(true)
    try {
      if (editUser.id) {
        const payload = { full_name: editUser.full_name, phone: editUser.phone, email: editUser.email, role: editUser.role, is_active: editUser.is_active }
        if (editUser.password) payload.password = editUser.password
        await api.patch(`/admin/users/${editUser.id}`, payload)
        toast.success('تم تحديث المستخدم')
      } else {
        if (!editUser.password) { toast.error('كلمة المرور مطلوبة للمستخدم الجديد'); setSaving(false); return }
        await api.post('/admin/users', editUser)
        toast.success('تم إنشاء المستخدم')
      }
      setModalOpen(false)
      setEditUser(null)
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'فشل حفظ المستخدم')
    } finally {
      setSaving(false)
    }
  }

  const handleExport = () => {
    const rows = users.map(u => ({
      name: u.full_name,
      phone: u.phone || '-',
      email: u.email || '-',
      role: roleLabels[u.role] || u.role,
      status: u.is_active ? 'نشط' : 'غير نشط',
      orders_count: u.orders_count ?? 0,
      created_at: u.created_at ? new Date(u.created_at).toLocaleDateString('ar-SA') : '-',
    }))
    const filename = `المستخدمون-${new Date().toISOString().slice(0, 10)}`
    exportToCSV(rows, filename, [
      { key: 'name', label: 'الاسم' },
      { key: 'phone', label: 'الهاتف' },
      { key: 'email', label: 'البريد' },
      { key: 'role', label: 'الدور' },
      { key: 'status', label: 'الحالة' },
      { key: 'orders_count', label: 'عدد الطلبات' },
      { key: 'created_at', label: 'تاريخ الإنشاء' },
    ])
  }

  const totalPages = meta ? Math.ceil(meta.total / limit) : 1

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">👥 إدارة المستخدمين</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="بحث..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full sm:w-64 border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          />
          <ExportButton onExport={handleExport} disabled={!users.length} />
          <button
            onClick={openCreate}
            className="bg-primary-500 text-white px-4 py-2.5 rounded-lg text-sm hover:bg-primary-600 whitespace-nowrap"
          >
            + مستخدم جديد
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">الاسم</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">الهاتف</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">البريد</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">الدور</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">الحالة</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">تاريخ الإنشاء</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">جاري التحميل...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">لا يوجد مستخدمون</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{user.full_name}</td>
                    <td className="px-4 py-3 text-sm">{user.phone || '-'}</td>
                    <td className="px-4 py-3 text-sm">{user.email || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${roleColors[user.role] || 'bg-gray-100 text-gray-700'}`}>
                        {roleLabels[user.role] || user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {user.is_active ? 'نشط' : 'غير نشط'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('ar-SA') : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openEdit(user)}
                        className="text-primary-500 hover:text-primary-700 text-sm font-medium"
                      >
                        تعديل
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta && meta.total > limit && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
            <span className="text-sm text-gray-500">إجمالي {meta.total} مستخدم</span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-white"
              >
                السابق
              </button>
              <span className="px-3 py-1.5 text-sm text-gray-600">صفحة {page} من {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-white"
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">
              {editUser?.id ? 'تعديل مستخدم' : 'مستخدم جديد'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل *</label>
                <input
                  type="text"
                  value={editUser.full_name}
                  onChange={(e) => setEditUser({ ...editUser, full_name: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الهاتف *</label>
                <input
                  type="text"
                  value={editUser.phone}
                  onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={editUser.email}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  كلمة المرور {editUser.id ? '(اتركه فارغاً إن لم ترد التغيير)' : '*'}
                </label>
                <input
                  type="password"
                  value={editUser.password}
                  onChange={(e) => setEditUser({ ...editUser, password: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الدور</label>
                <select
                  value={editUser.role}
                  onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="employee">موظف</option>
                  <option value="admin">مدير</option>
                  <option value="client">عميل</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={editUser.is_active}
                  onChange={(e) => setEditUser({ ...editUser, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">نشط</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-primary-500 text-white py-2.5 rounded-lg hover:bg-primary-600 font-medium disabled:opacity-50"
                >
                  {saving ? 'جاري الحفظ...' : 'حفظ'}
                </button>
                <button
                  type="button"
                  onClick={() => { setModalOpen(false); setEditUser(null) }}
                  className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg hover:bg-gray-200 font-medium"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
