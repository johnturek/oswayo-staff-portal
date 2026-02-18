<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="bg-white shadow rounded-lg p-6 mb-6">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Time Off Management</h1>
            <p class="text-gray-600">Review and approve staff time off requests</p>
          </div>
          <div class="flex space-x-3">
            <select v-model="statusFilter" class="border border-gray-300 rounded-md px-3 py-2">
              <option value="">All Status</option>
              <option value="PENDING">Pending Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center">
            <div class="p-2 bg-yellow-500 rounded-md">
              <i class="fas fa-calendar text-white"></i>
            </div>
            <div class="ml-4">
              <h3 class="font-semibold text-gray-900">Pending Requests</h3>
              <p class="text-2xl font-bold text-yellow-600">{{ pendingCount }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center">
            <div class="p-2 bg-green-500 rounded-md">
              <i class="fas fa-check text-white"></i>
            </div>
            <div class="ml-4">
              <h3 class="font-semibold text-gray-900">Approved</h3>
              <p class="text-2xl font-bold text-green-600">{{ approvedCount }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center">
            <div class="p-2 bg-red-500 rounded-md">
              <i class="fas fa-times text-white"></i>
            </div>
            <div class="ml-4">
              <h3 class="font-semibold text-gray-900">Rejected</h3>
              <p class="text-2xl font-bold text-red-600">{{ rejectedCount }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Time Off Requests Table -->
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dates
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reason
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
            <tr v-for="request in filteredRequests" :key="request.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span class="text-blue-600 font-medium">
                        {{ request.employee.firstName.charAt(0) + request.employee.lastName.charAt(0) }}
                      </span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ request.employee.firstName }} {{ request.employee.lastName }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ request.employee.email }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(request.startDate) }}
                <span v-if="request.startDate !== request.endDate">
                  - {{ formatDate(request.endDate) }}
                </span>
                <div v-if="request.isHalfDay" class="text-xs text-gray-500">
                  Half day ({{ request.halfDayPeriod }})
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getTypeClass(request.type)" class="px-2 py-1 text-xs rounded-full">
                  {{ formatType(request.type) }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">
                <div class="max-w-xs truncate" :title="request.reason">
                  {{ request.reason || 'No reason provided' }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(request.status)" class="px-2 py-1 text-xs rounded-full">
                  {{ request.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button 
                  @click="viewRequest(request)"
                  class="text-blue-600 hover:text-blue-900"
                  title="View Details"
                >
                  <i class="fas fa-eye"></i>
                </button>
                <button 
                  @click="approveRequest(request)"
                  v-if="request.status === 'PENDING'"
                  class="text-green-600 hover:text-green-900"
                  title="Approve"
                >
                  <i class="fas fa-check"></i>
                </button>
                <button 
                  @click="rejectRequest(request)"
                  v-if="request.status === 'PENDING'"
                  class="text-red-600 hover:text-red-900"
                  title="Reject"
                >
                  <i class="fas fa-times"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="filteredRequests.length === 0" class="text-center py-8">
          <div class="text-gray-500">
            <i class="fas fa-calendar text-4xl mb-4"></i>
            <p class="text-lg">No time off requests found</p>
            <p class="text-sm">{{ statusFilter ? 'Try changing the filter' : 'Requests will appear here when submitted' }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Request Detail Modal -->
    <TimeOffModal 
      :show="showModal" 
      :request="selectedRequest"
      @close="closeModal"
      @approve="handleApproval"
      @reject="handleRejection"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import TimeOffModal from '../../components/admin/TimeOffModal.vue'
import { adminApi } from '../../services/api'

export default {
  name: 'AdminTimeOffView',
  components: {
    TimeOffModal
  },
  setup() {
    const requests = ref([])
    const loading = ref(false)
    const statusFilter = ref('')
    const showModal = ref(false)
    const selectedRequest = ref(null)

    const filteredRequests = computed(() => {
      if (!statusFilter.value) return requests.value
      return requests.value.filter(req => req.status === statusFilter.value)
    })

    const pendingCount = computed(() => 
      requests.value.filter(req => req.status === 'PENDING').length
    )

    const approvedCount = computed(() => 
      requests.value.filter(req => req.status === 'APPROVED').length
    )

    const rejectedCount = computed(() => 
      requests.value.filter(req => req.status === 'REJECTED').length
    )

    const loadRequests = async () => {
      try {
        loading.value = true
        const response = await adminApi.getAllTimeOffRequests()
        requests.value = response.data.data
      } catch (error) {
        console.error('Failed to load time off requests:', error)
      } finally {
        loading.value = false
      }
    }

    const viewRequest = (request) => {
      selectedRequest.value = request
      showModal.value = true
    }

    const closeModal = () => {
      showModal.value = false
      selectedRequest.value = null
    }

    const approveRequest = async (request) => {
      if (confirm(`Approve time off request for ${request.employee.firstName} ${request.employee.lastName}?`)) {
        try {
          await adminApi.approveTimeOffRequest(request.id, { comments: 'Approved by administrator' })
          await loadRequests()
        } catch (error) {
          console.error('Failed to approve request:', error)
          alert('Failed to approve request')
        }
      }
    }

    const rejectRequest = async (request) => {
      const reason = prompt(`Reject time off request for ${request.employee.firstName} ${request.employee.lastName}?\n\nReason for rejection:`)
      if (reason !== null) {
        try {
          await adminApi.rejectTimeOffRequest(request.id, { comments: reason || 'Rejected by administrator' })
          await loadRequests()
        } catch (error) {
          console.error('Failed to reject request:', error)
          alert('Failed to reject request')
        }
      }
    }

    const handleApproval = async (request, comments) => {
      try {
        await adminApi.approveTimeOffRequest(request.id, { comments })
        await loadRequests()
        closeModal()
      } catch (error) {
        console.error('Failed to approve request:', error)
      }
    }

    const handleRejection = async (request, comments) => {
      try {
        await adminApi.rejectTimeOffRequest(request.id, { comments })
        await loadRequests()
        closeModal()
      } catch (error) {
        console.error('Failed to reject request:', error)
      }
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString()
    }

    const formatType = (type) => {
      return type.replace(/_/g, ' ').split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ')
    }

    const getStatusClass = (status) => {
      const classes = {
        'PENDING': 'bg-yellow-100 text-yellow-800',
        'APPROVED': 'bg-green-100 text-green-800',
        'REJECTED': 'bg-red-100 text-red-800'
      }
      return classes[status] || 'bg-gray-100 text-gray-800'
    }

    const getTypeClass = (type) => {
      const classes = {
        'VACATION': 'bg-blue-100 text-blue-800',
        'SICK': 'bg-red-100 text-red-800',
        'PERSONAL': 'bg-purple-100 text-purple-800',
        'BEREAVEMENT': 'bg-gray-100 text-gray-800',
        'JURY_DUTY': 'bg-indigo-100 text-indigo-800',
        'MATERNITY': 'bg-pink-100 text-pink-800',
        'PATERNITY': 'bg-pink-100 text-pink-800',
        'UNPAID': 'bg-orange-100 text-orange-800'
      }
      return classes[type] || 'bg-gray-100 text-gray-800'
    }

    onMounted(() => {
      loadRequests()
    })

    return {
      requests,
      loading,
      statusFilter,
      filteredRequests,
      pendingCount,
      approvedCount,
      rejectedCount,
      showModal,
      selectedRequest,
      viewRequest,
      closeModal,
      approveRequest,
      rejectRequest,
      handleApproval,
      handleRejection,
      formatDate,
      formatType,
      getStatusClass,
      getTypeClass
    }
  }
}
</script>
