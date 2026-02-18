<template>
  <div class="bg-white shadow rounded-lg p-6">
    <h1 class="text-2xl font-bold mb-4">User Profile</h1>
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">Name</label>
        <p class="mt-1 text-gray-900">Administrator</p>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">Email</label>
        <p class="mt-1 text-gray-900">admin@oswayo.com</p>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">Role</label>
        <p class="mt-1 text-gray-900">Administrator</p>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">Department</label>
        <p class="mt-1 text-gray-900">Administration</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProfileView'
}
</script>