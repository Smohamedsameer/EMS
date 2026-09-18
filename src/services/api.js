import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'ems-backend-production-f681.up.railway.app/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
})

// Attach the JWT (if present) to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ems_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Centralised handling for expired/invalid tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('ems_token')
      localStorage.removeItem('ems_user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export const getErrorMessage = (error) => {
  if (error.response && error.response.data) {
    if (error.response.data.fieldErrors) {
      const first = Object.values(error.response.data.fieldErrors)[0]
      if (first) return first
    }
    if (error.response.data.message) return error.response.data.message
  }
  return error.message || 'Something went wrong. Please try again.'
}

// ---------------- Auth ----------------
export const authApi = {
  login: (usernameOrEmail, password) =>
    api.post('/auth/login', { usernameOrEmail, password }).then((r) => r.data)
}

// ---------------- Employees ----------------
export const employeeApi = {
  getAll: (params) => api.get('/employees', { params }).then((r) => r.data),
  getById: (id) => api.get(`/employees/${id}`).then((r) => r.data),
  getDetails: (id) => api.get(`/employees/${id}/details`).then((r) => r.data),
  create: (payload) => api.post('/employees', payload).then((r) => r.data),
  update: (id, payload) => api.put(`/employees/${id}`, payload).then((r) => r.data),
  deactivate: (id) => api.delete(`/employees/${id}`).then((r) => r.data)
}

// ---------------- Attendance ----------------
export const attendanceApi = {
  checkIn: () => api.post('/attendance/check-in').then((r) => r.data),
  checkOut: () => api.post('/attendance/check-out').then((r) => r.data),
  today: () => api.get('/attendance/today').then((r) => r.data),
  myHistory: () => api.get('/attendance/my-history').then((r) => r.data),
  search: (params) => api.get('/attendance', { params }).then((r) => r.data),
  byEmployee: (employeeId) => api.get(`/attendance/employee/${employeeId}`).then((r) => r.data),
  correct: (id, payload) => api.put(`/attendance/${id}/correct`, payload).then((r) => r.data)
}

// ---------------- Tasks ----------------
export const taskApi = {
  getAll: (params) => api.get('/tasks', { params }).then((r) => r.data),
  myTasks: () => api.get('/tasks/my-tasks').then((r) => r.data),
  getById: (id) => api.get(`/tasks/${id}`).then((r) => r.data),
  history: (id) => api.get(`/tasks/${id}/updates`).then((r) => r.data),
  create: (payload) => api.post('/tasks', payload).then((r) => r.data),
  update: (id, payload) => api.put(`/tasks/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/tasks/${id}`).then((r) => r.data),
  updateStatus: (id, payload) => api.put(`/tasks/${id}/status`, payload).then((r) => r.data),
  addUpdate: (id, payload) => api.post(`/tasks/${id}/updates`, payload).then((r) => r.data)
}

// ---------------- Leaves ----------------
export const leaveApi = {
  apply: (payload) => api.post('/leaves', payload).then((r) => r.data),
  myLeaves: () => api.get('/leaves/my-leaves').then((r) => r.data),
  getAll: () => api.get('/leaves').then((r) => r.data),
  approve: (id, adminComment) => api.put(`/leaves/${id}/approve`, { adminComment }).then((r) => r.data),
  reject: (id, adminComment) => api.put(`/leaves/${id}/reject`, { adminComment }).then((r) => r.data)
}

// ---------------- Dashboard ----------------
export const dashboardApi = {
  admin: () => api.get('/dashboard/admin').then((r) => r.data),
  employee: () => api.get('/dashboard/employee').then((r) => r.data)
}

// ---------------- Notifications ----------------
export const notificationApi = {
  getAll: () => api.get('/notifications').then((r) => r.data),
  unreadCount: () => api.get('/notifications/unread-count').then((r) => r.data),
  markRead: (id) => api.put(`/notifications/${id}/read`).then((r) => r.data)
}

export default api
