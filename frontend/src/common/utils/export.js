export function exportToCSV(data, filename, columns) {
  const BOM = '\uFEFF'
  const header = columns.map(c => escapeCSV(c.label)).join(',')
  const rows = data.map(item =>
    columns.map(c => {
      const raw = item[c.key] ?? ''
      const val = c.transform ? c.transform(raw, item) : raw
      return escapeCSV(val)
    }).join(',')
  )
  const csv = BOM + header + '\n' + rows.join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, `${filename}.csv`)
}

function escapeCSV(value) {
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"'
  }
  return str
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
