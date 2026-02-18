import axios from 'axios'

// Create axios instance
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/auth/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  refreshToken: () => api.post('/auth/refresh'),
  me: () => api.get('/auth/me'),
  changePassword: (passwords) => api.post('/auth/change-password', passwords)
}

// Time Cards API
export const timeCardApi = {
  getCurrent: () => api.get('/timecards/current'),
  getAll: (params) => api.get('/timecards', { params }),
  getById: (id) => api.get(`/timecards/${id}`),
  submit: (id) => api.post(`/timecards/${id}/submit`),
  addEntry: (entry) => api.post('/timecards/entries', entry),
  updateEntry: (entryId, entry) => api.put(`/timecards/entries/${entryId}`, entry),
  getTeamPending: () => api.get('/timecards/team/pending'),
  review: (id, review) => api.post(`/timecards/${id}/review`, review)
}

// Time Off API
export const timeOffApi = {
  getAll: (params) => api.get('/timeoff', { params }),
  getById: (id) => api.get(`/timeoff/${id}`),
  create: (request) => api.post('/timeoff', request),
  cancel: (id) => api.delete(`/timeoff/${id}`),
  getTeamRequests: () => api.get('/timeoff/team'),
  approve: (id, comments) => api.post(`/timeoff/${id}/approve`, { comments }),
  reject: (id, comments) => api.post(`/timeoff/${id}/reject`, { comments }),
  getCalendar: (params) => api.get('/timeoff/calendar', { params })
}

// Calendar API
export const calendarApi = {
  getEvents: (params) => api.get('/calendar', { params }),
  createEvent: (event) => api.post('/calendar', event),
  updateEvent: (id, event) => api.put(`/calendar/${id}`, event),
  deleteEvent: (id) => api.delete(`/calendar/${id}`)
}

// Notifications API
export const notificationApi = {
  getAll: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`)
}

// Admin API
export const adminApi = {
  // User Management
  getUsers: (params) => api.get('/admin/users', { params }),
  getManagers: () => api.get('/admin/managers'),
  createUser: (userData) => api.post('/admin/users', userData),
  updateUser: (id, userData) => api.put(`/admin/users/${id}`, userData),
  resetPassword: (id) => api.post(`/admin/users/${id}/reset-password`),
  
  // Time Card Management
  getTimecards: (params) => api.get('/admin/timecards', { params }),
  getTimecard: (id) => api.get(`/admin/timecards/${id}`),
  approveTimecard: (id, data) => api.post(`/admin/timecards/${id}/approve`, data),
  rejectTimecard: (id, data) => api.post(`/admin/timecards/${id}/reject`, data),
  getUserTimeCards: (userId, params) => api.get(`/admin/users/${userId}/timecards`, { params }),
  deleteTimeCard: (id) => api.delete(`/admin/timecards/${id}`),
  
  // Time Off Management
  getAllTimeOffRequests: (params) => api.get('/admin/timeoff', { params }),
  approveTimeOffRequest: (id, data) => api.post(`/admin/timeoff/${id}/approve`, data),
  rejectTimeOffRequest: (id, data) => api.post(`/admin/timeoff/${id}/reject`, data),
  overrideTimeOffApproval: (id, action, comments) => api.post(`/admin/timeoff-requests/${id}/override-approval`, { action, comments }),
  
  // System Stats
  getStats: () => api.get('/admin/stats')
}

// Profile API
export const profileApi = {
  get: () => api.get('/profile'),
  update: (profileData) => api.put('/profile', profileData),
  uploadAvatar: (file) => {
    const formData = new FormData()
    formData.append('avatar', file)
    return api.post('/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

export default api
