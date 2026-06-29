# معمارية Frontend - Component Tree + Hooks

## Qor3a — هيكل React

---

## 1. هيكل المجلدات

```
frontend/src/
├── main.jsx                    # نقطة الدخول
├── App.jsx                     # Router + Providers
├── index.css                   # Tailwind imports
│
├── common/
│   ├── stores/
│   │   └── authStore.js        # Zustand: حالة المستخدم
│   ├── services/
│   │   └── api.js              # Axios instance + JWT interceptor
│   ├── components/             # مكونات مشتركة
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx
│   │   ├── Spinner.jsx
│   │   ├── ErrorMessage.jsx
│   │   ├── EmptyState.jsx
│   │   ├── Pagination.jsx
│   │   └── StatusBadge.jsx
│   ├── hooks/
│   │   ├── useAuth.js          # تسجيل الدخول/خروج
│   │   ├── useOrders.js        # جلب الطلبات
│   │   ├── usePhoto.js         # رفع الصورة + AI
│   │   ├── usePayment.js       # الدفع
│   │   └── useNotifications.js # الإشعارات
│   └── utils/
│       ├── formatters.js       # تنسيق التواريخ، الأرقام
│       ├── validators.js       # دوال تحقق (بدون Joi)
│       └── constants.js        # الثوابت
│
├── client/
│   ├── layouts/
│   │   └── ClientLayout.jsx    # Header + Footer
│   ├── pages/
│   │   ├── HomePage.jsx        # الصفحة الرئيسية
│   │   ├── LoginPage.jsx       # تسجيل الدخول
│   │   ├── RegisterPage.jsx    # تسجيل حساب
│   │   ├── WizardPage.jsx      # 8-Step Wizard
│   │   ├── OrderStatusPage.jsx # عرض حالة الطلب
│   │   └── HelpPage.jsx        # الأسئلة الشائعة
│   └── components/
│       ├── Wizard/
│       │   ├── StepIndicator.jsx     # شريط التقدم
│       │   ├── StepPersonal.jsx      # الخطوة 1: البيانات
│       │   ├── StepFamily.jsx        # الخطوة 2: العائلة
│       │   ├── StepPhoto.jsx         # الخطوة 3: الصورة
│       │   ├── StepPassport.jsx      # الخطوة 4: الجواز
│       │   ├── StepAddress.jsx       # الخطوة 5: العنوان
│       │   ├── StepContact.jsx       # الخطوة 6: التواصل
│       │   ├── StepPayment.jsx       # الخطوة 7: الدفع
│       │   └── StepConfirmation.jsx  # الخطوة 8: تأكيد
│       ├── CameraFrame.jsx    # إطار الكاميرا
│       ├── PhotoGuide.jsx     # إرشادات التصوير
│       └── PaymentMethods.jsx # طرق الدفع
│
├── dashboard/
│   ├── layouts/
│   │   └── DashboardLayout.jsx   # Sidebar + Header
│   ├── pages/
│   │   ├── LoginPage.jsx         # دخول الموظف
│   │   ├── OrdersListPage.jsx    # قائمة الطلبات
│   │   ├── OrderReviewPage.jsx   # مراجعة طلب
│   │   ├── PaymentVerifyPage.jsx # تأكيد الدفع
│   │   ├── SubmitConfirmPage.jsx # إدخال Confirmation#
│   │   └── SettingsPage.jsx      # الإعدادات
│   └── components/
│       ├── Sidebar.jsx
│       ├── StatCard.jsx
│       ├── OrdersTable.jsx
│       ├── OrderDetailCard.jsx
│       ├── PhotoViewer.jsx
│       ├── ReceiptViewer.jsx
│       └── StatusTimeline.jsx
│
├── admin/
│   ├── pages/
│   │   ├── DashboardPage.jsx    # الإحصائيات
│   │   ├── UsersPage.jsx        # إدارة المستخدمين
│   │   ├── SettingsPage.jsx     # إعدادات النظام
│   │   └── AuditLogPage.jsx     # سجل الإجراءات
│   └── components/
│       ├── StatsGrid.jsx
│       └── UsersTable.jsx
│
└── assets/
    ├── images/
    ├── icons/
    └── fonts/
```

