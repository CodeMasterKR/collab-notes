import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://localhost:3001',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const url = error.config?.url || ''

    const isAuthRoute =
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/verify-otp') ||
      url.includes('/auth/forgot-password') ||
      url.includes('/auth/reset-password')

    if (error.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem('token')
      
      const fullPath = window.location.pathname + window.location.search
      window.location.href = `/login?redirect=${encodeURIComponent(fullPath)}`
    }

    return Promise.reject(error)
  }
)