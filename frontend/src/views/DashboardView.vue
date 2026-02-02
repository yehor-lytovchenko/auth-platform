<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'
import Card from 'primevue/card'
import Button from 'primevue/button'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = async (): Promise<void> => {
  await authStore.logout()
  await router.replace('/login')
  window.location.reload()
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 p-4">
    <Card class="w-full max-w-2xl shadow-lg">
      <template #title>
        <h1 class="text-3xl font-bold text-gray-800">Dashboard</h1>
      </template>

      <template #content>
        <div class="mb-6">
          <p class="text-xl mb-2">Welcome back!</p>
          <p class="text-gray-600">
            <i class="pi pi-envelope mr-2"></i>
            <span class="font-medium">{{ authStore.currentUser?.email || 'Loading...' }}</span>
          </p>
        </div>

        <div class="flex flex-wrap gap-3">
          <Button label="Sessions" icon="pi pi-desktop" @click="router.push('/sessions')" />
          <Button
            label="Settings"
            icon="pi pi-cog"
            @click="router.push('/settings')"
            severity="secondary"
          />
          <Button label="Logout" icon="pi pi-sign-out" @click="handleLogout" severity="danger" />
        </div>
      </template>
    </Card>
  </div>
</template>
