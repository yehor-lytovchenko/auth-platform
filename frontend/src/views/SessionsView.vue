<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores/authStore'
import apiClient from '@/services/api'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import type { ApiErrorResponse, Session, SessionsResponse } from '@/types'

const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()
const sessions = ref<Session[]>([])
const loading = ref(false)

const fetchSessions = async (): Promise<void> => {
  loading.value = true
  try {
    const res = await apiClient.get<SessionsResponse>('/api/auth/sessions')
    sessions.value = res.data.sessions
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load sessions',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

const logoutSession = async (sessionId: number): Promise<void> => {
  try {
    await apiClient.delete(`/api/auth/sessions/${sessionId}`)
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Session logged out',
      life: 3000,
    })

    await fetchSessions()

    if (sessions.value.length === 0) {
      authStore.logout()
      await router.replace('/login')
      window.location.reload()
    }
  } catch (error: unknown) {
    const apiError = error as ApiErrorResponse
    if (apiError.response?.status === 401 || apiError.response?.status === 403) {
      authStore.logout()
      router.push('/login')
    } else {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: apiError.response?.data?.error || 'Failed to logout session',
        life: 3000,
      })
    }
  }
}

const formatDate = (date: string): string => {
  return new Date(date).toLocaleString()
}

onMounted(() => {
  fetchSessions()
})
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-4">
    <div class="max-w-6xl mx-auto">
      <Card class="shadow-lg">
        <template #title>
          <div class="flex items-center justify-between">
            <h1 class="text-3xl font-bold text-gray-800">Active Sessions</h1>
            <Button icon="pi pi-arrow-left" label="Back" @click="router.push('/dashboard')" text />
          </div>
        </template>

        <template #content>
          <DataTable
            :value="sessions"
            :loading="loading"
            responsiveLayout="scroll"
            class="p-datatable-sm"
          >
            <Column field="deviceInfo" header="Device" />
            <Column field="ipAddress" header="IP Address" />
            <Column field="createdAt" header="Created">
              <template #body="{ data }">
                {{ formatDate(data.createdAt) }}
              </template>
            </Column>
            <Column header="Actions">
              <template #body="{ data }">
                <Button
                  icon="pi pi-sign-out"
                  label="Logout"
                  @click="logoutSession(data.id)"
                  severity="danger"
                  size="small"
                />
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>
    </div>
  </div>
</template>
