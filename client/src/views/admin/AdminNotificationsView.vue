<template>
  <div class="bg-white shadow rounded-lg p-6">
    <h1 class="text-2xl font-bold mb-4">{{ title }}</h1>
    <p class="text-gray-600">This feature is coming soon!</p>
    <div class="mt-4 p-4 bg-blue-50 rounded">
      <p class="text-blue-800">✅ Basic structure in place</p>
      <p class="text-blue-800">🚧 Full functionality being developed</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PlaceholderView',
  computed: {
    title() {
      return this.$route.meta.title || 'Staff Portal Feature'
    }
  }
}
</script>
