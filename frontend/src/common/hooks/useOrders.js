import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'

export function useOrders(initialParams = {}) {
  const [orders, setOrders] = useState([])
  const [meta, setMeta] = useState({ page: 1, total: 0, total_pages: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [params, setParams] = useState({ page: 1, limit: 20, ...initialParams })

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/orders', { params })
      setOrders(data.data || [])
      setMeta(data.meta || {})
    } catch (err) {
      const errorCode = err.response?.data?.error?.code || 'INTERNAL_ERROR'
      setError(errorCode)
    } finally {
      setLoading(false)
    }
  }, [params])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const updateParams = useCallback((updates) => {
    setParams((prev) => ({ ...prev, page: 1, ...updates }))
  }, [])

  const setPage = useCallback((page) => {
    setParams((prev) => ({ ...prev, page }))
  }, [])

  return {
    orders,
    meta,
    loading,
    error,
    params,
    setParams: updateParams,
    setPage,
    refetch: fetchOrders,
  }
}
