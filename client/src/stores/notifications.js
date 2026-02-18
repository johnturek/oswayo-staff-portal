import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../utils/api'

export const useNotificationStore = defineStore('notifications', () => {
  // State
  const notifications = ref([])
  const globalAlerts = ref([])
  const unreadCount = ref(0)
  const isLoading = ref(false)

  // Getters
  const unreadNotifications = computed(() => 
    notifications.value.filter(n => !n.isRead)
  )

  const recentNotifications = computed(() =>
    notifications.value.slice(0, 5)
  )

  // Actions
  const fetchNotifications = async (page = 1, limit = 20, filters = {}) => {
    isLoading.value = true
    
    try {
      const params = {
        page,
        limit,
        ...filters
      }
      
      const response = await api.get('/notifications', { params })
      const { notifications: notifs, unreadCount: count } = response.data
      
      if (page === 1) {
        notifications.value = notifs
      } else {
        notifications.value.push(...notifs)
      }
      
      unreadCount.value = count
      
      return response.data
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/notifications/unread-count')
      unreadCount.value = response.data.unreadCount
      return response.data.unreadCount
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
      return 0
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`)
      
      // Update local state
      const notification = notifications.value.find(n => n.id === notificationId)
      if (notification) {
        notification.isRead = true
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
      
      return true
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      return false
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await api.patch('/notifications/mark-all-read')
      
      // Update local state
      notifications.value.forEach(notification => {
        notification.isRead = true
      })
      unreadCount.value = 0
      
      return response.data.updatedCount
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
      throw error
    }
  }

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`)
      
      // Remove from local state
      const index = notifications.value.findIndex(n => n.id === notificationId)
      if (index > -1) {
        const notification = notifications.value[index]
        notifications.value.splice(index, 1)
        
        if (!notification.isRead) {
          unreadCount.value = Math.max(0, unreadCount.value - 1)
        }
      }
      
      return true
    } catch (error) {
      console.error('Failed to delete notification:', error)
      return false
    }
  }

  const clearReadNotifications = async () => {
    try {
      const response = await api.delete('/notifications/clear-read')
      
      // Update local state
      notifications.value = notifications.value.filter(n => !n.isRead)
      
      return response.data.deletedCount
    } catch (error) {
      console.error('Failed to clear read notifications:', error)
      throw error
    }
  }

  // Global alert system for temporary messages
  const showAlert = (message, type = 'info', duration = 5000) => {
    const alert = {
      id: Date.now() + Math.random(),
      message,
      type, // 'success', 'error', 'warning', 'info'
      timestamp: new Date(),
      duration
    }
    
    globalAlerts.value.push(alert)
    
    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeAlert(alert.id)
      }, duration)
    }
    
    return alert.id
  }

  const showSuccess = (message, duration = 5000) => {
    return showAlert(message, 'success', duration)
  }

  const showError = (message, duration = 8000) => {
    return showAlert(message, 'error', duration)
  }

  const showWarning = (message, duration = 6000) => {
    return showAlert(message, 'warning', duration)
  }

  const showInfo = (message, duration = 5000) => {
    return showAlert(message, 'info', duration)
  }

  const removeAlert = (alertId) => {
    const index = globalAlerts.value.findIndex(alert => alert.id === alertId)
    if (index > -1) {
      globalAlerts.value.splice(index, 1)
    }
  }

  const clearAllAlerts = () => {
    globalAlerts.value = []
  }

  // Real-time notification handling
  const addNotification = (notification) => {
    notifications.value.unshift(notification)
    if (!notification.isRead) {
      unreadCount.value += 1
    }
    
    // Show as global alert for important notifications
    if (['timecard', 'timeoff'].includes(notification.type)) {
      showInfo(notification.title, 8000)
    }
  }

  // Utility functions for common notification scenarios
  const handleApiError = (error, customMessage = null) => {
    let message = customMessage || 'An error occurred'
    
    if (error.response?.data?.error) {
      message = error.response.data.error
    } else if (error.message) {
      message = error.message
    }
    
    showError(message)
  }

  const handleApiSuccess = (message) => {
    showSuccess(message)
  }

  // Batch operations
  const performBatchOperation = async (operation, items, successMessage, errorMessage) => {
    const results = []
    let successCount = 0
    let errorCount = 0
    
    for (const item of items) {
      try {
        const result = await operation(item)
        results.push({ item, result, success: true })
        successCount++
      } catch (error) {
        results.push({ item, error, success: false })
        errorCount++
      }
    }
    
    if (successCount > 0) {
      showSuccess(`${successMessage} (${successCount}/${items.length})`)
    }
    
    if (errorCount > 0) {
      showError(`${errorMessage} (${errorCount}/${items.length})`)
    }
    
    return results
  }

  return {
    // State
    notifications,
    globalAlerts,
    unreadCount,
    isLoading,
    
    // Getters
    unreadNotifications,
    recentNotifications,
    
    // Actions
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearReadNotifications,
    
    // Global alerts
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeAlert,
    clearAllAlerts,
    
    // Real-time
    addNotification,
    
    // Utilities
    handleApiError,
    handleApiSuccess,
    performBatchOperation
  }
})