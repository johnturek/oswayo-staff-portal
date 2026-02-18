<template>
  <div v-if="show" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <!-- Header -->
        <div class="flex items-center justify-between pb-4 border-b">
          <h3 class="text-lg font-semibold text-gray-900">
            Time Off Request - {{ request?.employee?.firstName }} {{ request?.employee?.lastName }}
          </h3>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div v-if="request" class="mt-6">
          <!-- Employee Info -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-900 mb-2">Employee</h4>
              <p class="text-sm text-gray-700">{{ request.employee.firstName }} {{ request.employee.lastName }}</p>
              <p class="text-sm text-gray-500">{{ request.employee.email }}</p>
              <p class="text-sm text-gray-500">{{ request.employee.department }}</p>
            </div>
            
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-900 mb-2">Request Details</h4>
              <p class="text-sm text-gray-700">Type: {{ formatType(request.type) }}</p>
              <p class="text-sm text-gray-500">Submitted: {{ formatDateTime(request.createdAt) }}</p>
            </div>
          </div>

          <!-- Request Details -->
          <div class="mb-6">
            <h4 class="font-medium text-gray-900 mb-4">Time Off Details</h4>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Start Date</label>
                <p class="text-sm text-gray-900">{{ formatDate(request.startDate) }}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">End Date</label>
                <p class="text-sm text-gray-900">{{ formatDate(request.endDate) }}</p>
              </div>
            </div>

            <div v-if="request.isHalfDay" class="mb-4">
              <label class="block text-sm font-medium text-gray-700">Half Day Period</label>
              <p class="text-sm text-gray-900">{{ request.halfDayPeriod }}</p>
            </div>

            <div v-if="request.reason" class="mb-4">
              <label class="block text-sm font-medium text-gray-700">Reason</label>
              <p class="text-sm text-gray-900 bg-gray-50 p-3 rounded">{{ request.reason }}</p>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700">Duration</label>
              <p class="text-sm text-gray-900">{{ calculateDuration() }} day(s)</p>
            </div>
          </div>

          <!-- Current Status -->
          <div class="mb-6">
            <h4 class="font-medium text-gray-900 mb-2">Status</h4>
            <span :class="getStatusClass(request.status)" class="px-3 py-1 rounded-full text-sm">
              {{ request.status }}
            </span>
            <div v-if="request.approvedBy" class="mt-2 text-sm text-gray-600">
              {{ request.status === 'APPROVED' ? 'Approved' : 'Rejected' }} by: {{ getApproverName(request.approvedBy) }}
              <br>
              Date: {{ formatDateTime(request.approvedAt) }}
              <div v-if="request.comments" class="mt-1">
                Comments: {{ request.comments }}
              </div>
            </div>
          </div>

          <!-- Action Form -->
          <div v-if="request.status === 'PENDING'" class="border-t pt-6">
            <h4 class="font-medium text-gray-900 mb-4">Review Action</h4>
            
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Comments</label>
              <textarea
                v-model="reviewComments"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Optional comments about this request..."
              ></textarea>
            </div>

            <div class="flex space-x-3">
              <button
                @click="handleApprove"
                class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
              >
                <i class="fas fa-check mr-2"></i>
                Approve Request
              </button>
              <button
                @click="handleReject"
                class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center"
              >
                <i class="fas fa-times mr-2"></i>
                Reject Request
              </button>
            </div>
          </div>

          <!-- Close Button -->
          <div class="mt-8 flex justify-end pt-6 border-t">
            <button
              @click="$emit('close')"
              class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'TimeOffModal',
  props: {
    show: Boolean,
    request: Object
  },
  emits: ['close', 'approve', 'reject'],
  setup(props, { emit }) {
    const reviewComments = ref('')

    const handleApprove = () => {
      emit('approve', props.request, reviewComments.value)
      reviewComments.value = ''
    }

    const handleReject = () => {
      if (!reviewComments.value.trim()) {
        alert('Please provide a reason for rejection')
        return
      }
      emit('reject', props.request, reviewComments.value)
      reviewComments.value = ''
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString()
    }

    const formatDateTime = (dateString) => {
      return new Date(dateString).toLocaleString()
    }

    const formatType = (type) => {
      return type.replace(/_/g, ' ').split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ')
    }

    const calculateDuration = () => {
      if (!props.request) return 0
      
      const start = new Date(props.request.startDate)
      const end = new Date(props.request.endDate)
      const diffTime = Math.abs(end - start)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
      
      return props.request.isHalfDay ? 0.5 : diffDays
    }

    const getStatusClass = (status) => {
      const classes = {
        'PENDING': 'bg-yellow-100 text-yellow-800',
        'APPROVED': 'bg-green-100 text-green-800',
        'REJECTED': 'bg-red-100 text-red-800'
      }
      return classes[status] || 'bg-gray-100 text-gray-800'
    }

    const getApproverName = (approverId) => {
      // This would ideally lookup the approver's name
      return 'Administrator'
    }

    return {
      reviewComments,
      handleApprove,
      handleReject,
      formatDate,
      formatDateTime,
      formatType,
      calculateDuration,
      getStatusClass,
      getApproverName
    }
  }
}
</script>
