import { create } from 'zustand'
import api from '../services/api'

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('accessToken'),

  requestOtp: async (phone) => {
    const { data } = await api.post('/auth/register', { phone })
    return data
  },

  verifyOtp: async (phone, otp) => {
    const { data } = await api.post('/auth/verify-otp', { phone, otp })
    localStorage.setItem('accessToken', data.accessToken)
    set({ user: data.user, isAuthenticated: true })
    return data.user
  },

  login: async (phone) => {
    const { data } = await api.post('/auth/login', { phone })
    return data
  },

  logout: () => {
    localStorage.removeItem('accessToken')
    set({ user: null, isAuthenticated: false })
  },

  checkAuth: async () => {
    try {
      const { data } = await api.get('/users/profile')
      set({ user: data.data, isAuthenticated: true })
    } catch {
      set({ user: null, isAuthenticated: false })
    }
  },
}))
