import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { notificationApi } from '../services/api.js'

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const wrapperRef = useRef(null)

  const loadUnread = async () => {
    try {
      const data = await notificationApi.unreadCount()
      setUnreadCount(data.unreadCount || 0)
    } catch {
      // silently ignore - notifications are non-critical
    }
  }

  useEffect(() => {
    loadUnread()
    const interval = setInterval(loadUnread, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const openNotifications = async () => {
    setNotifOpen((o) => !o)
    if (!notifOpen) {
      try {
        const data = await notificationApi.getAll()
        setNotifications(data)
      } catch {
        // ignore
      }
    }
  }

  const handleMarkRead = async (id) => {
    try {
      await notificationApi.markRead(id)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
      loadUnread()
    } catch {
      // ignore
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="navbar">
      <button className="hamburger" onClick={onToggleSidebar} aria-label="Toggle menu">
        ☰
      </button>

      <div className="navbar-spacer" />

      <div className="navbar-actions" ref={wrapperRef}>
        <div className="notif-wrapper">
          <button className="icon-btn" onClick={openNotifications} aria-label="Notifications">
            🔔
            {unreadCount > 0 && <span className="notif-dot">{unreadCount}</span>}
          </button>
          {notifOpen && (
            <div className="notif-dropdown">
              <div className="notif-dropdown-header">Notifications</div>
              {notifications.length === 0 && <div className="notif-empty">No notifications yet</div>}
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={'notif-item' + (n.isRead ? '' : ' unread')}
                  onClick={() => !n.isRead && handleMarkRead(n.id)}
                >
                  <p>{n.message}</p>
                  <span>{new Date(n.createdAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="navbar-user">
          <div className="avatar">{(user?.name || user?.username || '?').charAt(0).toUpperCase()}</div>
          <div className="navbar-user-info">
            <span className="navbar-user-name">{user?.name || user?.username}</span>
            <span className="navbar-user-role">{user?.role}</span>
          </div>
        </div>

        {/* <button className="btn btn-outline" onClick={handleLogout}>
          Logout
        </button> */}
      </div>
    </header>
  )
}
