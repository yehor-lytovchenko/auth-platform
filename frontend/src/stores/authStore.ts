import apiClient from '@/services/api'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginResponse, RegisterPayload, LoginPayload } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const accessToken = ref<string | null>(localStorage.getItem('accessToken'))
  const refreshToken = ref<string | null>(localStorage.getItem('refreshToken'))

  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)
  const currentUser = computed(() => user.value)

  async function register(email: string, password: string): Promise<void> {
    const payload: RegisterPayload = { email, password }
    await apiClient.post('/api/auth/register', payload)
  }

  async function login(email: string, password: string, code?: string): Promise<void> {
    const payload: LoginPayload = {
      email,
      password,
    }

    if (code && code.trim()) {
      payload.twoFaCode = code
    }

    const res = await apiClient.post<LoginResponse>('/api/auth/login', payload)
    setTokens(res.data.accessToken, res.data.refreshToken)
    user.value = res.data.user
  }

  async function logout(): Promise<void> {
    try {
      await apiClient.post('/api/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      user.value = null
      accessToken.value = null
      refreshToken.value = null
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    }
  }

  function setTokens(access: string, refresh: string): void {
    accessToken.value = access
    refreshToken.value = refresh
    localStorage.setItem('accessToken', access)
    localStorage.setItem('refreshToken', refresh)
  }

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    currentUser,
    register,
    login,
    logout,
  }
})
