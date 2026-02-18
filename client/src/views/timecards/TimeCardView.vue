<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="bg-white shadow rounded-lg p-6 mb-6">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Current Time Card</h1>
            <p class="text-gray-600">
              Pay Period: {{ formatDate(timeCard?.periodStart) }} - {{ formatDate(timeCard?.periodEnd) }}
            </p>
          </div>
          <div class="flex items-center space-x-4">
            <div class="text-right">
              <div class="text-sm text-gray-500">Total Hours</div>
              <div class="text-2xl font-bold text-blue-600">{{ timeCard?.totalHours || 0 }}</div>
            </div>
            <span :class="getStatusBadgeClass(timeCard?.status)" class="px-3 py-1 rounded-full text-sm font-medium">
              {{ formatStatus(timeCard?.status) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Time Entries -->
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">Time Entries</h2>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time In
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time Out  
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Break (min)
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hours
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="entry in timeCard?.timeEntries" :key="entry.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ formatDate(entry.date) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <input 
                    v-if="editingEntry === entry.id"
                    v-model="editForm.timeIn"
                    type="time"
                    class="border border-gray-300 rounded px-2 py-1 text-sm"
                    :disabled="timeCard?.status !== 'DRAFT'"
                  >
                  <span v-else>{{ formatTime(entry.timeIn) }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <input 
                    v-if="editingEntry === entry.id"
                    v-model="editForm.timeOut"
                    type="time"
                    class="border border-gray-300 rounded px-2 py-1 text-sm"
                    :disabled="timeCard?.status !== 'DRAFT'"
                  >
                  <span v-else>{{ formatTime(entry.timeOut) }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <input 
                    v-if="editingEntry === entry.id"
                    v-model="editForm.breakTime"
                    type="number"
                    min="0"
                    max="480"
                    class="border border-gray-300 rounded px-2 py-1 text-sm w-20"
                    :disabled="timeCard?.status !== 'DRAFT'"
                  >
                  <span v-else>{{ entry.breakTime || 0 }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                  {{ entry.hours.toFixed(2) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <select 
                    v-if="editingEntry === entry.id"
                    v-model="editForm.dayType"
                    class="border border-gray-300 rounded px-2 py-1 text-sm"
                    :disabled="timeCard?.status !== 'DRAFT'"
                  >
                    <option value="REGULAR">Regular</option>
                    <option value="SICK">Sick</option>
                    <option value="VACATION">Vacation</option>
                    <option value="PERSONAL">Personal</option>
                    <option value="HOLIDAY">Holiday</option>
                  </select>
                  <span v-else :class="getDayTypeBadgeClass(entry.dayType)" class="px-2 py-1 text-xs rounded-full">
                    {{ formatDayType(entry.dayType) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div v-if="timeCard?.status === 'DRAFT'" class="flex space-x-2">
                    <button 
                      v-if="editingEntry !== entry.id"
                      @click="startEditing(entry)"
                      class="text-blue-600 hover:text-blue-900"
                      title="Edit"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <template v-else>
                      <button 
                        @click="saveEntry(entry.id)"
                        class="text-green-600 hover:text-green-900"
                        title="Save"
                      >
                        <i class="fas fa-check"></i>
                      </button>
                      <button 
                        @click="cancelEditing"
                        class="text-red-600 hover:text-red-900"
                        title="Cancel"
                      >
                        <i class="fas fa-times"></i>
                      </button>
                    </template>
                  </div>
                  <span v-else class="text-gray-400">
                    <i class="fas fa-lock" title="Time card submitted"></i>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Actions -->
      <div class="mt-6 flex justify-between">
        <div>
          <button 
            v-if="timeCard?.status === 'DRAFT'"
            @click="addNewEntry"
            class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
          >
            <i class="fas fa-plus mr-2"></i>
            Add Entry
          </button>
        </div>
        
        <div class="space-x-4">
          <button 
            v-if="timeCard?.status === 'DRAFT'"
            @click="submitTimeCard"
            :disabled="!canSubmit"
            class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Time Card
          </button>
          
          <span v-if="timeCard?.status === 'SUBMITTED'" class="text-yellow-600 font-medium">
            <i class="fas fa-clock mr-2"></i>
            Awaiting Approval
          </span>
          
          <span v-if="timeCard?.status === 'APPROVED'" class="text-green-600 font-medium">
            <i class="fas fa-check-circle mr-2"></i>
            Approved
          </span>
          
          <span v-if="timeCard?.status === 'REJECTED'" class="text-red-600 font-medium">
            <i class="fas fa-times-circle mr-2"></i>
            Rejected
          </span>
        </div>
      </div>

      <!-- Comments (if rejected) -->
      <div v-if="timeCard?.status === 'REJECTED' && timeCard?.comments" class="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
        <div class="flex">
          <i class="fas fa-exclamation-triangle text-red-400 mt-1"></i>
          <div class="ml-3">
            <h4 class="text-sm font-medium text-red-800">Rejection Reason</h4>
            <p class="text-sm text-red-700 mt-1">{{ timeCard.comments }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Entry Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <h3 class="text-lg font-semibold mb-4">Add Time Entry</h3>
        <form @submit.prevent="saveNewEntry">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input v-model="newEntry.date" type="date" required class="w-full border border-gray-300 rounded-md px-3 py-2">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Time In</label>
              <input v-model="newEntry.timeIn" type="time" class="w-full border border-gray-300 rounded-md px-3 py-2">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Time Out</label>
              <input v-model="newEntry.timeOut" type="time" class="w-full border border-gray-300 rounded-md px-3 py-2">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Break Time (minutes)</label>
              <input v-model="newEntry.breakTime" type="number" min="0" max="480" class="w-full border border-gray-300 rounded-md px-3 py-2">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Day Type</label>
              <select v-model="newEntry.dayType" class="w-full border border-gray-300 rounded-md px-3 py-2">
                <option value="REGULAR">Regular</option>
                <option value="SICK">Sick</option>
                <option value="VACATION">Vacation</option>
                <option value="PERSONAL">Personal</option>
                <option value="HOLIDAY">Holiday</option>
              </select>
            </div>
          </div>
          <div class="mt-6 flex justify-end space-x-3">
            <button type="button" @click="showAddModal = false" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Add Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { timeCardApi } from '../../services/api'
import moment from 'moment'

export default {
  name: 'TimeCardView',
  setup() {
    const timeCard = ref(null)
    const loading = ref(false)
    const editingEntry = ref(null)
    const showAddModal = ref(false)
    
    const editForm = ref({
      timeIn: '',
      timeOut: '',
      breakTime: 0,
      dayType: 'REGULAR'
    })

    const newEntry = ref({
      date: '',
      timeIn: '',
      timeOut: '',
      breakTime: 0,
      dayType: 'REGULAR'
    })

    const canSubmit = computed(() => {
      return timeCard.value?.timeEntries?.length > 0 && timeCard.value?.status === 'DRAFT'
    })

    const loadTimeCard = async () => {
      try {
        loading.value = true
        const response = await timeCardApi.getCurrent()
        timeCard.value = response.data.timeCard
      } catch (error) {
        console.error('Failed to load time card:', error)
      } finally {
        loading.value = false
      }
    }

    const startEditing = (entry) => {
      editingEntry.value = entry.id
      editForm.value = {
        timeIn: entry.timeIn ? moment(entry.timeIn).format('HH:mm') : '',
        timeOut: entry.timeOut ? moment(entry.timeOut).format('HH:mm') : '',
        breakTime: entry.breakTime || 0,
        dayType: entry.dayType || 'REGULAR'
      }
    }

    const cancelEditing = () => {
      editingEntry.value = null
      editForm.value = { timeIn: '', timeOut: '', breakTime: 0, dayType: 'REGULAR' }
    }

    const saveEntry = async (entryId) => {
      try {
        const updateData = {
          ...editForm.value,
          timeIn: editForm.value.timeIn ? moment().format('YYYY-MM-DD') + 'T' + editForm.value.timeIn : null,
          timeOut: editForm.value.timeOut ? moment().format('YYYY-MM-DD') + 'T' + editForm.value.timeOut : null
        }

        await timeCardApi.updateEntry(entryId, updateData)
        cancelEditing()
        await loadTimeCard()
      } catch (error) {
        console.error('Failed to save entry:', error)
      }
    }

    const addNewEntry = () => {
      newEntry.value = {
        date: moment().format('YYYY-MM-DD'),
        timeIn: '08:00',
        timeOut: '16:00', 
        breakTime: 30,
        dayType: 'REGULAR'
      }
      showAddModal.value = true
    }

    const saveNewEntry = async () => {
      try {
        const entryData = {
          ...newEntry.value,
          timeIn: newEntry.value.timeIn ? newEntry.value.date + 'T' + newEntry.value.timeIn : null,
          timeOut: newEntry.value.timeOut ? newEntry.value.date + 'T' + newEntry.value.timeOut : null
        }

        await timeCardApi.addEntry(entryData)
        showAddModal.value = false
        await loadTimeCard()
      } catch (error) {
        console.error('Failed to add entry:', error)
      }
    }

    const submitTimeCard = async () => {
      if (confirm('Submit time card for approval? You will not be able to make changes after submission.')) {
        try {
          await timeCardApi.submit(timeCard.value.id)
          await loadTimeCard()
        } catch (error) {
          console.error('Failed to submit time card:', error)
        }
      }
    }

    // Utility methods
    const formatDate = (date) => {
      return date ? moment(date).format('MM/DD/YYYY') : ''
    }

    const formatTime = (time) => {
      return time ? moment(time).format('HH:mm') : '-'
    }

    const formatStatus = (status) => {
      return status ? status.replace('_', ' ') : ''
    }

    const formatDayType = (type) => {
      return type ? type.replace('_', ' ') : 'Regular'
    }

    const getStatusBadgeClass = (status) => {
      const classes = {
        'DRAFT': 'bg-gray-100 text-gray-800',
        'SUBMITTED': 'bg-yellow-100 text-yellow-800',
        'APPROVED': 'bg-green-100 text-green-800',
        'REJECTED': 'bg-red-100 text-red-800'
      }
      return classes[status] || 'bg-gray-100 text-gray-800'
    }

    const getDayTypeBadgeClass = (type) => {
      const classes = {
        'REGULAR': 'bg-blue-100 text-blue-800',
        'SICK': 'bg-red-100 text-red-800',
        'VACATION': 'bg-green-100 text-green-800',
        'PERSONAL': 'bg-purple-100 text-purple-800',
        'HOLIDAY': 'bg-yellow-100 text-yellow-800'
      }
      return classes[type] || 'bg-gray-100 text-gray-800'
    }

    onMounted(() => {
      loadTimeCard()
    })

    return {
      timeCard,
      loading,
      editingEntry,
      showAddModal,
      editForm,
      newEntry,
      canSubmit,
      startEditing,
      cancelEditing,
      saveEntry,
      addNewEntry,
      saveNewEntry,
      submitTimeCard,
      formatDate,
      formatTime,
      formatStatus,
      formatDayType,
      getStatusBadgeClass,
      getDayTypeBadgeClass
    }
  }
}
</script>
