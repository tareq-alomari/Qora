import { create } from 'zustand'
import api from '../services/api'

function decodeToken(token) {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}

const token = localStorage.getItem('accessToken')
const tokenData = decodeToken(token)

export const useAuthStore = create((set, get) => ({
  user: tokenData ? { id: tokenData.id, role: tokenData.role, phone: tokenData.phone } : null,
  isAuthenticated: !!token,

  requestOtp: async (phone) => {
    const { data } = await api.post('/auth/register', { phone })
    return data
  },

  verifyOtp: async (phone, otp) => {
    const { data } = await api.post('/auth/verify-otp', { phone, otp })
    localStorage.setItem('accessToken', data.data.access_token)
    set({ isAuthenticated: true })
    await get().checkAuth()
    return get().user
  },

  login: async (phone) => {
    const { data } = await api.post('/auth/login', { phone })
    return data
  },

  registerWithEmail: async (fullName, email, phone, password) => {
    const { data } = await api.post('/auth/register-email', {
      full_name: fullName, email, phone, password,
    })
    localStorage.setItem('accessToken', data.data.access_token)
    set({ isAuthenticated: true })
    await get().checkAuth()
    return get().user
  },

  loginWithEmail: async (email, password) => {
    const { data } = await api.post('/auth/login-email', { email, password })
    localStorage.setItem('accessToken', data.data.access_token)
    set({ user: data.data.user, isAuthenticated: true })
    return data.data.user
  },

  googleAuth: async (idToken) => {
    const { data } = await api.post('/auth/google', { id_token: idToken })
    localStorage.setItem('accessToken', data.data.access_token)
    set({ user: data.data.user, isAuthenticated: true })
    return data.data.user
  },

  logout: async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // ignore
    }
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
