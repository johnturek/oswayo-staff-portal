<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="bg-white shadow rounded-lg p-6 mb-6">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Timecard Management</h1>
            <p class="text-gray-600">Review and approve staff timecards</p>
          </div>
          <div class="flex space-x-3">
            <select v-model="statusFilter" class="border border-gray-300 rounded-md px-3 py-2">
              <option value="">All Status</option>
              <option value="SUBMITTED">Pending Review</option>
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
              <i class="fas fa-clock text-white"></i>
            </div>
            <div class="ml-4">
              <h3 class="font-semibold text-gray-900">Pending Review</h3>
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

      <!-- Timecards Table -->
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pay Period
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Hours
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Submitted
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="timecard in filteredTimecards" :key="timecard.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span class="text-blue-600 font-medium">
                        {{ timecard.employee.firstName.charAt(0) + timecard.employee.lastName.charAt(0) }}
                      </span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ timecard.employee.firstName }} {{ timecard.employee.lastName }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ timecard.employee.email }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(timecard.periodStart) }} - {{ formatDate(timecard.periodEnd) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ timecard.totalHours }} hours
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(timecard.status)" class="px-2 py-1 text-xs rounded-full">
                  {{ timecard.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDateTime(timecard.submittedAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button 
                  @click="viewTimecard(timecard)"
                  class="text-blue-600 hover:text-blue-900"
                  title="View Details"
                >
                  <i class="fas fa-eye"></i>
                </button>
                <button 
                  @click="approveTimecard(timecard)"
                  v-if="timecard.status === 'SUBMITTED'"
                  class="text-green-600 hover:text-green-900"
                  title="Approve"
                >
                  <i class="fas fa-check"></i>
                </button>
                <button 
                  @click="rejectTimecard(timecard)"
                  v-if="timecard.status === 'SUBMITTED'"
                  class="text-red-600 hover:text-red-900"
                  title="Reject"
                >
                  <i class="fas fa-times"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="filteredTimecards.length === 0" class="text-center py-8">
          <div class="text-gray-500">
            <i class="fas fa-clock text-4xl mb-4"></i>
            <p class="text-lg">No timecards found</p>
            <p class="text-sm">{{ statusFilter ? 'Try changing the filter' : 'Timecards will appear here when submitted' }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Timecard Detail Modal -->
    <TimecardModal 
      :show="showModal" 
      :timecard="selectedTimecard"
      @close="closeModal"
      @approve="handleApproval"
      @reject="handleRejection"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import TimecardModal from '../../components/admin/TimecardModal.vue'
import { adminApi } from '../../services/api'

export default {
  name: 'AdminTimecardsView',
  components: {
    TimecardModal
  },
  setup() {
    const timecards = ref([])
    const loading = ref(false)
    const statusFilter = ref('')
    const showModal = ref(false)
    const selectedTimecard = ref(null)

    const filteredTimecards = computed(() => {
      if (!statusFilter.value) return timecards.value
      return timecards.value.filter(tc => tc.status === statusFilter.value)
    })

    const pendingCount = computed(() => 
      timecards.value.filter(tc => tc.status === 'SUBMITTED').length
    )

    const approvedCount = computed(() => 
      timecards.value.filter(tc => tc.status === 'APPROVED').length
    )

    const rejectedCount = computed(() => 
      timecards.value.filter(tc => tc.status === 'REJECTED').length
    )

    const loadTimecards = async () => {
      try {
        loading.value = true
        const response = await adminApi.getTimecards()
        timecards.value = response.data.data
      } catch (error) {
        console.error('Failed to load timecards:', error)
      } finally {
        loading.value = false
      }
    }

    const viewTimecard = (timecard) => {
      selectedTimecard.value = timecard
      showModal.value = true
    }

    const closeModal = () => {
      showModal.value = false
      selectedTimecard.value = null
    }

    const approveTimecard = async (timecard) => {
      if (confirm(`Approve timecard for ${timecard.employee.firstName} ${timecard.employee.lastName}?`)) {
        try {
          await adminApi.approveTimecard(timecard.id, { comments: 'Approved by administrator' })
          await loadTimecards()
        } catch (error) {
          console.error('Failed to approve timecard:', error)
          alert('Failed to approve timecard')
        }
      }
    }

    const rejectTimecard = async (timecard) => {
      const reason = prompt(`Reject timecard for ${timecard.employee.firstName} ${timecard.employee.lastName}?\n\nReason for rejection:`)
      if (reason !== null) {
        try {
          await adminApi.rejectTimecard(timecard.id, { comments: reason || 'Rejected by administrator' })
          await loadTimecards()
        } catch (error) {
          console.error('Failed to reject timecard:', error)
          alert('Failed to reject timecard')
        }
      }
    }

    const handleApproval = async (timecard, comments) => {
      try {
        await adminApi.approveTimecard(timecard.id, { comments })
        await loadTimecards()
        closeModal()
      } catch (error) {
        console.error('Failed to approve timecard:', error)
      }
    }

    const handleRejection = async (timecard, comments) => {
      try {
        await adminApi.rejectTimecard(timecard.id, { comments })
        await loadTimecards()
        closeModal()
      } catch (error) {
        console.error('Failed to reject timecard:', error)
      }
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString()
    }

    const formatDateTime = (dateString) => {
      return new Date(dateString).toLocaleString()
    }

    const getStatusClass = (status) => {
      const classes = {
        'SUBMITTED': 'bg-yellow-100 text-yellow-800',
        'APPROVED': 'bg-green-100 text-green-800',
        'REJECTED': 'bg-red-100 text-red-800',
        'DRAFT': 'bg-gray-100 text-gray-800'
      }
      return classes[status] || 'bg-gray-100 text-gray-800'
    }

    onMounted(() => {
      loadTimecards()
    })

    return {
      timecards,
      loading,
      statusFilter,
      filteredTimecards,
      pendingCount,
      approvedCount,
      rejectedCount,
      showModal,
      selectedTimecard,
      viewTimecard,
      closeModal,
      approveTimecard,
      rejectTimecard,
      handleApproval,
      handleRejection,
      formatDate,
      formatDateTime,
      getStatusClass
    }
  }
}
</script>
