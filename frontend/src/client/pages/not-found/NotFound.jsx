import { Link } from 'react-router-dom'
import SEO from '../../../common/components/SEO'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-50 to-white p-4">
      <SEO title="الصفحة غير موجودة - 404" />
      <div className="text-center max-w-md">
        <div className="text-8xl font-black text-navy-200 mb-4">404</div>
        <h1 className="text-3xl font-bold text-navy-900 mb-4">الصفحة غير موجودة</h1>
        <p className="text-navy-500 mb-8">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="bg-primary-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-600 transition-colors"
          >
            العودة إلى الرئيسية
          </Link>
          <Link
            to="/help"
            className="bg-white text-navy-900 px-8 py-3 rounded-xl font-bold border border-navy-200 hover:bg-navy-50 transition-colors"
          >
            المساعدة
          </Link>
        </div>
      </div>
    </div>
  )
}
