<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="max-w-md w-full">
      <div class="bg-white shadow-md rounded-lg p-8">
        <div class="text-center mb-6">
          <h1 class="text-2xl font-bold text-gray-900">Oswayo Staff Portal</h1>
          <p class="text-gray-600">School District Staff Management</p>
        </div>
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AuthLayout'
}
</script>