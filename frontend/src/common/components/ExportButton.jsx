import { useState, useRef, useEffect } from 'react'

export default function ExportButton({ onExport, filename, loading, disabled }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        disabled={disabled}
        className="bg-primary-500 text-white px-4 py-2.5 rounded-lg text-sm hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-2"
      >
        {loading ? (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )}
        تصدير
      </button>
      {open && (
        <div className="absolute left-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-50">
          <button
            onClick={() => { setOpen(false); onExport('csv') }}
            disabled={disabled || loading}
            className="w-full text-right px-4 py-2.5 text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            CSV
          </button>
          <button
            disabled
            className="w-full text-right px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed"
          >
            Excel (قريباً)
          </button>
        </div>
      )}
    </div>
  )
}
