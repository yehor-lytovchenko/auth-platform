<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Message from 'primevue/message'

const router = useRouter()
const authStore = useAuthStore()

const email = ref<string>('')
const password = ref<string>('')
const twoFactorCode = ref<string>('')
const error = ref<string>('')
const loading = ref<boolean>(false)

async function handleLogin(): Promise<void> {
  error.value = ''

  if (!email.value || !password.value) {
    error.value = 'Fill in all fields'
    return
  }

  loading.value = true

  try {
    const code = twoFactorCode.value.trim() || undefined
    await authStore.login(email.value, password.value, code)
    router.push('/dashboard')
  } catch {
    error.value = 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex justify-center items-center min-h-screen bg-gray-100">
    <Card class="w-full max-w-md">
      <template #title>
        <h2 class="text-2xl font-bold text-center">Sign In</h2>
      </template>

      <template #content>
        <Message v-if="error" severity="error" :closable="false">
          {{ error }}
        </Message>

        <form @submit.prevent="handleLogin" class="flex flex-col gap-4 mt-4">
          <div>
            <label for="email" class="block mb-2 font-medium">Email</label>
            <InputText
              id="email"
              v-model="email"
              type="email"
              placeholder="example@mail.com"
              class="w-full"
              :disabled="loading"
            />
          </div>

          <div>
            <label for="password" class="block mb-2 font-medium">Password</label>
            <Password
              id="password"
              v-model="password"
              placeholder="Enter your password"
              :feedback="false"
              toggle-mask
              class="w-full"
              :disabled="loading"
            />
          </div>

          <div>
            <label for="code" class="block mb-2 font-medium">
              2FA Code <span class="text-gray-400 text-sm">(if enabled)</span>
            </label>
            <InputText
              id="code"
              v-model="twoFactorCode"
              placeholder="000000"
              maxlength="6"
              class="w-full"
              :disabled="loading"
            />
          </div>

          <Button type="submit" label="Sign In" class="w-full" :loading="loading" />
        </form>

        <div class="text-center mt-4">
          <span class="text-gray-600">Don't have an account? </span>
          <router-link to="/register" class="text-blue-500 hover:underline"> Sign Up </router-link>
        </div>
      </template>
    </Card>
  </div>
</template>
