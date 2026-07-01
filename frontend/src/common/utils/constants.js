export const STATUS_LABELS = {
  draft: 'مسودة',
  data_entry_complete: 'بيانات مكتملة',
  photo_pending: 'بانتظار الصورة',
  photo_rejected: 'الصورة مرفوضة',
  photo_accepted: 'الصورة مقبولة',
  payment_pending: 'بانتظار الدفع',
  payment_verification: 'تدقيق الدفع',
  needs_correction: 'يحتاج تعديل',
  approved: 'مقبول',
  submitted: 'مقدم',
  completed: 'مكتمل',
  cancelled: 'ملغي',
}

export const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-700',
  data_entry_complete: 'bg-blue-100 text-blue-700',
  photo_pending: 'bg-yellow-100 text-yellow-700',
  photo_rejected: 'bg-red-100 text-red-700',
  photo_accepted: 'bg-green-100 text-green-700',
  payment_pending: 'bg-yellow-100 text-yellow-700',
  payment_verification: 'bg-purple-100 text-purple-700',
  needs_correction: 'bg-orange-100 text-orange-700',
  approved: 'bg-green-100 text-green-700',
  submitted: 'bg-indigo-100 text-indigo-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
}

export const EDUCATION_LEVELS = [
  { value: 1, label: 'أقل من ثانوي' },
  { value: 2, label: 'ثانوي' },
  { value: 3, label: 'دبلوم' },
  { value: 4, label: 'بكالوريوس' },
  { value: 5, label: 'ماجستير' },
  { value: 6, label: 'دكتوراه' },
  { value: 7, label: 'دراسات عليا أخرى' },
  { value: 8, label: 'تدريب مهني' },
  { value: 9, label: 'بدون مؤهل' },
  { value: 10, label: 'أخرى' },
]

export const MARITAL_STATUSES = [
  { value: 'single', label: 'أعزب/عزباء' },
  { value: 'married', label: 'متزوج/متزوجة' },
  { value: 'married_usc_lpr', label: 'متزوج من مواطن أمريكي / مقيم دائم' },
  { value: 'divorced', label: 'مطلق/مطلقة' },
  { value: 'widowed', label: 'أرمل/أرملة' },
  { value: 'legally_separated', label: 'منفصل قانونياً' },
]

export const GENDERS = [
  { value: 'male', label: 'ذكر' },
  { value: 'female', label: 'أنثى' },
]

export const PAYMENT_STATUS_LABELS = {
  pending: 'بانتظار التأكيد',
  verified: 'تم التأكيد',
  rejected: 'مرفوض',
}

export const PAYMENT_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  verified: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}

export const METHOD_LABELS = {
  credit: 'بطاقة ائتمان',
  bank: 'تحويل بنكي',
  mobile_money: 'موبايل موني',
  cash: 'نقدي',
  other: 'أخرى',
}

export const ROLE_LABELS = {
  admin: 'مدير',
  employee: 'موظف',
  client: 'عميل',
}

export const ROLE_COLORS = {
  admin: 'bg-purple-100 text-purple-700',
  employee: 'bg-blue-100 text-blue-700',
  client: 'bg-green-100 text-green-700',
}

export const ACTION_LABELS = {
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

export const RESULT_LABELS = {
  winner: 'فائز',
  loser: 'خاسر',
  pending: 'بانتظار النتيجة',
}

export const DEFAULT_PAGE_SIZE = 20
