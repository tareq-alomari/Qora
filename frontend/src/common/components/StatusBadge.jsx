import { getStatusLabel, getStatusColor } from '../utils/formatters'

export default function StatusBadge({ status, size = 'sm' }) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  }

  return (
    <span
      className={`inline-block rounded-full font-medium ${sizeClasses[size] || sizeClasses.sm} ${getStatusColor(status)}`}
    >
      {getStatusLabel(status)}
    </span>
  )
}
