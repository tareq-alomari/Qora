import { getStatusLabel } from '../utils/formatters'

export default function Pagination({ page, totalPages, total, onPageChange }) {
  if (!total || totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
      <span className="text-sm text-gray-500">
        إجمالي {total} نتيجة
      </span>
      <div className="flex gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-white"
        >
          السابق
        </button>
        <span className="px-3 py-1.5 text-sm text-gray-600">
          صفحة {page} من {totalPages}
        </span>
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-white"
        >
          التالي
        </button>
      </div>
    </div>
  )
}
