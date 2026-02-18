import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))
  const isLoading = ref(false)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  const isAdmin = computed(() => 
    user.value?.role === 'DISTRICT_ADMIN'
  )

  const isPrincipal = computed(() => 
    user.value?.role === 'PRINCIPAL' || user.value?.role === 'DISTRICT_ADMIN'
  )

  const isManager = computed(() => 
    ['MANAGER', 'PRINCIPAL', 'DISTRICT_ADMIN'].includes(user.value?.role)
  )

  const login = async (credentials) => {
    try {
      isLoading.value = true
      const response = await authApi.login(credentials)
      
      if (response.data.success) {
        token.value = response.data.token
        user.value = response.data.user
        
        localStorage.setItem('token', token.value)
        localStorage.setItem('user', JSON.stringify(user.value))
        
        return { success: true }
      }
      
      return { success: false, message: response.data.message }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      }
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const loadUser = async () => {
    if (!token.value) return

    try {
      const response = await authApi.me()
      user.value = response.data.user
      localStorage.setItem('user', JSON.stringify(user.value))
    } catch (error) {
      logout()
    }
  }

  const initializeAuth = () => {
    const storedUser = localStorage.getItem('user')
    if (storedUser && token.value) {
      try {
        user.value = JSON.parse(storedUser)
      } catch (error) {
        logout()
      }
    }
  }

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    isAdmin,
    isPrincipal,
    isManager,
    login,
    logout,
    loadUser,
    initializeAuth
  }
})
