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
const confirmPassword = ref<string>('')
const error = ref<string>('')
const loading = ref<boolean>(false)

async function handleRegister(): Promise<void> {
  error.value = ''

  if (!email.value || !password.value || !confirmPassword.value) {
    error.value = 'Fill in all fields'
    return
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  if (password.value.length < 8) {
    error.value = 'Password must be at least 8 characters'
    return
  }

  loading.value = true

  try {
    await authStore.register(email.value, password.value)
    router.push('/dashboard')
  } catch {
    error.value = 'Registration failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex justify-center items-center min-h-screen bg-gray-100">
    <Card class="w-full max-w-md">
      <template #title>
        <h2 class="text-2xl font-bold text-center">Sign Up</h2>
      </template>

      <template #content>
        <Message v-if="error" severity="error" :closable="false">
          {{ error }}
        </Message>

        <form @submit.prevent="handleRegister" class="flex flex-col gap-4 mt-4">
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
              placeholder="Min 8 characters"
              :feedback="false"
              toggle-mask
              class="w-full"
              :disabled="loading"
            />
          </div>

          <div>
            <label for="confirm" class="block mb-2 font-medium">Confirm Password</label>
            <Password
              id="confirm"
              v-model="confirmPassword"
              placeholder="Repeat password"
              :feedback="false"
              toggle-mask
              class="w-full"
              :disabled="loading"
            />
          </div>

          <Button type="submit" label="Sign Up" class="w-full" :loading="loading" />
        </form>

        <div class="text-center mt-4">
          <span class="text-gray-600">Already have an account? </span>
          <router-link to="/login" class="text-blue-500 hover:underline"> Sign In </router-link>
        </div>
      </template>
    </Card>
  </div>
</template>
