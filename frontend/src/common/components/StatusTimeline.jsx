import { getStatusLabel } from '../utils/formatters'
import { formatDateTime } from '../utils/formatters'

export default function StatusTimeline({ logs }) {
  if (!logs || logs.length === 0) return null

  return (
    <div className="space-y-4">
      {logs.map((log, idx) => (
        <div key={idx} className="flex gap-3 text-sm">
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-primary-500 mt-1" />
            {idx < logs.length - 1 && <div className="w-0.5 flex-1 bg-gray-200" />}
          </div>
          <div>
            <p className="font-medium text-gray-700">
              {getStatusLabel(log.to_status)}
            </p>
            <p className="text-gray-400 text-xs">
              {formatDateTime(log.created_at)}
              {log.user?.full_name ? ` - ${log.user.full_name}` : ''}
            </p>
            {log.notes && <p className="text-gray-500 mt-1">{log.notes}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}
