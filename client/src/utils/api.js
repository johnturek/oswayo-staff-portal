import axios from 'axios'

// Create axios instance with default configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add timestamp to prevent caching on mobile
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      }
    }
    
    // Add request ID for debugging
    config.headers['X-Request-ID'] = Math.random().toString(36).substr(2, 9)
    
    return config
  },
  (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log successful requests in development
    if (import.meta.env.DEV) {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}:`, response.status)
    }
    
    return response
  },
  (error) => {
    // Log errors in development
    if (import.meta.env.DEV) {
      console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, error.response?.status, error.response?.data)
    }
    
    // Handle different error types
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout - please check your connection'
    } else if (error.response?.status === 429) {
      error.message = 'Too many requests - please wait a moment'
    } else if (error.response?.status >= 500) {
      error.message = 'Server error - please try again later'
    } else if (!error.response) {
      error.message = 'Network error - please check your connection'
    }
    
    return Promise.reject(error)
  }
)

// API helper functions
export const apiHelpers = {
  // Generic CRUD operations
  async get(endpoint, params = {}, config = {}) {
    const response = await api.get(endpoint, { params, ...config })
    return response.data
  },

  async post(endpoint, data = {}, config = {}) {
    const response = await api.post(endpoint, data, config)
    return response.data
  },

  async put(endpoint, data = {}, config = {}) {
    const response = await api.put(endpoint, data, config)
    return response.data
  },

  async patch(endpoint, data = {}, config = {}) {
    const response = await api.patch(endpoint, data, config)
    return response.data
  },

  async delete(endpoint, config = {}) {
    const response = await api.delete(endpoint, config)
    return response.data
  },

  // File upload helper
  async upload(endpoint, file, onProgress = null, additionalData = {}) {
    const formData = new FormData()
    formData.append('file', file)
    
    // Add additional data
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key])
    })
    
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
    
    if (onProgress) {
      config.onUploadProgress = (progressEvent) => {
        const progress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        )
        onProgress(progress)
      }
    }
    
    const response = await api.post(endpoint, formData, config)
    return response.data
  },

  // Pagination helper
  async paginate(endpoint, page = 1, limit = 20, filters = {}) {
    const params = {
      page,
      limit,
      ...filters
    }
    
    const response = await this.get(endpoint, params)
    return {
      data: response.data || response.items || [],
      pagination: response.pagination || {
        page: response.page || 1,
        limit: response.limit || limit,
        total: response.total || 0,
        totalPages: response.totalPages || Math.ceil((response.total || 0) / limit)
      }
    }
  },

  // Batch operations
  async batch(operations) {
    const results = await Promise.allSettled(operations.map(op => 
      this[op.method](op.endpoint, op.data || op.params, op.config)
    ))
    
    return results.map((result, index) => ({
      operation: operations[index],
      success: result.status === 'fulfilled',
      data: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason : null
    }))
  }
}

// Specific API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  me: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  changePassword: (currentPassword, newPassword) => 
    api.post('/auth/change-password', { currentPassword, newPassword })
}

export const timeCardAPI = {
  getCurrent: () => api.get('/timecards/current'),
  getHistory: (params) => api.get('/timecards', { params }),
  getById: (id) => api.get(`/timecards/${id}`),
  updateEntry: (entryId, data) => api.put(`/timecards/entries/${entryId}`, data),
  addEntry: (data) => api.post('/timecards/entries', data),
  submit: (id) => api.post(`/timecards/${id}/submit`),
  getTeamPending: () => api.get('/timecards/team/pending'),
  review: (id, action, comments) => api.post(`/timecards/${id}/review`, { action, comments })
}

export const timeOffAPI = {
  getRequests: (params) => api.get('/timeoff', { params }),
  create: (data) => api.post('/timeoff', data),
  getById: (id) => api.get(`/timeoff/${id}`),
  cancel: (id) => api.delete(`/timeoff/${id}`),
  getTeamPending: () => api.get('/timeoff/team/pending'),
  review: (id, action, comments) => api.post(`/timeoff/${id}/review`, { action, comments }),
  getTeamCalendar: (params) => api.get('/timeoff/team/calendar', { params })
}

export const calendarAPI = {
  getEvents: (params) => api.get('/calendar', { params }),
  getById: (id) => api.get(`/calendar/${id}`),
  create: (data) => api.post('/calendar', data),
  update: (id, data) => api.put(`/calendar/${id}`, data),
  delete: (id) => api.delete(`/calendar/${id}`),
  bulkCreate: (events) => api.post('/calendar/bulk', { events }),
  getWorkdays: (start, end) => api.get('/calendar/workdays', { params: { start, end } }),
  getSchoolYearTemplate: (year, startMonth, endMonth) => 
    api.post('/calendar/school-year-template', { year, startMonth, endMonth })
}

export const notificationAPI = {
  get: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/mark-all-read'),
  delete: (id) => api.delete(`/notifications/${id}`),
  clearRead: () => api.delete('/notifications/clear-read'),
  createSystem: (data) => api.post('/notifications/system', data)
}

export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  resetPassword: (id, password) => api.post(`/users/${id}/reset-password`, { password }),
  getHierarchy: () => api.get('/users/hierarchy/organization'),
  getManagers: () => api.get('/users/managers/list')
}

// Export default API instance
export default api