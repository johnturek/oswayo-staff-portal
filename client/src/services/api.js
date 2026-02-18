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

// Admin API
export const adminApi = {
  // User Management
  getUsers: (params) => api.get('/admin/users', { params }),
  getManagers: () => api.get('/admin/managers'),
  createUser: (userData) => api.post('/admin/users', userData),
  updateUser: (id, userData) => api.put(`/admin/users/${id}`, userData),
  resetPassword: (id) => api.post(`/admin/users/${id}/reset-password`),
  
  // Time Card Management
  getUserTimeCards: (userId, params) => api.get(`/admin/users/${userId}/timecards`, { params }),
  deleteTimeCard: (id) => api.delete(`/admin/timecards/${id}`),
  
  // Time Off Management
  getAllTimeOffRequests: (params) => api.get('/admin/timeoff-requests', { params }),
  overrideTimeOffApproval: (id, action, comments) => api.post(`/admin/timeoff-requests/${id}/override-approval`, { action, comments }),
  
  // System Stats
  getStats: () => api.get('/admin/stats')
}

export default api
