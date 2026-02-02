import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import router from '@/router'
import type { RefreshTokenPayload, RefreshTokenResponse } from '@/types'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('accessToken')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        localStorage.clear()
        router.push('/login')
        return Promise.reject(error)
      }

      try {
        const payload: RefreshTokenPayload = { refreshToken }
        const { data } = await axios.post<RefreshTokenResponse>(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/refresh`,
          payload,
        )

        localStorage.setItem('accessToken', data.accessToken)

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
        }
        return apiClient(originalRequest)
      } catch {
        localStorage.clear()
        router.push('/login')
        return Promise.reject(error)
      }
    }

    if (error.response?.status === 429) {
      console.error('Too many requests')
    }

    return Promise.reject(error)
  },
)

export default apiClient
