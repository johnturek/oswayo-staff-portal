<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-blue-600 text-white p-4">
      <div class="container mx-auto flex justify-between items-center">
        <h1 class="text-xl font-bold">Oswayo Staff Portal</h1>
        <div class="space-x-4">
          <router-link to="/" class="hover:text-blue-200">Dashboard</router-link>
          <router-link to="/profile" class="hover:text-blue-200">Profile</router-link>
          <button @click="logout" class="hover:text-blue-200">Logout</button>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="container mx-auto py-8">
      <router-view />
    </main>
  </div>
</template>

<script>
import { useAuthStore } from '../stores/auth'

export default {
  name: 'AppLayout',
  setup() {
    const authStore = useAuthStore()

    const logout = () => {
      authStore.logout()
      this.$router.push('/auth/login')
    }

    return {
      logout
    }
  }
}
</script>