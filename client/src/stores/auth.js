import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const user = ref(null)
  const token = ref(null)
  const isInitialized = ref(false)

  const login = async (email, password) => {
    // Mock login - replace with real API call
    if (email === 'admin@oswayo.com' && password === 'Admin123!') {
      isAuthenticated.value = true
      user.value = {
        id: 1,
        email: 'admin@oswayo.com',
        name: 'Administrator',
        role: 'ADMIN'
      }
      token.value = 'mock-jwt-token'
      
      // Store in localStorage
      localStorage.setItem('authToken', token.value)
      localStorage.setItem('user', JSON.stringify(user.value))
      
      return user.value
    } else {
      throw new Error('Invalid credentials')
    }
  }

  const logout = () => {
    isAuthenticated.value = false
    user.value = null
    token.value = null
    
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
  }

  const initializeAuth = async () => {
    const storedToken = localStorage.getItem('authToken')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken && storedUser) {
      token.value = storedToken
      user.value = JSON.parse(storedUser)
      isAuthenticated.value = true
    }
    
    isInitialized.value = true
  }

  return {
    isAuthenticated,
    user,
    token,
    isInitialized,
    login,
    logout,
    initializeAuth
  }
})