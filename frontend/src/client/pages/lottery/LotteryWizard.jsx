import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '@common/services/api'
import toast from 'react-hot-toast'
import CameraFrame from '@common/components/CameraFrame'
import PhotoGuide from '@common/components/PhotoGuide'

const STEPS = [
  'البيانات الشخصية',
  'معلومات الاتصال',
  'التعليم والحالة',
  'الزوج/الزوجة',
  'الأبناء',
  'الصورة الشخصية',
  'الدفع',
  'التأكيد',
]

const EDUCATION_LEVELS = [
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

const MARITAL_STATUSES = [
  { value: 'single', label: 'أعزب/عزباء' },
  { value: 'married', label: 'متزوج/متزوجة' },
  { value: 'married_usc_lpr', label: 'متزوج من مواطن أمريكي / مقيم دائم' },
  { value: 'divorced', label: 'مطلق/مطلقة' },
  { value: 'widowed', label: 'أرمل/أرملة' },
  { value: 'legally_separated', label: 'منفصل قانونياً' },
]

const COUNTRIES = [
  'اليمن', 'السعودية', 'الإمارات', 'قطر', 'عمان', 'البحرين', 'الكويت',
  'مصر', 'الأردن', 'العراق', 'سوريا', 'لبنان', 'فلسطين', 'ليبيا',
  'تونس', 'الجزائر', 'المغرب', 'السودان', 'الصومال', 'جيبوتي',
  'أمريكا', 'بريطانيا', 'ألمانيا', 'فرنسا', 'هولندا', 'تركيا',
  'أخرى',
]

export default function LotteryWizard() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [orderId, setOrderId] = useState(null)
  const [orderNumber, setOrderNumber] = useState(null)
  const [orderStatus, setOrderStatus] = useState('draft')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [personal, setPersonal] = useState({
    first_name: '', middle_name: '', last_name: '',
    gender: '', birth_date: '', birth_city: '', birth_country: 'اليمن',
  })
  const [contact, setContact] = useState({
    phone: '', email: '', alt_phone: '',
    street: '', city: '', district: '', postal_code: '',
  })
  const [education, setEducation] = useState({
    education_level: '', marital_status: '',
    passport_number: '', passport_expiry: '',
  })
  const [spouse, setSpouse] = useState({
    first_name: '', last_name: '', birth_date: '', gender: '',
  })
  const [children, setChildren] = useState([])

  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [photoUploading, setPhotoUploading] = useState(false)
  const [photoStatus, setPhotoStatus] = useState(null)
  const [photoPolling, setPhotoPolling] = useState(false)
  const [showCamera, setShowCamera] = useState(true)

  const [passportFile, setPassportFile] = useState(null)
  const [passportPreview, setPassportPreview] = useState(null)
  const [passportUploading, setPassportUploading] = useState(false)
  const [passportScanDone, setPassportScanDone] = useState(false)

  const [paymentMethods, setPaymentMethods] = useState([])
  const [selectedMethod, setSelectedMethod] = useState('')
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [receiptFile, setReceiptFile] = useState(null)
  const [transferNumber, setTransferNumber] = useState('')
  const [amount, setAmount] = useState('1000')
  const [paymentStatus, setPaymentStatus] = useState(null)
  const [paymentLoading, setPaymentLoading] = useState(false)

  const [submitting, setSubmitting] = useState(false)

  const pollRef = useRef(null)
  const fileInputRef = useRef(null)
  const receiptInputRef = useRef(null)
  const passportInputRef = useRef(null)

  useEffect(() => {
    const init = async () => {
      try {
        const existingId = searchParams.get('orderId')
        if (existingId) {
          const { data } = await api.get(`/orders/${existingId}`)
          const order = data.data
          setOrderId(order.order_id)
          setOrderNumber(order.order_number)
          setOrderStatus(order.status)
          if (order.personal_data) setPersonal((prev) => ({ ...prev, ...order.personal_data }))
          if (order.contact_info) setContact((prev) => ({ ...prev, ...order.contact_info }))
          if (order.education_status) setEducation((prev) => ({ ...prev, ...order.education_status }))
          if (order.spouse_data) setSpouse(order.spouse_data)
          if (order.children_data) setChildren(order.children_data || [])
          if (order.photo_status) setPhotoStatus(order.photo_status)
          if (order.payment_status) setPaymentStatus(order.payment_status)
        } else {
          const { data } = await api.post('/orders', {})
          const order = data.data
          setOrderId(order.order_id)
          setOrderNumber(order.order_number)
          setOrderStatus(order.status)
        }
      } catch {
        toast.error('حدث خطأ في تحميل الطلب')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  useEffect(() => {
    if (orderId) {
      const loadData = async () => {
        try {
          const { data } = await api.get(`/orders/${orderId}`)
          const order = data.data
          if (order.personal_data) setPersonal((prev) => ({ ...prev, ...order.personal_data }))
          if (order.contact_info) setContact((prev) => ({ ...prev, ...order.contact_info }))
          if (order.education_status) setEducation((prev) => ({ ...prev, ...order.education_status }))
          if (order.spouse_data) setSpouse(order.spouse_data)
          if (order.children_data) setChildren(order.children_data || [])
          if (order.photo_status) setPhotoStatus(order.photo_status)
          if (order.payment_status) setPaymentStatus(order.payment_status)
        } catch {
          // silent
        }
      }
      loadData()
    }
  }, [orderId])

  const saveStepData = useCallback(async (stepNum, data) => {
    if (!orderId) return
    setSaving(true)
    try {
      const endpoints = {
        1: `personal-data`,
        2: `contact-info`,
        3: `education-status`,
        4: `spouse`,
        5: `children`,
      }
      const endpoint = endpoints[stepNum]
      if (endpoint) {
        let payload = data
        if (stepNum === 1) payload = { personal_data: data }
        await api.patch(`/orders/${orderId}/${endpoint}`, payload)
      }
    } catch {
      toast.error('فشل حفظ البيانات')
    } finally {
      setSaving(false)
    }
  }, [orderId])

  const handleNext = async () => {
    const data = {
      1: personal,
      2: contact,
      3: education,
      4: spouse,
      5: children,
    }[step]
    if (data !== undefined) {
      await saveStepData(step, data)
    }
    setStep((s) => Math.min(s + 1, 8))
  }

  const handlePrev = () => setStep((s) => Math.max(s - 1, 1))

  const handlePersonalChange = (field, value) =>
    setPersonal((prev) => ({ ...prev, [field]: value }))

  const handleContactChange = (field, value) =>
    setContact((prev) => ({ ...prev, [field]: value }))

  const handleEducationChange = (field, value) =>
    setEducation((prev) => ({ ...prev, [field]: value }))

  const handleSpouseChange = (field, value) =>
    setSpouse((prev) => ({ ...prev, [field]: value }))

  const handleChildChange = (index, field, value) =>
    setChildren((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    )

  const addChild = () =>
    setChildren((prev) => [
      ...prev,
      { first_name: '', last_name: '', birth_date: '', gender: '' },
    ])

  const removeChild = (index) =>
    setChildren((prev) => prev.filter((_, i) => i !== index))

  const handlePhotoUpload = async (file) => {
    const targetFile = file || photoFile
    if (!targetFile || !orderId) return
    setPhotoUploading(true)
    const formData = new FormData()
    formData.append('photo', targetFile)
    try {
      await api.post(`/orders/${orderId}/photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success('تم رفع الصورة، جاري فحصها...')
      setPhotoPolling(true)
    } catch {
      toast.error('فشل رفع الصورة')
    } finally {
      setPhotoUploading(false)
    }
  }

  useEffect(() => {
    if (!photoPolling || !orderId) return
    const check = async () => {
      try {
        const { data } = await api.get(`/orders/${orderId}/photo/status`)
        const status = data.data
        setPhotoStatus(status)
        if (status.status === 'accepted' || status.status === 'rejected') {
          setPhotoPolling(false)
        }
      } catch {
        // silent
      }
    }
    pollRef.current = setInterval(check, 3000)
    return () => clearInterval(pollRef.current)
  }, [photoPolling, orderId])

  const handlePassportScanUpload = async () => {
    if (!passportFile || !orderId) return
    setPassportUploading(true)
    const formData = new FormData()
    formData.append('passport_scan', passportFile)
    try {
      await api.post(`/orders/${orderId}/passport-scan`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success('تم رفع صورة الجواز')
      setPassportScanDone(true)
    } catch {
      toast.error('فشل رفع صورة الجواز')
    } finally {
      setPassportUploading(false)
    }
  }

  useEffect(() => {
    if (orderId) {
      const fetchMethods = async () => {
        try {
          const { data } = await api.get('/payments/methods')
          setPaymentMethods(data.data || [])
        } catch {
          // silent
        }
      }
      fetchMethods()
    }
  }, [orderId])

  const handlePaymentMethodChange = (methodId) => {
    setSelectedMethod(methodId)
    const method = paymentMethods.find((m) => m.id === methodId)
    setSelectedAccount(method || null)
  }

  const handleReceiptUpload = async () => {
    if (!receiptFile || !orderId || !selectedMethod || !transferNumber) {
      toast.error('يرجى إكمال معلومات الدفع')
      return
    }
    setPaymentLoading(true)
    const formData = new FormData()
    formData.append('receipt', receiptFile)
    formData.append('payment_method', selectedMethod)
    formData.append('transfer_number', transferNumber)
    formData.append('amount', amount)
    try {
      const { data } = await api.post(`/orders/${orderId}/payment/receipt`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setPaymentStatus('payment_verification')
      toast.success('تم استلام إشعار الدفع، بانتظار التدقيق')
    } catch {
      toast.error('فشل رفع إشعار الدفع')
    } finally {
      setPaymentLoading(false)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await api.post(`/orders/${orderId}/submit`, {})
      toast.success('تم تقديم الطلب بنجاح!')
      setOrderStatus('submitted')
    } catch {
      toast.error('فشل تقديم الطلب')
    } finally {
      setSubmitting(false)
    }
  }

  const Stepper = () => (
    <div className="mb-10 relative">
      <div className="absolute top-1/2 left-0 right-0 h-1 bg-navy-100 -translate-y-1/2 z-0 rounded-full hidden md:block"></div>
      <div className="flex items-center justify-between overflow-x-auto hide-scrollbar relative z-10 px-2 py-4">
        {STEPS.map((label, i) => {
          const idx = i + 1
          const isCompleted = step > idx
          const isCurrent = step === idx
          return (
            <div key={idx} className="flex flex-col items-center min-w-[100px] flex-1">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shrink-0 transition-all duration-500 shadow-md ${
                  isCompleted
                    ? 'bg-success text-white shadow-success/30 scale-100'
                    : isCurrent
                    ? 'bg-primary-500 text-white shadow-primary-500/40 scale-110 ring-4 ring-primary-50'
                    : 'bg-white text-navy-400 border-2 border-navy-100 scale-90'
                }`}
              >
                {isCompleted ? (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  idx
                )}
              </div>
              <span
                className={`text-xs md:text-sm mt-3 font-semibold text-center transition-colors duration-300 ${
                  isCurrent ? 'text-primary-600' : isCompleted ? 'text-navy-700' : 'text-navy-400'
                }`}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )

  const Input = ({ label, type = 'text', value, onChange, placeholder, required, dir, maxLength, className = '' }) => (
    <div className={className}>
      <label className="block text-sm font-bold text-navy-900 mb-2">{label} {required && <span className="text-error">*</span>}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        dir={dir}
        maxLength={maxLength}
        className="w-full bg-navy-50/50 border border-navy-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all font-medium text-navy-900 placeholder-navy-300"
      />
    </div>
  )

  const Select = ({ label, value, onChange, options, required = false }) => (
    <div>
      <label className="block text-sm font-bold text-navy-900 mb-2">{label} {required && <span className="text-error">*</span>}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full bg-navy-50/50 border border-navy-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all font-medium text-navy-900"
      >
        <option value="" className="text-navy-400">-- اختر --</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )

  const RadioGroup = ({ label, value, onChange, options, name }) => (
    <div>
      <label className="block text-sm font-bold text-navy-900 mb-3">{label}</label>
      <div className="flex flex-wrap gap-4">
        {options.map((opt) => (
          <label key={opt.value} className={`flex items-center gap-3 cursor-pointer px-5 py-3 rounded-xl border transition-all duration-200 ${value === opt.value ? 'bg-primary-50 border-primary-500 shadow-sm shadow-primary-500/10' : 'bg-white border-navy-200 hover:border-primary-300 hover:bg-navy-50'}`}>
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={(e) => onChange(e.target.value)}
              className="w-4 h-4 text-primary-500 focus:ring-primary-500 cursor-pointer"
            />
            <span className={`font-semibold ${value === opt.value ? 'text-primary-700' : 'text-navy-700'}`}>{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  )

  const isMarried = education.marital_status === 'married' || education.marital_status === 'married_usc_lpr'

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500">جاري التحميل...</p>
      </div>
    )
  }

  const getStepComponent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="font-bold text-lg mb-4">البيانات الشخصية</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="الاسم الأول" value={personal.first_name} onChange={(v) => handlePersonalChange('first_name', v)} required />
              <Input label="الاسم الأوسط" value={personal.middle_name} onChange={(v) => handlePersonalChange('middle_name', v)} required />
              <Input label="الاسم الأخير" value={personal.last_name} onChange={(v) => handlePersonalChange('last_name', v)} required />
            </div>
            <RadioGroup
              label="الجنس"
              name="gender"
              value={personal.gender}
              onChange={(v) => handlePersonalChange('gender', v)}
              options={[{ value: 'male', label: 'ذكر' }, { value: 'female', label: 'أنثى' }]}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="تاريخ الميلاد" type="date" value={personal.birth_date} onChange={(v) => handlePersonalChange('birth_date', v)} required />
              <Input label="مدينة الميلاد" value={personal.birth_city} onChange={(v) => handlePersonalChange('birth_city', v)} required />
              <Select
                label="بلد الميلاد"
                value={personal.birth_country}
                onChange={(v) => handlePersonalChange('birth_country', v)}
                options={COUNTRIES.map((c) => ({ value: c, label: c }))}
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="font-bold text-lg mb-4">معلومات الاتصال</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="رقم الهاتف" type="tel" value={contact.phone} onChange={(v) => handleContactChange('phone', v)} placeholder="967XXXXXXXXX" required />
              <Input label="البريد الإلكتروني" type="email" value={contact.email} onChange={(v) => handleContactChange('email', v)} />
              <Input label="هاتف بديل" type="tel" value={contact.alt_phone} onChange={(v) => handleContactChange('alt_phone', v)} placeholder="967XXXXXXXXX" />
            </div>
            <h4 className="font-semibold text-md mt-4 mb-2">العنوان</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="الشارع" value={contact.street} onChange={(v) => handleContactChange('street', v)} />
              <Input label="المدينة" value={contact.city} onChange={(v) => handleContactChange('city', v)} required />
              <Input label="المنطقة" value={contact.district} onChange={(v) => handleContactChange('district', v)} />
              <Input label="الرمز البريدي" value={contact.postal_code} onChange={(v) => handleContactChange('postal_code', v)} />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="font-bold text-lg mb-4">التعليم والحالة الاجتماعية</h3>
            <Select
              label="المستوى التعليمي"
              value={education.education_level}
              onChange={(v) => handleEducationChange('education_level', v)}
              options={EDUCATION_LEVELS}
              required
            />
            <RadioGroup
              label="الحالة الاجتماعية"
              name="marital_status"
              value={education.marital_status}
              onChange={(v) => handleEducationChange('marital_status', v)}
              options={MARITAL_STATUSES}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="رقم جواز السفر" value={education.passport_number} onChange={(v) => handleEducationChange('passport_number', v)} />
              <Input label="تاريخ انتهاء الجواز" type="date" value={education.passport_expiry} onChange={(v) => handleEducationChange('passport_expiry', v)} />
            </div>
          </div>
        )

      case 4:
        if (!isMarried) {
          return (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">هذه الخطوة غير مطلوبة لحالتك الاجتماعية</p>
              <p className="text-gray-400 text-sm mt-2">يمكنك التخطي إلى الخطوة التالية</p>
            </div>
          )
        }
        return (
          <div className="space-y-4">
            <h3 className="font-bold text-lg mb-4">بيانات الزوج/الزوجة</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="الاسم الأول" value={spouse.first_name} onChange={(v) => handleSpouseChange('first_name', v)} required={isMarried} />
              <Input label="الاسم الأخير" value={spouse.last_name} onChange={(v) => handleSpouseChange('last_name', v)} required={isMarried} />
              <Input label="تاريخ الميلاد" type="date" value={spouse.birth_date} onChange={(v) => handleSpouseChange('birth_date', v)} required={isMarried} />
              <RadioGroup
                label="الجنس"
                name="spouse_gender"
                value={spouse.gender}
                onChange={(v) => handleSpouseChange('gender', v)}
                options={[{ value: 'male', label: 'ذكر' }, { value: 'female', label: 'أنثى' }]}
              />
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">الأبناء</h3>
              <button
                type="button"
                onClick={addChild}
                className="text-primary-500 text-sm font-semibold hover:underline"
              >
                + إضافة ابن
              </button>
            </div>
            {children.length === 0 && (
              <p className="text-gray-400 text-center py-6">لم يتم إضافة أبناء بعد. يمكنك التخطي إذا لم يكن لديك أبناء.</p>
            )}
            {children.map((child, i) => (
              <div key={i} className="bg-gray-50 p-4 rounded-lg border relative">
                <button
                  type="button"
                  onClick={() => removeChild(i)}
                  className="absolute top-2 left-2 text-error hover:text-red-800 text-sm"
                >
                  ✕
                </button>
                <p className="text-sm font-semibold text-gray-500 mb-3">الابن #{i + 1}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input label="الاسم الأول" value={child.first_name} onChange={(v) => handleChildChange(i, 'first_name', v)} />
                  <Input label="الاسم الأخير" value={child.last_name} onChange={(v) => handleChildChange(i, 'last_name', v)} />
                  <Input label="تاريخ الميلاد" type="date" value={child.birth_date} onChange={(v) => handleChildChange(i, 'birth_date', v)} />
                  <RadioGroup
                    label="الجنس"
                    name={`child_gender_${i}`}
                    value={child.gender}
                    onChange={(v) => handleChildChange(i, 'gender', v)}
                    options={[{ value: 'male', label: 'ذكر' }, { value: 'female', label: 'أنثى' }]}
                  />
                </div>
              </div>
            ))}
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg">الصورة الشخصية</h3>
              <PhotoGuide collapsible />
            </div>

            {showCamera && !photoFile && (
              <CameraFrame
                onCapture={(file) => {
                  setPhotoFile(file)
                  setPhotoPreview(URL.createObjectURL(file))
                  handlePhotoUpload(file)
                }}
                onClose={() => setShowCamera(false)}
              />
            )}

            {!showCamera && !photoFile && (
              <div
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary-400 transition"
                onClick={() => fileInputRef.current?.click()}
              >
                <div>
                  <div className="text-4xl text-gray-300 mb-2">📷</div>
                  <p className="text-gray-500">اختر صورة من جهازك</p>
                  <p className="text-xs text-gray-400 mt-1">JPEG - JPG - PNG</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0]
                    if (file) {
                      setPhotoFile(file)
                      setPhotoPreview(URL.createObjectURL(file))
                    }
                  }}
                />
              </div>
            )}

            {photoFile && !photoUploading && !photoPolling && !photoStatus && (
              <div className="space-y-3">
                {photoPreview && (
                  <img src={photoPreview} alt="معاينة الصورة" className="max-h-64 mx-auto rounded-lg" />
                )}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setPhotoFile(null)
                      setPhotoPreview(null)
                      setShowCamera(true)
                    }}
                    className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
                  >
                    إعادة الاختيار
                  </button>
                  <button
                    onClick={() => handlePhotoUpload(photoFile)}
                    className="flex-1 bg-primary-500 text-white py-3 rounded-lg font-semibold hover:bg-primary-600 transition"
                  >
                    رفع الصورة وفحصها
                  </button>
                </div>
              </div>
            )}

            {photoUploading && (
              <div className="text-center text-primary-500">
                <div className="animate-spin inline-block w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mb-2" />
                <p>جاري رفع الصورة...</p>
              </div>
            )}

            {photoPolling && !photoUploading && (
              <div className="text-center text-yellow-600">
                <p>جاري فحص الصورة...</p>
                <div className="animate-pulse mt-2">⏳</div>
              </div>
            )}

            {photoStatus && photoStatus.status === 'accepted' && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-center">
                <div className="text-3xl mb-1">✅</div>
                <p className="text-success font-bold">الصورة مقبولة</p>
                {photoStatus.confidence && (
                  <p className="text-sm text-gray-500 mt-1">نسبة الثقة: {Math.round(photoStatus.confidence * 100)}%</p>
                )}
              </div>
            )}

            {photoStatus && photoStatus.status === 'accepted' && !passportScanDone && (
              <div className="border-t border-navy-100 pt-6 mt-6">
                <h4 className="font-bold text-navy-900 mb-3">صورة جواز السفر</h4>
                <p className="text-sm text-navy-500 mb-4">يرجى رفع صورة واضحة من جواز السفر ساري المفعول</p>

                {!passportFile && (
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-primary-400 transition"
                    onClick={() => passportInputRef.current?.click()}
                  >
                    <p className="text-gray-500">اختر صورة الجواز</p>
                    <p className="text-xs text-gray-400 mt-1">JPEG - JPG</p>
                    <input
                      ref={passportInputRef}
                      type="file"
                      accept=".jpg,.jpeg"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0]
                        if (file) {
                          setPassportFile(file)
                          setPassportPreview(URL.createObjectURL(file))
                        }
                      }}
                    />
                  </div>
                )}

                {passportFile && !passportUploading && (
                  <div className="space-y-3">
                    {passportPreview && (
                      <img src={passportPreview} alt="معاينة الجواز" className="max-h-48 mx-auto rounded-lg border" />
                    )}
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setPassportFile(null)
                          setPassportPreview(null)
                        }}
                        className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition"
                      >
                        إعادة الاختيار
                      </button>
                      <button
                        onClick={handlePassportScanUpload}
                        className="flex-1 bg-primary-500 text-white py-2.5 rounded-lg font-semibold hover:bg-primary-600 transition"
                      >
                        رفع الصورة
                      </button>
                    </div>
                  </div>
                )}

                {passportUploading && (
                  <div className="text-center text-primary-500 py-4">
                    <div className="animate-spin inline-block w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mb-2" />
                    <p>جاري رفع صورة الجواز...</p>
                  </div>
                )}
              </div>
            )}

            {passportScanDone && (
              <div className="bg-green-50 border border-green-200 p-3 rounded-lg text-center">
                <p className="text-success font-bold text-sm">✅ تم رفع صورة الجواز</p>
              </div>
            )}

            {photoStatus && photoStatus.status === 'rejected' && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <div className="text-center">
                  <div className="text-3xl mb-1">❌</div>
                  <p className="text-error font-bold mb-2">الصورة مرفوضة</p>
                </div>
                {photoStatus.reasons && photoStatus.reasons.length > 0 && (
                  <ul className="text-sm text-red-700 space-y-1 mt-2">
                    {photoStatus.reasons.map((r, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span>•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {photoStatus.suggestions && (
                  <p className="text-sm text-gray-500 mt-2">{photoStatus.suggestions}</p>
                )}
                <button
                  onClick={() => {
                    setPhotoFile(null)
                    setPhotoPreview(null)
                    setPhotoStatus(null)
                    setShowCamera(true)
                  }}
                  className="mt-3 w-full bg-error text-white py-2.5 rounded-lg font-semibold hover:bg-red-800 transition"
                >
                  إعادة المحاولة
                </button>
              </div>
            )}

            {!photoFile && !showCamera && (
              <button
                onClick={() => setShowCamera(true)}
                className="text-primary-500 text-sm font-semibold hover:underline"
              >
                استخدام الكاميرا
              </button>
            )}
          </div>
        )

      case 7:
        return (
          <div className="space-y-6">
            <h3 className="font-bold text-lg mb-4">الدفع</h3>

            {paymentMethods.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">طريقة الدفع</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      onClick={() => handlePaymentMethodChange(method.id)}
                      className={`p-4 border rounded-xl cursor-pointer transition ${
                        selectedMethod === method.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <p className="font-semibold">{method.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedAccount && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <p className="text-sm font-semibold text-blue-700">رقم حساب القرعة:</p>
                <p className="text-lg font-bold text-primary-500 mt-1" dir="ltr">
                  {selectedAccount.account_number || selectedAccount.number}
                </p>
                {selectedAccount.owner_name && (
                  <p className="text-sm text-gray-500 mt-1">على اسم: {selectedAccount.owner_name}</p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="رقم الحوالة" value={transferNumber} onChange={setTransferNumber} placeholder="أدخل رقم الحوالة" required />
              <Input label="المبلغ" type="number" value={amount} onChange={setAmount} required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">صورة الإشعار</label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-primary-400 transition"
                onClick={() => receiptInputRef.current?.click()}
              >
                {receiptFile ? (
                  <div>
                    <div className="text-3xl mb-1">📄</div>
                    <p className="text-sm text-gray-600">{receiptFile.name}</p>
                  </div>
                ) : (
                  <div>
                    <div className="text-3xl text-gray-300 mb-1">📎</div>
                    <p className="text-sm text-gray-500">ارفع صورة إشعار الدفع</p>
                  </div>
                )}
                <input
                  ref={receiptInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setReceiptFile(e.target.files[0])}
                />
              </div>
            </div>

            {paymentStatus === 'payment_verification' && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-center">
                <p className="text-yellow-700 font-semibold">⏳ إشعار الدفع قيد التدقيق</p>
                <p className="text-sm text-gray-500 mt-1">سيتم إعلامك عند تأكيد الدفع</p>
              </div>
            )}

            {receiptFile && transferNumber && paymentStatus !== 'payment_verification' && (
              <button
                onClick={handleReceiptUpload}
                disabled={paymentLoading}
                className="w-full bg-primary-500 text-white py-3 rounded-lg font-semibold hover:bg-primary-600 transition disabled:opacity-50"
              >
                {paymentLoading ? 'جاري الرفع...' : 'إرسال إشعار الدفع'}
              </button>
            )}
          </div>
        )

      case 8:
        return (
          <div className="space-y-6">
            <h3 className="font-bold text-lg mb-4">تأكيد الطلب</h3>

            <div className="bg-green-50 border border-green-200 p-6 rounded-xl text-center">
              <div className="text-4xl mb-3">🎉</div>
              <p className="text-2xl font-bold text-primary-500">{orderNumber}</p>
              <p className="text-gray-500 mt-1">رقم الطلب</p>
            </div>

            <div className="bg-white border rounded-xl p-6 space-y-3">
              <h4 className="font-semibold">ملخص الطلب</h4>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">الحالة:</span>
                <span className="font-semibold text-green-600">معتمد</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">البيانات الشخصية:</span>
                <span className="text-success">✓ مكتملة</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">الصورة:</span>
                <span className="text-success">✓ مقبولة</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">الدفع:</span>
                <span className={paymentStatus === 'payment_verification' || orderStatus === 'approved' || orderStatus === 'submitted' ? 'text-success' : 'text-yellow-600'}>
                  {orderStatus === 'submitted' || orderStatus === 'completed' ? '✓ مؤكد' : '⏳ قيد التدقيق'}
                </span>
              </div>
            </div>

            {orderStatus === 'submitted' || orderStatus === 'completed' ? (
              <div className="bg-indigo-50 border border-indigo-200 p-6 rounded-xl text-center">
                <p className="font-bold text-indigo-700 text-lg">تم تقديم طلبك بنجاح! ✅</p>
                <p className="text-sm text-gray-500 mt-2">
                  سيتم إعلامك عند صدور النتيجة. يمكنك متابعة حالة طلبك من صفحة طلباتي.
                </p>
                <button
                  onClick={() => navigate('/my-account')}
                  className="mt-4 bg-primary-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-primary-600 transition"
                >
                  الذهاب إلى طلباتي
                </button>
              </div>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-success text-white py-3 rounded-lg font-bold text-lg hover:bg-green-800 transition disabled:opacity-50"
              >
                {submitting ? 'جاري التقديم...' : 'تقديم الطلب'}
              </button>
            )}

            <div className="bg-gray-50 border rounded-xl p-6">
              <h4 className="font-semibold mb-3">الخطوات القادمة</h4>
              <ol className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">1.</span>
                  <span>سنقوم بمراجعة بياناتك والتأكد من اكتمالها</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">2.</span>
                  <span>سنقوم بإدخال طلبك في الموقع الرسمي للقرعة</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 font-bold">3.</span>
                  <span>سنفحص النتيجة لك ونعلمك فور صدورها</span>
                </li>
              </ol>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-navy-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-navy-900 mb-2">التسجيل في قرعة اللوتري</h1>
            <p className="text-navy-500">أكمل خطوات التسجيل لضمان اشتراكك بنجاح</p>
          </div>
          {orderNumber && (
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-bold text-navy-400 uppercase tracking-wider mb-1">رقم الطلب</span>
              <span className="px-4 py-1.5 bg-white border border-navy-200 rounded-lg font-bold text-primary-600 shadow-sm">
                {orderNumber}
              </span>
            </div>
          )}
        </div>

        <Stepper />

        <div className="bg-white p-6 md:p-10 rounded-3xl shadow-xl shadow-navy-200/40 border border-navy-100 relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-400 via-primary-500 to-gold-400"></div>
          
          <div className="relative z-10 min-h-[400px]">
            {getStepComponent()}
          </div>

          <div className="flex items-center justify-between mt-10 pt-6 border-t border-navy-100">
            <div>
              {step > 1 && (
                <button
                  onClick={handlePrev}
                  className="px-6 py-3 bg-white border-2 border-navy-200 rounded-xl text-navy-600 font-bold hover:bg-navy-50 hover:border-navy-300 hover:text-navy-900 transition-all duration-200 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                  السابق
                </button>
              )}
            </div>
            <div className="flex items-center gap-4">
              {saving && (
                <span className="flex items-center gap-2 text-sm font-semibold text-navy-400">
                  <svg className="animate-spin h-4 w-4 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  جاري الحفظ...
                </span>
              )}
              {step < 8 && (
                <button
                  onClick={handleNext}
                  className="bg-primary-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary-500/30 hover:bg-primary-600 hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
                >
                  التالي
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
