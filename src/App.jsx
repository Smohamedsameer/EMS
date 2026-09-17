import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import ProtectedRoute from './routes/ProtectedRoute.jsx'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'

import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import Employees from './pages/admin/Employees.jsx'
import EmployeeDetail from './pages/admin/EmployeeDetail.jsx'
import Attendance from './pages/admin/Attendance.jsx'
import Tasks from './pages/admin/Tasks.jsx'
import LeaveManagement from './pages/admin/LeaveManagement.jsx'
import Reports from './pages/admin/Reports.jsx'

import EmployeeDashboard from './pages/employee/EmployeeDashboard.jsx'
import MyAttendance from './pages/employee/MyAttendance.jsx'
import MyTasks from './pages/employee/MyTasks.jsx'
import Leave from './pages/employee/Leave.jsx'
import Profile from './pages/employee/Profile.jsx'

import './App.css'

function withLayout(element) {
  return <Layout>{element}</Layout>
}

export default function App() {
  const { isAuthenticated, user } = useAuth()

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to={user?.role === 'ADMIN' ? '/admin/dashboard' : '/employee/dashboard'} replace />
          ) : (
            <Login />
          )
        }
      />

      {/* ---------------- Admin ---------------- */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRole="ADMIN">{withLayout(<AdminDashboard />)}</ProtectedRoute>
        }
      />
      <Route
        path="/admin/employees"
        element={<ProtectedRoute allowedRole="ADMIN">{withLayout(<Employees />)}</ProtectedRoute>}
      />
      <Route
        path="/admin/employees/:id"
        element={<ProtectedRoute allowedRole="ADMIN">{withLayout(<EmployeeDetail />)}</ProtectedRoute>}
      />
      <Route
        path="/admin/attendance"
        element={<ProtectedRoute allowedRole="ADMIN">{withLayout(<Attendance />)}</ProtectedRoute>}
      />
      <Route
        path="/admin/tasks"
        element={<ProtectedRoute allowedRole="ADMIN">{withLayout(<Tasks />)}</ProtectedRoute>}
      />
      <Route
        path="/admin/leaves"
        element={<ProtectedRoute allowedRole="ADMIN">{withLayout(<LeaveManagement />)}</ProtectedRoute>}
      />
      <Route
        path="/admin/reports"
        element={<ProtectedRoute allowedRole="ADMIN">{withLayout(<Reports />)}</ProtectedRoute>}
      />

      {/* ---------------- Employee ---------------- */}
      <Route
        path="/employee/dashboard"
        element={<ProtectedRoute allowedRole="EMPLOYEE">{withLayout(<EmployeeDashboard />)}</ProtectedRoute>}
      />
      <Route
        path="/employee/attendance"
        element={<ProtectedRoute allowedRole="EMPLOYEE">{withLayout(<MyAttendance />)}</ProtectedRoute>}
      />
      <Route
        path="/employee/tasks"
        element={<ProtectedRoute allowedRole="EMPLOYEE">{withLayout(<MyTasks />)}</ProtectedRoute>}
      />
      <Route
        path="/employee/leave"
        element={<ProtectedRoute allowedRole="EMPLOYEE">{withLayout(<Leave />)}</ProtectedRoute>}
      />
      <Route
        path="/employee/profile"
        element={<ProtectedRoute allowedRole="EMPLOYEE">{withLayout(<Profile />)}</ProtectedRoute>}
      />

      <Route
        path="/"
        element={
          <Navigate to={isAuthenticated ? (user?.role === 'ADMIN' ? '/admin/dashboard' : '/employee/dashboard') : '/login'} replace />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
