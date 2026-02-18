<template>
  <div class="space-y-4">
    <h2 class="text-xl font-semibold text-center">Reset Password</h2>
    
    <!-- Success/Error Messages -->
    <div v-if="message" class="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
      {{ message }}
    </div>
    
    <div v-if="error" class="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
      {{ error }}
    </div>
    
    <form @submit.prevent="handleSubmit" class="space-y-4" v-if="!message">
      <div>
        <label for="password" class="block text-sm font-medium text-gray-700">New Password</label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
        >
      </div>

      <div>
        <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirm Password</label>
        <input
          id="confirmPassword"
          v-model="confirmPassword"
          type="password"
          required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
        >
      </div>

      <button
        type="submit"
        :disabled="loading"
        class="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {{ loading ? 'Updating...' : 'Update Password' }}
      </button>
    </form>
    
    <div class="text-center" v-if="message">
      <p class="text-sm text-gray-600">Redirecting to login...</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authApi } from '@/services/api'

export default {
  name: 'ResetPasswordView',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const password = ref('')
    const confirmPassword = ref('')
    const loading = ref(false)
    const message = ref('')
    const error = ref('')
    const token = ref('')

    onMounted(() => {
      token.value = route.query.token
      if (!token.value) {
        error.value = 'Invalid reset link'
      }
    })

    const handleSubmit = async () => {
      if (password.value !== confirmPassword.value) {
        error.value = 'Passwords do not match'
        return
      }
      
      loading.value = true
      message.value = ''
      error.value = ''
      
      try {
        const response = await authApi.resetPassword(token.value, password.value)
        message.value = response.data.message
        
        // Redirect to login after success
        setTimeout(() => {
          router.push('/auth/login')
        }, 2000)
      } catch (err) {
        error.value = err.response?.data?.message || 'An error occurred. Please try again.'
      } finally {
        loading.value = false
      }
    }

    return {
      password,
      confirmPassword,
      loading,
      message,
      error,
      handleSubmit
    }
  }
}
</script>