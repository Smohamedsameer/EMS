import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const ADMIN_LINKS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/admin/employees', label: 'Employees', icon: '👥' },
  { to: '/admin/attendance', label: 'Attendance', icon: '🕒' },
  { to: '/admin/tasks', label: 'Work Tracking', icon: '📋' },
  { to: '/admin/leaves', label: 'Leave Requests', icon: '🗓️' },
  { to: '/admin/reports', label: 'Reports', icon: '📈' }
]

const EMPLOYEE_LINKS = [
  { to: '/employee/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/employee/attendance', label: 'My Attendance', icon: '🕒' },
  { to: '/employee/tasks', label: 'My Tasks', icon: '📋' },
  { to: '/employee/leave', label: 'Leave', icon: '🗓️' },
  { to: '/employee/profile', label: 'Profile', icon: '👤' }
]

export default function Sidebar({ open, onClose }) {
  const { isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  const links = isAdmin ? ADMIN_LINKS : EMPLOYEE_LINKS

  const handleLogout = () => {
    logout()
    onClose?.()
    navigate('/login')
  }

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>

      {/* Brand */}
      <div className="sidebar-brand">
        <img
          src="/logo1.png"
          alt="Senela International Logo"
          className="sidebar-logo"
        />

        <span className="brand-text">
          Senela International Pvt Ltd
        </span>

        <button
          className="sidebar-close"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          ✕
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={onClose}
            className={({ isActive }) =>
              'sidebar-link' + (isActive ? ' active' : '')
            }
          >
            <span className="sidebar-icon">{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout at bottom */}
      <div className="sidebar-footer">
        <button
          className="sidebar-logout"
          onClick={handleLogout}
        >
          <span className="sidebar-icon">🚪</span>
          <span>Logout</span>
        </button>
      </div>

    </aside>
  )
}