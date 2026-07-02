import { useState } from 'react'
import toast from 'react-hot-toast'
import SEO from '@/common/components/SEO'

export default function BackupsPage() {
  const [backingUp, setBackingUp] = useState(false)
  const [backups] = useState([
    { name: 'auto-backup-2026-07-01.sql', size: '2.4 MB', date: '2026-07-01 03:00', type: 'تلقائي' },
    { name: 'auto-backup-2026-06-30.sql', size: '2.3 MB', date: '2026-06-30 03:00', type: 'تلقائي' },
    { name: 'manual-backup-2026-06-28.sql', size: '2.3 MB', date: '2026-06-28 14:30', type: 'يدوي' },
  ])

  const handleBackup = async () => {
    setBackingUp(true)
    // Simulate backup
    await new Promise((r) => setTimeout(r, 2000))
    setBackingUp(false)
    toast.success('تم إنشاء النسخة الاحتياطية')
  }

  return (
    <div>
      <SEO title="النسخ الاحتياطي" />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">النسخ الاحتياطي</h1>
          <p className="text-navy-500 text-sm">إدارة النسخ الاحتياطية لقاعدة البيانات</p>
        </div>
        <button
          onClick={handleBackup}
          disabled={backingUp}
          className="px-4 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-bold hover:bg-primary-600 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {backingUp ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> جاري النسخ...</>
          ) : (
            <>نسخ احتياطي الآن</>
          )}
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-navy-100 mb-6">
        <h2 className="text-lg font-bold text-navy-900 mb-2">إعدادات النسخ التلقائي</h2>
        <p className="text-navy-500 text-sm mb-4">يتم إنشاء نسخة احتياطية تلقائياً يومياً في الساعة 3:00 صباحاً.</p>
        <div className="bg-navy-50 rounded-xl p-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-navy-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-navy-600">آخر نسخة: {backups[0]?.date || '—'}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-navy-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-navy-100">
          <h2 className="font-bold text-navy-900">النسخ المحفوظة</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-navy-50 text-right">
                <th className="px-6 py-3 text-xs font-bold text-navy-500 uppercase">الملف</th>
                <th className="px-6 py-3 text-xs font-bold text-navy-500 uppercase">الحجم</th>
                <th className="px-6 py-3 text-xs font-bold text-navy-500 uppercase">التاريخ</th>
                <th className="px-6 py-3 text-xs font-bold text-navy-500 uppercase">النوع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {backups.map((b, i) => (
                <tr key={i} className="hover:bg-navy-25 transition-colors">
                  <td className="px-6 py-4 font-medium text-navy-900">{b.name}</td>
                  <td className="px-6 py-4 text-sm text-navy-500">{b.size}</td>
                  <td className="px-6 py-4 text-sm text-navy-500">{b.date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${
                      b.type === 'تلقائي' ? 'bg-primary-50 text-primary-600' : 'bg-gold-50 text-gold-600'
                    }`}>{b.type}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
