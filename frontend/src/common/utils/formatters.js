import {
  STATUS_LABELS,
  STATUS_COLORS,
  EDUCATION_LEVELS,
  MARITAL_STATUSES,
  GENDERS,
  RESULT_LABELS,
} from './constants'

export function formatDate(dateStr) {
  if (!dateStr) return '-'
  try {
    return new Date(dateStr).toLocaleDateString('ar-SA')
  } catch {
    return '-'
  }
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '-'
  try {
    return new Date(dateStr).toLocaleString('ar-SA')
  } catch {
    return '-'
  }
}

export function formatDateLong(dateStr) {
  if (!dateStr) return '-'
  try {
    return new Date(dateStr).toLocaleDateString('ar-YE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return '-'
  }
}

export function formatNumber(num) {
  if (num === null || num === undefined) return '0'
  return new Intl.NumberFormat('ar-SA').format(num)
}

export function formatCurrency(amount, currency = 'USD') {
  if (amount === null || amount === undefined) return '$0'
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount)
}

export function getStatusLabel(status) {
  return STATUS_LABELS[status] || status || '-'
}

export function getStatusColor(status) {
  return STATUS_COLORS[status] || 'bg-gray-100 text-gray-700'
}

export function getPaymentStatusLabel(status) {
  const labels = {
    pending: 'بانتظار التأكيد',
    verified: 'تم التأكيد',
    rejected: 'مرفوض',
  }
  return labels[status] || status || '-'
}

export function getPaymentStatusColor(status) {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-700',
    verified: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  }
  return colors[status] || 'bg-gray-100 text-gray-700'
}

export function getMethodLabel(method) {
  const labels = {
    credit: 'بطاقة ائتمان',
    bank: 'تحويل بنكي',
    mobile_money: 'موبايل موني',
    cash: 'نقدي',
    other: 'أخرى',
  }
  return labels[method] || method || '-'
}

export function getEducationLevelLabel(level) {
  const found = EDUCATION_LEVELS.find((e) => e.value === Number(level))
  return found ? found.label : level || '-'
}

export function getMaritalStatusLabel(status) {
  const found = MARITAL_STATUSES.find((m) => m.value === status)
  return found ? found.label : status || '-'
}

export function getGenderLabel(gender) {
  const found = GENDERS.find((g) => g.value === gender)
  return found ? found.label : gender || '-'
}

export function getResultLabel(result) {
  return RESULT_LABELS[result] || result || '-'
}

export function getRoleLabel(role) {
  const labels = { admin: 'مدير', employee: 'موظف', client: 'عميل' }
  return labels[role] || role || '-'
}

export function getActionLabel(action) {
  const labels = {
    create: 'إنشاء',
    update: 'تحديث',
    approve_photo: 'قبول صورة',
    reject_photo: 'رفض صورة',
    verify_payment: 'تأكيد دفع',
    reject_payment: 'رفض دفع',
    approve: 'اعتماد',
    request_correction: 'طلب تعديل',
    submit_official: 'إدخال رسمي',
    mark_completed: 'تأكيد اكتمال',
    cancel: 'إلغاء',
    status_change: 'تغيير حالة',
  }
  return labels[action] || action || '-'
}
