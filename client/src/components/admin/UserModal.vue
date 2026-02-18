<template>
  <div v-if="show" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <!-- Header -->
        <div class="flex items-center justify-between pb-4 border-b">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ isEdit ? 'Edit User' : 'Create New User' }}
          </h3>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="mt-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Basic Information -->
            <div class="col-span-2">
              <h4 class="text-md font-medium text-gray-900 mb-4">Basic Information</h4>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Employee ID *
              </label>
              <input
                v-model="form.employeeId"
                type="text"
                required
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., EMP001"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                v-model="form.email"
                type="email"
                required
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="user@oswayo.com"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                v-model="form.firstName"
                type="text"
                required
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                v-model="form.lastName"
                type="text"
                required
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                v-model="form.phoneNumber"
                type="tel"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="814-555-0000"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Hire Date
              </label>
              <input
                v-model="form.hireDate"
                type="date"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>

            <!-- Role and Department -->
            <div class="col-span-2 border-t pt-6">
              <h4 class="text-md font-medium text-gray-900 mb-4">Role and Assignment</h4>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Role *
              </label>
              <select
                v-model="form.role"
                required
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                @change="handleRoleChange"
              >
                <option value="">Select Role</option>
                <option value="STAFF">Staff</option>
                <option value="MANAGER">Manager</option>
                <option value="FULL_TIME_FACULTY">Full Time Faculty</option>
                <option value="PRINCIPAL">Principal</option>
                <option value="DISTRICT_ADMIN">District Administrator</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Building
              </label>
              <select
                v-model="form.building"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Building</option>
                <option value="Elementary School">Elementary School</option>
                <option value="High School">High School</option>
                <option value="District Office">District Office</option>
                <option value="District Wide">District Wide</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                v-model="form.department"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Department</option>
                <option value="Administration">Administration</option>
                <option value="Mathematics">Mathematics</option>
                <option value="English">English</option>
                <option value="Science">Science</option>
                <option value="History">History</option>
                <option value="Elementary">Elementary</option>
                <option value="Special Education">Special Education</option>
                <option value="Physical Education">Physical Education</option>
                <option value="Art">Art</option>
                <option value="Music">Music</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Food Service">Food Service</option>
                <option value="Transportation">Transportation</option>
                <option value="Office">Office</option>
                <option value="Technology">Technology</option>
                <option value="Substitute Teaching">Substitute Teaching</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                v-model="form.active"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option :value="true">Active</option>
                <option :value="false">Inactive</option>
              </select>
            </div>

            <!-- Manager Assignment -->
            <div v-if="form.role === 'STAFF' || form.role === 'FULL_TIME_FACULTY'" class="col-span-2 border-t pt-6">
              <h4 class="text-md font-medium text-gray-900 mb-4">
                {{ form.role === 'FULL_TIME_FACULTY' ? 'Principal Assignment' : 'Manager Assignment' }}
              </h4>
              
              <div v-if="form.role === 'FULL_TIME_FACULTY'">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Building Principal *
                </label>
                <select
                  v-model="form.principalId"
                  required
                  class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Principal</option>
                  <option v-for="principal in availablePrincipals" :key="principal.id" :value="principal.id">
                    {{ principal.firstName }} {{ principal.lastName }} ({{ principal.building }})
                  </option>
                </select>
              </div>

              <div v-else>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Managers (Can select multiple for staff with multiple roles)
                </label>
                <div class="space-y-2 max-h-40 overflow-y-auto">
                  <div v-for="manager in availableManagers" :key="manager.id" class="flex items-center">
                    <input
                      type="checkbox"
                      :id="`manager-${manager.id}`"
                      :value="manager.id"
                      v-model="form.managerIds"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    >
                    <label :for="`manager-${manager.id}`" class="ml-2 text-sm text-gray-700">
                      {{ manager.firstName }} {{ manager.lastName }} 
                      <span class="text-gray-500">({{ manager.department }}{{ manager.building ? ` - ${manager.building}` : '' }})</span>
                    </label>
                  </div>
                </div>
                <p class="text-xs text-gray-500 mt-2">
                  Select all managers that this staff member reports to
                </p>
              </div>
            </div>

            <!-- Emergency Contact -->
            <div class="col-span-2 border-t pt-6">
              <h4 class="text-md font-medium text-gray-900 mb-4">Emergency Contact</h4>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Emergency Contact Name
              </label>
              <input
                v-model="form.emergencyContact"
                type="text"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Emergency Contact Phone
              </label>
              <input
                v-model="form.emergencyPhone"
                type="tel"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="814-555-0000"
              >
            </div>
          </div>

          <!-- Password Note for New Users -->
          <div v-if="!isEdit" class="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
            <div class="flex">
              <i class="fas fa-info-circle text-blue-400 mt-1"></i>
              <div class="ml-3">
                <h4 class="text-sm font-medium text-blue-800">Default Password</h4>
                <p class="text-sm text-blue-700">
                  New users will be created with the default password: <strong>Admin123!</strong>
                  <br>They will be required to change it on first login.
                </p>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="mt-8 flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              @click="$emit('close')"
              class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
              {{ isEdit ? 'Update User' : 'Create User' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, onMounted } from 'vue'
import { adminApi } from '../../services/api'

export default {
  name: 'UserModal',
  props: {
    show: Boolean,
    user: Object,
    isEdit: Boolean
  },
  emits: ['close', 'save'],
  setup(props, { emit }) {
    const loading = ref(false)
    const availableManagers = ref([])
    const availablePrincipals = ref([])

    const form = ref({
      employeeId: '',
      email: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      hireDate: '',
      role: '',
      building: '',
      department: '',
      active: true,
      principalId: '',
      managerIds: [],
      emergencyContact: '',
      emergencyPhone: ''
    })

    // Watch for user changes
    watch(() => props.user, (newUser) => {
      if (newUser && props.isEdit) {
        form.value = {
          employeeId: newUser.employeeId || '',
          email: newUser.email || '',
          firstName: newUser.firstName || '',
          lastName: newUser.lastName || '',
          phoneNumber: newUser.phoneNumber || '',
          hireDate: newUser.hireDate ? newUser.hireDate.split('T')[0] : '',
          role: newUser.role || '',
          building: newUser.building || '',
          department: newUser.department || '',
          active: newUser.active !== false,
          principalId: newUser.principalId || '',
          managerIds: newUser.managers ? newUser.managers.map(m => m.id) : [],
          emergencyContact: newUser.emergencyContact || '',
          emergencyPhone: newUser.emergencyPhone || ''
        }
      } else if (!props.isEdit) {
        // Reset form for new user
        form.value = {
          employeeId: '',
          email: '',
          firstName: '',
          lastName: '',
          phoneNumber: '',
          hireDate: '',
          role: '',
          building: '',
          department: '',
          active: true,
          principalId: '',
          managerIds: [],
          emergencyContact: '',
          emergencyPhone: ''
        }
      }
    }, { immediate: true })

    const loadManagers = async () => {
      try {
        const response = await adminApi.getManagers()
        availableManagers.value = response.data.managers
        availablePrincipals.value = response.data.managers.filter(m => m.role === 'PRINCIPAL')
      } catch (error) {
        console.error('Failed to load managers:', error)
      }
    }

    const handleRoleChange = () => {
      // Reset manager/principal assignments when role changes
      form.value.principalId = ''
      form.value.managerIds = []
    }

    const handleSubmit = async () => {
      try {
        loading.value = true
        
        // Prepare form data
        const userData = {
          ...form.value,
          hireDate: form.value.hireDate ? new Date(form.value.hireDate) : null
        }

        // Remove unused fields based on role
        if (form.value.role === 'FULL_TIME_FACULTY') {
          delete userData.managerIds
        } else {
          delete userData.principalId
        }

        emit('save', userData)
      } catch (error) {
        console.error('Failed to save user:', error)
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      loadManagers()
    })

    return {
      loading,
      form,
      availableManagers,
      availablePrincipals,
      handleRoleChange,
      handleSubmit
    }
  }
}
</script>
