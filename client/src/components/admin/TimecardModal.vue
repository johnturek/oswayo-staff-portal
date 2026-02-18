<template>
  <div v-if="show" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <!-- Header -->
        <div class="flex items-center justify-between pb-4 border-b">
          <h3 class="text-lg font-semibold text-gray-900">
            Timecard Details - {{ timecard?.employee?.firstName }} {{ timecard?.employee?.lastName }}
          </h3>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div v-if="timecard" class="mt-6">
          <!-- Employee Info -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-900 mb-2">Employee</h4>
              <p class="text-sm text-gray-700">{{ timecard.employee.firstName }} {{ timecard.employee.lastName }}</p>
              <p class="text-sm text-gray-500">{{ timecard.employee.email }}</p>
              <p class="text-sm text-gray-500">ID: {{ timecard.employee.employeeId }}</p>
            </div>
            
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-900 mb-2">Pay Period</h4>
              <p class="text-sm text-gray-700">{{ formatDate(timecard.periodStart) }}</p>
              <p class="text-sm text-gray-500">to {{ formatDate(timecard.periodEnd) }}</p>
            </div>
            
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-900 mb-2">Summary</h4>
              <p class="text-lg font-semibold text-gray-900">{{ timecard.totalHours }} hours</p>
              <p class="text-sm text-gray-500">Submitted: {{ formatDateTime(timecard.submittedAt) }}</p>
            </div>
          </div>

          <!-- Time Entries -->
          <div class="mb-6">
            <h4 class="font-medium text-gray-900 mb-4">Time Entries</h4>
            <div class="bg-white border rounded-lg overflow-hidden">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time In</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time Out</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr v-for="entry in timecard.entries" :key="entry.date" class="hover:bg-gray-50">
                    <td class="px-4 py-3 text-sm text-gray-900">{{ formatDate(entry.date) }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">{{ entry.timeIn }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">{{ entry.timeOut }}</td>
                    <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ entry.hours }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Current Status -->
          <div class="mb-6">
            <h4 class="font-medium text-gray-900 mb-2">Status</h4>
            <span :class="getStatusClass(timecard.status)" class="px-3 py-1 rounded-full text-sm">
              {{ timecard.status }}
            </span>
            <div v-if="timecard.approvedBy" class="mt-2 text-sm text-gray-600">
              {{ timecard.status === 'APPROVED' ? 'Approved' : 'Rejected' }} by: {{ getApproverName(timecard.approvedBy) }}
              <br>
              Date: {{ formatDateTime(timecard.approvedAt) }}
              <div v-if="timecard.comments" class="mt-1">
                Comments: {{ timecard.comments }}
              </div>
            </div>
          </div>

          <!-- Action Form -->
          <div v-if="timecard.status === 'SUBMITTED'" class="border-t pt-6">
            <h4 class="font-medium text-gray-900 mb-4">Review Action</h4>
            
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Comments</label>
              <textarea
                v-model="reviewComments"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Optional comments about this timecard..."
              ></textarea>
            </div>

            <div class="flex space-x-3">
              <button
                @click="handleApprove"
                class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
              >
                <i class="fas fa-check mr-2"></i>
                Approve Timecard
              </button>
              <button
                @click="handleReject"
                class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center"
              >
                <i class="fas fa-times mr-2"></i>
                Reject Timecard
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
  name: 'TimecardModal',
  props: {
    show: Boolean,
    timecard: Object
  },
  emits: ['close', 'approve', 'reject'],
  setup(props, { emit }) {
    const reviewComments = ref('')

    const handleApprove = () => {
      emit('approve', props.timecard, reviewComments.value)
      reviewComments.value = ''
    }

    const handleReject = () => {
      if (!reviewComments.value.trim()) {
        alert('Please provide a reason for rejection')
        return
      }
      emit('reject', props.timecard, reviewComments.value)
      reviewComments.value = ''
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
      getStatusClass,
      getApproverName
    }
  }
}
</script>
