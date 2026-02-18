<template>
  <div class="space-y-4">
    <h2 class="text-xl font-semibold text-center">Reset Password</h2>
    
    <form @submit.prevent="handleSubmit" class="space-y-4">
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
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'ResetPasswordView',
  setup() {
    const password = ref('')
    const confirmPassword = ref('')
    const loading = ref(false)

    const handleSubmit = () => {
      if (password.value !== confirmPassword.value) {
        alert('Passwords do not match')
        return
      }
      
      loading.value = true
      setTimeout(() => {
        alert('Password updated successfully!')
        loading.value = false
      }, 1000)
    }

    return {
      password,
      confirmPassword,
      loading,
      handleSubmit
    }
  }
}
</script>