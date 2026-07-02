import { useState } from 'react'
import SEO from '@/common/components/SEO'

const mockLogs = [
  { time: '2026-07-01 14:32:15', level: 'info', message: 'User #42 logged in successfully', source: 'auth' },
  { time: '2026-07-01 14:30:00', level: 'warn', message: 'Rate limit approaching for IP 192.168.1.1', source: 'middleware' },
  { time: '2026-07-01 14:28:45', level: 'error', message: 'Failed to verify photo for order #ORD-2026-0042', source: 'ai-service' },
  { time: '2026-07-01 14:25:00', level: 'info', message: 'Headless submission completed for 5 orders', source: 'headless' },
  { time: '2026-07-01 14:20:10', level: 'info', message: 'Payment verified for order #ORD-2026-0039', source: 'payments' },
  { time: '2026-07-01 14:15:00', level: 'error', message: 'CAPTCHA solving timeout on attempt #3', source: 'captcha' },
  { time: '2026-07-01 14:10:00', level: 'info', message: 'User #101 registered via email', source: 'auth' },
  { time: '2026-07-01 14:05:30', level: 'warn', message: 'Fraud flag level 2 detected on order #ORD-2026-0041', source: 'fraud-detection' },
]

const levelColors = {
  info: 'bg-blue-100 text-blue-700',
  warn: 'bg-gold-100 text-gold-700',
  error: 'bg-error/10 text-error',
}

export default function ServerLogs() {
  const [levelFilter, setLevelFilter] = useState('')
  const [sourceFilter, setSourceFilter] = useState('')

  const filtered = mockLogs.filter((l) => {
    if (levelFilter && l.level !== levelFilter) return false
    if (sourceFilter && l.source !== sourceFilter) return false
    return true
  })

  const sources = [...new Set(mockLogs.map((l) => l.source))]

  return (
    <div>
      <SEO title="سجلات السيرفر" />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">سجلات السيرفر</h1>
          <p className="text-navy-500 text-sm">سجل أحداث النظام</p>
        </div>
        <div className="flex gap-2">
          <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-navy-200 bg-white text-sm outline-none focus:border-primary-500">
            <option value="">جميع المستويات</option>
            <option value="info">Info</option>
            <option value="warn">Warning</option>
            <option value="error">Error</option>
          </select>
          <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-navy-200 bg-white text-sm outline-none focus:border-primary-500">
            <option value="">جميع المصادر</option>
            {sources.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-navy-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-navy-50 text-right">
                <th className="px-4 py-3 text-xs font-bold text-navy-500 uppercase">الوقت</th>
                <th className="px-4 py-3 text-xs font-bold text-navy-500 uppercase">المستوى</th>
                <th className="px-4 py-3 text-xs font-bold text-navy-500 uppercase">المصدر</th>
                <th className="px-4 py-3 text-xs font-bold text-navy-500 uppercase">الرسالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50 font-mono text-sm" dir="ltr">
              {filtered.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-12 text-center text-navy-400">لا توجد سجلات</td></tr>
              ) : (
                filtered.map((log, i) => (
                  <tr key={i} className="hover:bg-navy-25 transition-colors">
                    <td className="px-4 py-3 text-navy-400 whitespace-nowrap">{log.time}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${levelColors[log.level]}`}>{log.level}</span>
                    </td>
                    <td className="px-4 py-3 text-navy-600">{log.source}</td>
                    <td className="px-4 py-3 text-navy-900">{log.message}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
