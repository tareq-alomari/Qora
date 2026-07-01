import { useState } from 'react'
import api from '../services/api'

export function usePayment(orderId) {
  const [status, setStatus] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const uploadReceipt = async (file, paymentMethod, transferNumber, amount) => {
    if (!file || !orderId || !paymentMethod || !transferNumber) {
      setError('يرجى إكمال معلومات الدفع')
      return false
    }
    setLoading(true)
    setError(null)
    const formData = new FormData()
    formData.append('receipt', file)
    formData.append('payment_method', paymentMethod)
    formData.append('transfer_number', transferNumber)
    formData.append('amount', amount)
    try {
      const { data } = await api.post(`/orders/${orderId}/payment/receipt`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setStatus('payment_verification')
      return true
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'فشل رفع إشعار الدفع'
      setError(msg)
      return false
    } finally {
      setLoading(false)
    }
  }

  const fetchMethods = async () => {
    try {
      const { data } = await api.get('/payments/methods')
      return data.data || []
    } catch {
      return []
    }
  }

  return {
    status,
    error,
    loading,
    uploadReceipt,
    fetchMethods,
  }
}
