import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'

export function useNotifications() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/notifications', { params: { limit: 50 } })
      setNotifications(data.data || [])
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  const getUnreadCount = useCallback(async () => {
    try {
      const { data } = await api.get('/notifications/unread-count')
      setUnreadCount(data.data?.count || 0)
      return data.data?.count || 0
    } catch {
      return 0
    }
  }, [])

  const markAsRead = useCallback(async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch {
      // silent
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      await api.post('/notifications/read-all')
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch {
      // silent
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
    getUnreadCount()
  }, [fetchNotifications, getUnreadCount])

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
  }
}