---

## 2. شجرة الـ Components (App Level)

```
<App>
  <BrowserRouter>
    <QueryClientProvider>     ← React Query (للتخزين المؤقت)
      <Routes>
        ── client routes ──
        <Route path="/" element={<ClientLayout />}>
          <Route index element={<HomePage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="wizard" element={<ProtectedRoute><WizardPage /></ProtectedRoute>} />
          <Route path="orders/:id" element={<ProtectedRoute><OrderStatusPage /></ProtectedRoute>} />
          <Route path="help" element={<HelpPage />} />
        </Route>

        ── dashboard routes ──
        <Route path="/dashboard" element={<ProtectedRoute role="employee|admin"><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<OrdersListPage />} />
          <Route path="orders/:id" element={<OrderReviewPage />} />
          <Route path="payments" element={<PaymentVerifyPage />} />
          <Route path="confirm" element={<SubmitConfirmPage />} />
        </Route>

        ── admin routes ──
        <Route path="/admin" element={<ProtectedRoute role="admin"><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<DashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="audit" element={<AuditLogPage />} />
        </Route>
      </Routes>
    </QueryClientProvider>
  </BrowserRouter>
</App>
```

---

## 3. الـ Hooks الأساسية

### 3.1 useAuth (Zustand Store)

```javascript
// common/stores/authStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,

      register: async (phone) => {
        set({ isLoading: true })
        const { data } = await api.post('/auth/register', { phone })
        set({ isLoading: false })
        return data
      },

      verifyOtp: async (phone, otp) => {
        set({ isLoading: true })
        const { data } = await api.post('/auth/verify-otp', { phone, otp })
        set({
          user: data.user,
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          isLoading: false
        })
        return data
      },

      login: async (phone) => {
        set({ isLoading: true })
        const { data } = await api.post('/auth/login', { phone })
        set({ isLoading: false })
        return data
      },

      logout: () => {
        set({ user: null, accessToken: null, refreshToken: null })
      },

      refreshAuth: async () => {
        try {
          const { data } = await api.post('/auth/refresh', null, {
            headers: { Authorization: `Bearer ${get().refreshToken}` }
          })
          set({ accessToken: data.access_token })
          return true
        } catch {
          get().logout()
          return false
        }
      }
    }),
    { name: 'qor3a-auth', partialize: (state) => ({ user: state.user, accessToken: state.accessToken, refreshToken: state.refreshToken }) }
  )
)

export default useAuthStore
```

### 3.2 useOrders

```javascript
// common/hooks/useOrders.js
import { useState, useEffect } from 'react'
import api from '../services/api'

const useOrders = ({ page = 1, limit = 20, status, search } = {}) => {
  const [data, setData] = useState({ orders: [], meta: {} })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const params = { page, limit }
        if (status) params.status = status
        if (search) params.search = search
        const { data } = await api.get('/orders', { params })
        setData(data)
      } catch (err) {
        setError(err.response?.data?.error?.code || 'INTERNAL_ERROR')
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [page, limit, status, search])

  return { orders: data.orders, meta: data.meta, loading, error }
}

export default useOrders
```

### 3.3 usePhoto

