import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Layout components
import AppLayout from '../layouts/AppLayout.vue'
import AuthLayout from '../layouts/AuthLayout.vue'

// Auth views
import LoginView from '../views/auth/LoginView.vue'
import ForgotPasswordView from '../views/auth/ForgotPasswordView.vue'
import ResetPasswordView from '../views/auth/ResetPasswordView.vue'

// Main views
import DashboardView from '../views/DashboardView.vue'
import ProfileView from '../views/ProfileView.vue'

// Time card views
import TimeCardView from '../views/timecards/TimeCardView.vue'
import TimeCardHistoryView from '../views/timecards/TimeCardHistoryView.vue'
import TimeCardDetailView from '../views/timecards/TimeCardDetailView.vue'
import TeamTimeCardsView from '../views/timecards/TeamTimeCardsView.vue'

// Time off views
import TimeOffView from '../views/timeoff/TimeOffView.vue'
import TimeOffRequestView from '../views/timeoff/TimeOffRequestView.vue'
import TimeOffHistoryView from '../views/timeoff/TimeOffHistoryView.vue'
import TeamTimeOffView from '../views/timeoff/TeamTimeOffView.vue'
import TimeOffCalendarView from '../views/timeoff/TimeOffCalendarView.vue'

// Calendar views
import CalendarView from '../views/calendar/CalendarView.vue'
import CalendarManageView from '../views/calendar/CalendarManageView.vue'

// Admin views
import AdminUsersView from '../views/admin/AdminUsersView.vue'
import AdminUserDetailView from '../views/admin/AdminUserDetailView.vue'
import AdminTimecardsView from '../views/admin/AdminTimecardsView.vue'
import AdminTimeOffView from '../views/admin/AdminTimeOffView.vue'
import AdminNotificationsView from '../views/admin/AdminNotificationsView.vue'
import AdminSettingsView from '../views/admin/AdminSettingsView.vue'

const routes = [
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        name: 'login',
        component: LoginView,
        meta: { requiresGuest: true, title: 'Login' }
      },
      {
        path: 'forgot-password',
        name: 'forgot-password',
        component: ForgotPasswordView,
        meta: { requiresGuest: true, title: 'Forgot Password' }
      },
      {
        path: 'reset-password',
        name: 'reset-password',
        component: ResetPasswordView,
        meta: { requiresGuest: true, title: 'Reset Password' }
      }
    ]
  },
  {
    path: '/',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: DashboardView,
        meta: { title: 'Dashboard' }
      },
      {
        path: 'profile',
        name: 'profile',
        component: ProfileView,
        meta: { title: 'Profile' }
      },
      // Time card routes
      {
        path: 'timecards',
        children: [
          {
            path: '',
            name: 'timecards',
            component: TimeCardView,
            meta: { title: 'Current Time Card' }
          },
          {
            path: 'history',
            name: 'timecards-history',
            component: TimeCardHistoryView,
            meta: { title: 'Time Card History' }
          },
          {
            path: ':id',
            name: 'timecard-detail',
            component: TimeCardDetailView,
            meta: { title: 'Time Card Details' }
          },
          {
            path: 'team',
            name: 'team-timecards',
            component: TeamTimeCardsView,
            meta: { 
              title: 'Team Time Cards',
              requiresManager: true
            }
          }
        ]
      },
      // Time off routes
      {
        path: 'timeoff',
        children: [
          {
            path: '',
            name: 'timeoff',
            component: TimeOffView,
            meta: { title: 'Time Off Requests' }
          },
          {
            path: 'request',
            name: 'timeoff-request',
            component: TimeOffRequestView,
            meta: { title: 'New Time Off Request' }
          },
          {
            path: 'history',
            name: 'timeoff-history',
            component: TimeOffHistoryView,
            meta: { title: 'Time Off History' }
          },
          {
            path: 'team',
            name: 'team-timeoff',
            component: TeamTimeOffView,
            meta: { 
              title: 'Team Time Off',
              requiresManager: true
            }
          },
          {
            path: 'calendar',
            name: 'timeoff-calendar',
            component: TimeOffCalendarView,
            meta: { 
              title: 'Time Off Calendar',
              requiresManager: true
            }
          }
        ]
      },
      // Calendar routes
      {
        path: 'calendar',
        children: [
          {
            path: '',
            name: 'calendar',
            component: CalendarView,
            meta: { title: 'School Calendar' }
          },
          {
            path: 'manage',
            name: 'calendar-manage',
            component: CalendarManageView,
            meta: { 
              title: 'Manage Calendar',
              requiresAdmin: true
            }
          }
        ]
      },
      // Admin routes
      {
        path: 'admin',
        meta: { requiresAdmin: true },
        children: [
          {
            path: 'users',
            name: 'admin-users',
            component: AdminUsersView,
            meta: { title: 'Manage Users' }
          },
          {
            path: 'users/:id',
            name: 'admin-user-detail',
            component: AdminUserDetailView,
            meta: { title: 'User Details' }
          },
          {
            path: 'timecards',
            name: 'admin-timecards',
            component: AdminTimecardsView,
            meta: { title: 'Manage Timecards' }
          },
          {
            path: 'timeoff',
            name: 'admin-timeoff',
            component: AdminTimeOffView,
            meta: { title: 'Manage Time Off' }
          },
          {
            path: 'notifications',
            name: 'admin-notifications',
            component: AdminNotificationsView,
            meta: { title: 'System Notifications' }
          },
          {
            path: 'settings',
            name: 'admin-settings',
            component: AdminSettingsView,
            meta: { title: 'System Settings' }
          }
        ]
      }
    ]
  },
  // Redirect root to login if not authenticated
  {
    path: '/',
    redirect: to => {
      const authStore = useAuthStore()
      return authStore.isAuthenticated ? { name: 'dashboard' } : { name: 'login' }
    }
  },
  // 404 catch all
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFoundView.vue'),
    meta: { title: 'Page Not Found' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Update page title
  if (to.meta.title) {
    document.title = `${to.meta.title} - Oswayo Staff Portal`
  } else {
    document.title = 'Oswayo Staff Portal'
  }
  
  // Check if we need to initialize auth
  if (!authStore.isInitialized) {
    await authStore.initializeAuth()
  }
  
  // Handle authentication requirements
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }
  
  // Handle guest-only routes (login page when already authenticated)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next({ name: 'dashboard' })
    return
  }
  
  // Handle role-based access
  if (to.meta.requiresAdmin && !['DISTRICT_ADMIN', 'PRINCIPAL'].includes(authStore.user?.role)) {
    next({ name: 'dashboard' })
    return
  }
  
  if (to.meta.requiresManager && 
      !['DISTRICT_ADMIN', 'PRINCIPAL', 'MANAGER'].includes(authStore.user?.role) &&
      !authStore.user?.hasDirectReports) {
    next({ name: 'dashboard' })
    return
  }
  
  next()
})

// Handle authentication errors globally
router.onError((error) => {
  if (error.response?.status === 401) {
    const authStore = useAuthStore()
    authStore.logout()
    router.push({ name: 'login' })
  }
})

export default router