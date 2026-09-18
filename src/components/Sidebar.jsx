import { NavLink } from 'react-router-dom'
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

export default function Sidebar({ open }) {
  const { isAdmin } = useAuth()
  const links = isAdmin ? ADMIN_LINKS : EMPLOYEE_LINKS

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-brand">
        {/* <span className="brand-mark"><img src="./logo.jpeg"></img></span> */}
        <img src="/logo1.png" alt="Senela International Logo" className="sidebar-logo"/>
        <span className="brand-text">{isAdmin ? 'Senela Int Prt Ltd' : 'Senela International Pvt Ltd'}</span>
      </div>
      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}
          >
            <span className="sidebar-icon">{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
