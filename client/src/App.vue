<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <router-view />
  </div>
</template>

<script>
import { useAuthStore } from './stores/auth'

export default {
  name: 'App',
  setup() {
    const authStore = useAuthStore()
    
    // Initialize auth state from localStorage
    authStore.initializeAuth()
    
    return {}
  }
}
</script>

<style>
/* Global styles specific to the app */
#app {
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Ensure proper mobile viewport behavior */
@supports (-webkit-touch-callout: none) {
  /* iOS specific styles */
  #app {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
  }
  
  input, textarea, select {
    -webkit-user-select: text;
    user-select: text;
  }
}

/* Progressive Web App styles */
@media (display-mode: standalone) {
  #app {
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
  }
}
</style>