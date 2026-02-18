<template>
  <div class="space-y-4">
    <h2 class="text-xl font-semibold text-center">Reset Password</h2>
    <p class="text-gray-600 text-center">Enter your email to receive reset instructions</p>
    
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

export default {
  name: 'ForgotPasswordView',
  setup() {
    const email = ref('')
    const loading = ref(false)

    const handleSubmit = () => {
      loading.value = true
      // Mock implementation
      setTimeout(() => {
        alert('Password reset email sent!')
        loading.value = false
      }, 1000)
    }

    return {
      email,
      loading,
      handleSubmit
    }
  }
}
</script>