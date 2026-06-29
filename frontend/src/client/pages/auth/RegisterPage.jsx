import { Link } from 'react-router-dom'

export default function RegisterPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-center mb-4">إنشاء حساب جديد</h1>
      <p className="text-center text-gray-500 mb-8">ابدأ رحلة التسجيل في قرعة اللوتري</p>

      <div className="bg-white p-8 rounded-xl shadow-sm border space-y-4">
        <p className="text-center text-gray-500 text-sm">
          لديك حساب بالفعل؟{' '}
          <Link to="/login" className="text-emerald-600 hover:underline">دخول</Link>
        </p>
      </div>
    </div>
  )
}