```javascript
// common/hooks/usePhoto.js
import { useState } from 'react'
import api from '../services/api'

const usePhoto = () => {
  const [status, setStatus] = useState('idle') // idle|uploading|checking|accepted|rejected
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const upload = async (orderId, file) => {
    try {
      setStatus('uploading')
      const formData = new FormData()
      formData.append('photo', file)

      const { data } = await api.post(`/orders/${orderId}/photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setStatus('checking')

      // استطلاع نتيجة AI (polling)
      const pollResult = async () => {
        const { data: resultData } = await api.get(`/orders/${orderId}/photo/status`)
        if (resultData.status === 'processing') {
          setTimeout(pollResult, 1000)
          return
        }
        setStatus(resultData.status === 'accepted' ? 'accepted' : 'rejected')
        setResult(resultData)
      }
      setTimeout(pollResult, 2000)
    } catch (err) {
      setStatus('idle')
      setError(err.response?.data?.error?.message || 'فشل رفع الصورة')
    }
  }

  const reset = () => {
    setStatus('idle')
    setResult(null)
    setError(null)
  }

  return { status, result, error, upload, reset }
}

export default usePhoto
```

### 3.4 usePayment

```javascript
// common/hooks/usePayment.js
import { useState } from 'react'
import api from '../services/api'

const usePayment = () => {
  const [status, setStatus] = useState('idle') // idle|uploading|success|error
  const [error, setError] = useState(null)

  const uploadReceipt = async (orderId, file, method) => {
    try {
      setStatus('uploading')
      const formData = new FormData()
      formData.append('receipt', file)
      formData.append('payment_method', method)
      formData.append('amount', 1000)

      await api.post(`/orders/${orderId}/payment/receipt`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setStatus('success')
    } catch (err) {
      setStatus('error')
      setError(err.response?.data?.error?.message || 'فشل رفع الإيصال')
    }
  }

  return { status, error, uploadReceipt }
}

export default usePayment
```

---

## 4. Axios Client مع JWT Interceptor

```javascript
// common/services/api.js
import axios from 'axios'
import useAuthStore from '../stores/authStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshed = await useAuthStore.getState().refreshAuth()
      if (refreshed) {
        originalRequest.headers.Authorization =
          `Bearer ${useAuthStore.getState().accessToken}`
        return api(originalRequest)
      }
    }
    return Promise.reject(error)
  }
)

export default api
```

---

## 5. الـ 8-Step Wizard (التدفق)

```
<WizardPage>
  <StepIndicator currentStep={step} totalSteps={8} />
  
  {step === 1 && <StepPersonal onNext={saveData} />}
  {step === 2 && <StepFamily onNext={saveData} onPrev={goBack} />}
  {step === 3 && <StepPhoto onNext={uploadPhoto} onPrev={goBack} />}
  {step === 4 && <StepPassport onNext={saveData} onPrev={goBack} />}
  {step === 5 && <StepAddress onNext={saveData} onPrev={goBack} />}
  {step === 6 && <StepContact onNext={saveData} onPrev={goBack} />}
  {step === 7 && <StepPayment onSubmit={submitOrder} onPrev={goBack} />}
  {step === 8 && <StepConfirmation order={order} />}
  
  <!-- Navigation -->
  {step > 1 && step < 8 && <Button onClick={goBack}>السابق</Button>}
  {step < 7 && <Button onClick={nextStep}>التالي</Button>}
</WizardPage>

كل خطوة:
├── تستخدم React Hook Form (useForm)
├── تدعم auto-save (كل خطوة ترسل API call)
└── مخزنة في localStorage (للرجوع في حال انقطع الإنترنت)
```

---

## 6. حالات كل شاشة

```
كل صفحة تتبع هذا النمط:

const OrdersListPage = () => {
  const { orders, loading, error } = useOrders()

  if (loading) return <Spinner />               // ⏳ Loading
  if (error) return <ErrorMessage error={error} // ❌ Error
    onRetry={() => window.location.reload()} />
  if (orders.length === 0) return <EmptyState   // 🚫 Empty
    title="لا توجد طلبات"
    action="ابدأ تسجيلك الأول"
    to="/wizard" />

  return <OrdersTable orders={orders} />         // 🟢 Default
}
```

---

*معمارية Frontend - يوليو 2026*
*Qor3a (قرعة)*
