<template>
  <div class="space-y-4">
    <h2 class="text-xl font-semibold text-center">Reset Password</h2>
    <p class="text-gray-600 text-center">Enter your email to receive reset instructions</p>
    
    <!-- Success/Error Messages -->
    <div v-if="message" class="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
      {{ message }}
    </div>
    
    <div v-if="error" class="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
      {{ error }}
    </div>
    
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
        >
      </div>

      <button
        type="submit"
        :disabled="loading"
        class="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {{ loading ? 'Sending...' : 'Send Reset Link' }}
      </button>
    </form>

    <div class="text-center">
      <router-link to="/auth/login" class="text-blue-600 hover:text-blue-500">
        Back to Login
      </router-link>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { authApi } from '@/services/api'

export default {
  name: 'ForgotPasswordView',
  setup() {
    const email = ref('')
    const loading = ref(false)
    const message = ref('')
    const error = ref('')

    const handleSubmit = async () => {
      loading.value = true
      message.value = ''
      error.value = ''
      
      try {
        const response = await authApi.forgotPassword(email.value)
        message.value = response.data.message
      } catch (err) {
        error.value = err.response?.data?.message || 'An error occurred. Please try again.'
      } finally {
        loading.value = false
      }
    }

    return {
      email,
      loading,
      message,
      error,
      handleSubmit
    }
  }
}
</script>