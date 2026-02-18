<template>
  <div class="space-y-6">
    <!-- Admin Dashboard -->
    <div v-if="isAdmin" class="space-y-6">
      <!-- Admin Header -->
      <div class="bg-white shadow rounded-lg p-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">District Administration Dashboard</h1>
        <p class="text-gray-600">Oswayo Valley School District - System Overview</p>
      </div>

      <!-- Admin Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-blue-50 p-6 rounded-lg">
          <div class="flex items-center">
            <div class="p-2 bg-blue-500 rounded-md">
              <i class="fas fa-users text-white"></i>
            </div>
            <div class="ml-4">
              <h3 class="font-semibold text-blue-900">Total Staff</h3>
              <p class="text-2xl font-bold text-blue-700">{{ adminStats.totalUsers || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="bg-green-50 p-6 rounded-lg">
          <div class="flex items-center">
            <div class="p-2 bg-green-500 rounded-md">
              <i class="fas fa-clock text-white"></i>
            </div>
            <div class="ml-4">
              <h3 class="font-semibold text-green-900">Pending Timecards</h3>
              <p class="text-2xl font-bold text-green-700">{{ adminStats.pendingTimeCards || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="bg-yellow-50 p-6 rounded-lg">
          <div class="flex items-center">
            <div class="p-2 bg-yellow-500 rounded-md">
              <i class="fas fa-calendar text-white"></i>
            </div>
            <div class="ml-4">
              <h3 class="font-semibold text-yellow-900">Pending Time Off</h3>
              <p class="text-2xl font-bold text-yellow-700">{{ adminStats.pendingTimeOff || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="bg-purple-50 p-6 rounded-lg">
          <div class="flex items-center">
            <div class="p-2 bg-purple-500 rounded-md">
              <i class="fas fa-user-plus text-white"></i>
            </div>
            <div class="ml-4">
              <h3 class="font-semibold text-purple-900">Active Users</h3>
              <p class="text-2xl font-bold text-purple-700">{{ adminStats.activeUsers || 0 }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Admin Action Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white shadow rounded-lg p-6">
          <h3 class="font-semibold text-gray-900 mb-3">Staff Management</h3>
          <p class="text-gray-600 mb-4">Manage user accounts, roles, and permissions</p>
          <router-link to="/admin/users" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 inline-flex items-center">
            <i class="fas fa-users mr-2"></i>
            Manage Staff
          </router-link>
        </div>

        <div class="bg-white shadow rounded-lg p-6">
          <h3 class="font-semibold text-gray-900 mb-3">Timecard Approvals</h3>
          <p class="text-gray-600 mb-4">Review and approve pending timecards</p>
          <router-link to="/admin/timecards" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 inline-flex items-center">
            <i class="fas fa-clock mr-2"></i>
            Review Timecards
          </router-link>
        </div>

        <div class="bg-white shadow rounded-lg p-6">
          <h3 class="font-semibold text-gray-900 mb-3">Time Off Requests</h3>
          <p class="text-gray-600 mb-4">Approve or reject leave requests</p>
          <router-link to="/admin/timeoff" class="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 inline-flex items-center">
            <i class="fas fa-calendar mr-2"></i>
            Manage Requests
          </router-link>
        </div>
      </div>

      <!-- Staff Breakdown -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white shadow rounded-lg p-6">
          <h3 class="font-semibold text-gray-900 mb-4">Staff by Role</h3>
          <div class="space-y-3" v-if="adminStats.roleBreakdown">
            <div v-for="(count, role) in adminStats.roleBreakdown" :key="role" class="flex justify-between">
              <span class="text-gray-600">{{ formatRole(role) }}</span>
              <span class="font-semibold">{{ count }}</span>
            </div>
          </div>
        </div>

        <div class="bg-white shadow rounded-lg p-6">
          <h3 class="font-semibold text-gray-900 mb-4">Staff by Building</h3>
          <div class="space-y-3" v-if="adminStats.buildingBreakdown">
            <div v-for="(count, building) in adminStats.buildingBreakdown" :key="building" class="flex justify-between">
              <span class="text-gray-600">{{ building }}</span>
              <span class="font-semibold">{{ count }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Regular User Dashboard -->
    <div v-else class="space-y-6">
      <div class="bg-white shadow rounded-lg p-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-4">Staff Dashboard</h1>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div class="bg-blue-50 p-4 rounded-lg">
            <h3 class="font-semibold text-blue-900">Current Time Card</h3>
            <p class="text-blue-700">Week of {{ currentWeek }}</p>
            <router-link to="/timecards" class="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 inline-block">
              View Time Card
            </router-link>
          </div>

          <div class="bg-green-50 p-4 rounded-lg">
            <h3 class="font-semibold text-green-900">Time Off Balance</h3>
            <p class="text-green-700">Available Days: 12</p>
            <router-link to="/timeoff" class="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 inline-block">
              Request Time Off
            </router-link>
          </div>

          <div class="bg-purple-50 p-4 rounded-lg">
            <h3 class="font-semibold text-purple-900">School Calendar</h3>
            <p class="text-purple-700">Next Holiday: President's Day</p>
            <router-link to="/calendar" class="mt-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 inline-block">
              View Calendar
            </router-link>
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
    </div>

    <!-- System Status (for all users) -->
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
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { adminApi } from '../services/api'

export default {
  name: 'DashboardView',
  setup() {
    const authStore = useAuthStore()
    const currentWeek = ref('Feb 17, 2026')
    const adminStats = ref({})
    const loading = ref(false)

    const isAdmin = computed(() => 
      authStore.user?.role === 'DISTRICT_ADMIN' || authStore.user?.role === 'PRINCIPAL'
    )

    const loadAdminStats = async () => {
      if (!isAdmin.value) return
      
      try {
        loading.value = true
        const response = await adminApi.getStats()
        console.log('Admin stats loaded:', response.data)
        adminStats.value = response.data.stats
      } catch (error) {
        console.error('Failed to load admin stats:', error)
      } finally {
        loading.value = false
      }
    }

    const formatRole = (role) => {
      return role.replace(/_/g, ' ').split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ')
    }

    onMounted(() => {
      loadAdminStats()
    })

    return {
      currentWeek,
      adminStats,
      isAdmin,
      loading,
      formatRole
    }
  }
}
</script>