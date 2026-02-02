<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import apiClient from '@/services/api'
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dialog from 'primevue/dialog'
import Image from 'primevue/image'
import type { ApiErrorResponse, Generate2FAResponse, Enable2FAPayload } from '@/types'

const router = useRouter()
const toast = useToast()

const qrCode = ref<string | null>(null)
const twoFaCode = ref('')
const showQrDialog = ref(false)
const showDeleteDialog = ref(false)

const generate2FA = async (): Promise<void> => {
  try {
    const { data } = await apiClient.post<Generate2FAResponse>('/api/auth/2fa/generate')
    qrCode.value = data.qrCode
    showQrDialog.value = true
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Scan QR code in Google Authenticator',
      life: 3000,
    })
  } catch (error: unknown) {
    const apiError = error as ApiErrorResponse
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: apiError.response?.data?.error || 'Failed to generate 2FA',
      life: 3000,
    })
  }
}

const enable2FA = async (): Promise<void> => {
  try {
    const payload: Enable2FAPayload = { code: twoFaCode.value }
    await apiClient.post('/api/auth/2fa/enable', payload)
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: '2FA enabled successfully',
      life: 3000,
    })
    showQrDialog.value = false
    twoFaCode.value = ''
  } catch (error: unknown) {
    const apiError = error as ApiErrorResponse
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: apiError.response?.data?.error || 'Invalid code',
      life: 3000,
    })
  }
}

const deleteAccount = async (): Promise<void> => {
  try {
    await apiClient.delete('/api/auth/account')
    toast.add({ severity: 'success', summary: 'Success', detail: 'Account deleted', life: 3000 })
    localStorage.clear()
    setTimeout(() => router.push('/login'), 2000)
  } catch (error: unknown) {
    const apiError = error as ApiErrorResponse
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: apiError.response?.data?.error || 'Failed to delete account',
      life: 3000,
    })
  }
}
</script>

<template>
  <div class="flex align-items-center justify-content-center min-h-screen">
    <Card style="width: 35rem">
      <template #title>Settings</template>
      <template #content>
        <div class="flex flex-column gap-3">
          <Button label="Enable 2FA" @click="generate2FA" icon="pi pi-shield" />
          <Button
            label="Back to Dashboard"
            @click="router.push('/dashboard')"
            severity="secondary"
            icon="pi pi-arrow-left"
          />
          <Button
            label="Delete Account"
            @click="showDeleteDialog = true"
            severity="danger"
            icon="pi pi-trash"
          />
        </div>
      </template>
    </Card>

    <Dialog
      v-model:visible="showQrDialog"
      header="Enable 2FA"
      :modal="true"
      :style="{ width: '30rem' }"
    >
      <div class="flex flex-column align-items-center gap-3 p-4">
        <p class="text-center">Scan this QR code with Google Authenticator:</p>
        <p v-if="!qrCode">Loading QR code...</p>
        <Image v-else :src="qrCode" alt="QR Code" :width="600" />
        <InputText v-model="twoFaCode" placeholder="Enter 6-digit code" class="w-full" />
        <Button label="Enable 2FA" @click="enable2FA" class="w-full" />
      </div>
    </Dialog>

    <Dialog
      v-model:visible="showDeleteDialog"
      header="Delete Account"
      :modal="true"
      :style="{ width: '25rem' }"
    >
      <p>Are you sure you want to delete your account? This action cannot be undone.</p>
      <template #footer>
        <Button label="Cancel" @click="showDeleteDialog = false" severity="secondary" />
        <Button label="Delete" @click="deleteAccount" severity="danger" />
      </template>
    </Dialog>
  </div>
</template>
