<template>
  <div class="space-y-6">
    <div class="bg-white shadow rounded-lg p-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-4">Staff Dashboard</h1>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div class="bg-blue-50 p-4 rounded-lg">
          <h3 class="font-semibold text-blue-900">Current Time Card</h3>
          <p class="text-blue-700">Week of {{ currentWeek }}</p>
          <button class="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            View Time Card
          </button>
        </div>

        <div class="bg-green-50 p-4 rounded-lg">
          <h3 class="font-semibold text-green-900">Time Off Balance</h3>
          <p class="text-green-700">Available Days: 12</p>
          <button class="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Request Time Off
          </button>
        </div>

        <div class="bg-purple-50 p-4 rounded-lg">
          <h3 class="font-semibold text-purple-900">School Calendar</h3>
          <p class="text-purple-700">Next Holiday: President's Day</p>
          <button class="mt-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
            View Calendar
          </button>
        </div>

      </div>
    </div>

    <div class="bg-white shadow rounded-lg p-6">
      <h2 class="text-xl font-semibold mb-4">Recent Activity</h2>
      <div class="space-y-3">
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded">
          <span>Time card submitted for Week 2/10</span>
          <span class="text-sm text-gray-500">2 days ago</span>
        </div>
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded">
          <span>Time off request approved</span>
          <span class="text-sm text-gray-500">1 week ago</span>
        </div>
      </div>
    </div>

    <div class="bg-white shadow rounded-lg p-6">
      <h2 class="text-xl font-semibold mb-4">System Status</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 class="font-medium text-gray-900">Application Status</h3>
          <p class="text-green-600">✅ Online and working</p>
        </div>
        <div>
          <h3 class="font-medium text-gray-900">Database Connection</h3>
          <p class="text-green-600">✅ Connected</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'DashboardView',
  setup() {
    const currentWeek = ref('Feb 17, 2026')

    return {
      currentWeek
    }
  }
}
</script>