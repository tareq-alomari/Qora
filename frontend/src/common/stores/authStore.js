import { create } from 'zustand'
import api from '../services/api'

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('accessToken', data.accessToken)
    set({ user: data.user, isAuthenticated: true })
    return data.user
  },

  register: async (payload) => {
    const { data } = await api.post('/auth/register', payload)
    localStorage.setItem('accessToken', data.accessToken)
    set({ user: data.user, isAuthenticated: true })
    return data.user
  },

  logout: () => {
    localStorage.removeItem('accessToken')
    set({ user: null, isAuthenticated: false })
  },

  checkAuth: async () => {
    try {
      const { data } = await api.get('/auth/me')
      set({ user: data, isAuthenticated: true })
    } catch {
      set({ user: null, isAuthenticated: false })
    }
  },
}))
