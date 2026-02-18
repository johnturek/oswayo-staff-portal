<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="bg-white shadow rounded-lg p-6 mb-6">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">User Management</h1>
            <p class="text-gray-600">Manage staff accounts, roles, and reporting relationships</p>
          </div>
          <button 
            @click="showCreateUser = true"
            class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <i class="fas fa-plus mr-2"></i>
            Add New User
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white shadow rounded-lg p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Filter by Role</label>
            <select v-model="filters.role" class="w-full border border-gray-300 rounded-md px-3 py-2">
              <option value="">All Roles</option>
              <option value="STAFF">Staff</option>
              <option value="MANAGER">Manager</option>
              <option value="FULL_TIME_FACULTY">Full Time Faculty</option>
              <option value="PRINCIPAL">Principal</option>
              <option value="DISTRICT_ADMIN">District Admin</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Filter by Building</label>
            <select v-model="filters.building" class="w-full border border-gray-300 rounded-md px-3 py-2">
              <option value="">All Buildings</option>
              <option value="Elementary School">Elementary School</option>
              <option value="High School">High School</option>
              <option value="District Office">District Office</option>
              <option value="District Wide">District Wide</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Filter by Department</label>
            <select v-model="filters.department" class="w-full border border-gray-300 rounded-md px-3 py-2">
              <option value="">All Departments</option>
              <option value="Administration">Administration</option>
              <option value="Mathematics">Mathematics</option>
              <option value="English">English</option>
              <option value="Elementary">Elementary</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Food Service">Food Service</option>
              <option value="Office">Office</option>
              <option value="Special Education">Special Education</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Name or Employee ID"
              class="w-full border border-gray-300 rounded-md px-3 py-2"
            >
          </div>
        </div>
      </div>

      <!-- Users Table -->
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Building
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Managers
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span class="text-blue-600 font-medium">
                        {{ user.firstName.charAt(0) + user.lastName.charAt(0) }}
                      </span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ user.firstName }} {{ user.lastName }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ user.email }}
                    </div>
                    <div class="text-xs text-gray-400">
                      ID: {{ user.employeeId }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getRoleBadgeClass(user.role)" class="px-2 py-1 text-xs rounded-full">
                  {{ formatRole(user.role) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ user.department || '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ user.building || '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div v-if="user.managers && user.managers.length > 0">
                  <div v-for="manager in user.managers" :key="manager.id" class="text-xs bg-gray-100 px-2 py-1 rounded mb-1">
                    {{ manager.firstName }} {{ manager.lastName }}
                  </div>
                </div>
                <div v-else-if="user.principal" class="text-xs bg-blue-100 px-2 py-1 rounded">
                  Principal: {{ user.principal.firstName }} {{ user.principal.lastName }}
                </div>
                <span v-else class="text-gray-400">No manager</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" 
                      class="px-2 py-1 text-xs rounded-full">
                  {{ user.active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button 
                  @click="editUser(user)"
                  class="text-blue-600 hover:text-blue-900"
                  title="Edit User"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button 
                  @click="viewTimeCards(user)"
                  v-if="user.role === 'STAFF'"
                  class="text-green-600 hover:text-green-900"
                  title="View Time Cards"
                >
                  <i class="fas fa-clock"></i>
                </button>
                <button 
                  @click="resetPassword(user)"
                  class="text-yellow-600 hover:text-yellow-900"
                  title="Reset Password"
                >
                  <i class="fas fa-key"></i>
                </button>
                <button 
                  @click="toggleUserStatus(user)"
                  :class="user.active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'"
                  :title="user.active ? 'Deactivate User' : 'Activate User'"
                >
                  <i :class="user.active ? 'fas fa-user-slash' : 'fas fa-user-check'"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6">
        <div class="flex-1 flex justify-between sm:hidden">
          <button 
            @click="previousPage"
            :disabled="currentPage === 1"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button 
            @click="nextPage"
            :disabled="currentPage >= totalPages"
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Showing {{ ((currentPage - 1) * pageSize) + 1 }} to {{ Math.min(currentPage * pageSize, totalUsers) }} of {{ totalUsers }} results
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button 
                @click="previousPage"
                :disabled="currentPage === 1"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <i class="fas fa-chevron-left"></i>
              </button>
              <button 
                v-for="page in visiblePages" 
                :key="page"
                @click="goToPage(page)"
                :class="page === currentPage ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'"
                class="relative inline-flex items-center px-4 py-2 border text-sm font-medium"
              >
                {{ page }}
              </button>
              <button 
                @click="nextPage"
                :disabled="currentPage >= totalPages"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <i class="fas fa-chevron-right"></i>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit User Modal -->
    <UserModal 
      :show="showCreateUser || showEditUser" 
      :user="selectedUser"
      :isEdit="showEditUser"
      @close="closeUserModal"
      @save="handleUserSave"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import UserModal from '../../components/admin/UserModal.vue'
import { adminApi } from '../../services/api'

export default {
  name: 'AdminUsersView',
  components: {
    UserModal
  },
  setup() {
    const authStore = useAuthStore()
    
    // State
    const users = ref([])
    const loading = ref(false)
    const showCreateUser = ref(false)
    const showEditUser = ref(false)
    const selectedUser = ref(null)
    
    // Pagination
    const currentPage = ref(1)
    const pageSize = ref(20)
    const totalUsers = ref(0)
    
    // Filters
    const filters = ref({
      role: '',
      building: '',
      department: ''
    })
    const searchQuery = ref('')

    // Computed
    const filteredUsers = computed(() => {
      let filtered = users.value

      if (filters.value.role) {
        filtered = filtered.filter(user => user.role === filters.value.role)
      }

      if (filters.value.building) {
        filtered = filtered.filter(user => user.building === filters.value.building)
      }

      if (filters.value.department) {
        filtered = filtered.filter(user => user.department === filters.value.department)
      }

      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(user => 
          user.firstName.toLowerCase().includes(query) ||
          user.lastName.toLowerCase().includes(query) ||
          user.employeeId.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
        )
      }

      totalUsers.value = filtered.length
      
      // Paginate
      const start = (currentPage.value - 1) * pageSize.value
      return filtered.slice(start, start + pageSize.value)
    })

    const totalPages = computed(() => Math.ceil(totalUsers.value / pageSize.value))

    const visiblePages = computed(() => {
      const pages = []
      const start = Math.max(1, currentPage.value - 2)
      const end = Math.min(totalPages.value, start + 4)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      return pages
    })

    // Methods
    const loadUsers = async () => {
      try {
        loading.value = true
        const response = await adminApi.getUsers()
        console.log('API Response:', response.data) // Debug log
        users.value = response.data.data // Correct path to users array
      } catch (error) {
        console.error('Failed to load users:', error)
        // Show user-friendly error
        alert('Failed to load users. Please refresh the page.')
      } finally {
        loading.value = false
      }
    }

    const editUser = (user) => {
      selectedUser.value = { ...user }
      showEditUser.value = true
    }

    const closeUserModal = () => {
      showCreateUser.value = false
      showEditUser.value = false
      selectedUser.value = null
    }

    const handleUserSave = async (userData) => {
      try {
        if (showEditUser.value) {
          await adminApi.updateUser(selectedUser.value.id, userData)
        } else {
          await adminApi.createUser(userData)
        }
        closeUserModal()
        await loadUsers()
      } catch (error) {
        console.error('Failed to save user:', error)
      }
    }

    const toggleUserStatus = async (user) => {
      try {
        await adminApi.updateUser(user.id, { active: !user.active })
        await loadUsers()
      } catch (error) {
        console.error('Failed to update user status:', error)
      }
    }

    const resetPassword = async (user) => {
      if (confirm(`Reset password for ${user.firstName} ${user.lastName}?`)) {
        try {
          await adminApi.resetPassword(user.id)
          alert('Password reset successfully. New password is: Admin123!')
        } catch (error) {
          console.error('Failed to reset password:', error)
        }
      }
    }

    const viewTimeCards = (user) => {
      // Navigate to time cards view for this user
      this.$router.push(`/admin/users/${user.id}/timecards`)
    }

    // Utility methods
    const formatRole = (role) => {
      return role.replace(/_/g, ' ').split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ')
    }

    const getRoleBadgeClass = (role) => {
      const classes = {
        'DISTRICT_ADMIN': 'bg-purple-100 text-purple-800',
        'PRINCIPAL': 'bg-blue-100 text-blue-800',
        'MANAGER': 'bg-green-100 text-green-800',
        'FULL_TIME_FACULTY': 'bg-yellow-100 text-yellow-800',
        'STAFF': 'bg-gray-100 text-gray-800'
      }
      return classes[role] || 'bg-gray-100 text-gray-800'
    }

    // Pagination methods
    const goToPage = (page) => {
      currentPage.value = page
    }

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++
      }
    }

    const previousPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--
      }
    }

    // Initialize
    onMounted(() => {
      loadUsers()
    })

    return {
      users,
      loading,
      showCreateUser,
      showEditUser,
      selectedUser,
      filters,
      searchQuery,
      filteredUsers,
      currentPage,
      totalPages,
      totalUsers,
      visiblePages,
      editUser,
      closeUserModal,
      handleUserSave,
      toggleUserStatus,
      resetPassword,
      viewTimeCards,
      formatRole,
      getRoleBadgeClass,
      goToPage,
      nextPage,
      previousPage
    }
  }
}
</script>
