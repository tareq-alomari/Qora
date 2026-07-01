import { useState, useEffect, useRef } from 'react'
import api from '../services/api'

export function usePhoto(orderId) {
  const [status, setStatus] = useState(null)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [polling, setPolling] = useState(false)
  const pollRef = useRef(null)

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

  useEffect(() => {
    if (!polling || !orderId) return
    const check = async () => {
      try {
        const { data } = await api.get(`/orders/${orderId}/photo/status`)
        const photoStatus = data.data
        setStatus(photoStatus)
        if (photoStatus.status === 'accepted' || photoStatus.status === 'rejected') {
          setResult(photoStatus.status)
          setPolling(false)
          if (pollRef.current) clearInterval(pollRef.current)
        }
      } catch {
        // silent
      }
    }
    pollRef.current = setInterval(check, 3000)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [polling, orderId])

  const upload = async (file) => {
    if (!file || !orderId) return
    setUploading(true)
    setError(null)
    const formData = new FormData()
    formData.append('photo', file)
    try {
      await api.post(`/orders/${orderId}/photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setPolling(true)
      return true
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'فشل رفع الصورة'
      setError(msg)
      return false
    } finally {
      setUploading(false)
    }
  }

  const reset = () => {
    setStatus(null)
    setResult(null)
    setError(null)
    setPolling(false)
    if (pollRef.current) clearInterval(pollRef.current)
  }

  return {
    status,
    result,
    error,
    uploading,
    polling,
    upload,
    reset,
  }
}
