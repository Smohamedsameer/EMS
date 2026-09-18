import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { attendanceApi, dashboardApi, getErrorMessage } from '../../services/api.js'
import StatusBadge from '../../components/StatusBadge.jsx'

function formatTime(dt) {
  if (!dt) return '--'
  return new Date(dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

/**
 * Resolves with { latitude, longitude } from the browser, or null if the
 * browser doesn't support geolocation or the user denies/ignores the
 * permission prompt. We never block check-in/out on this — location is
 * best-effort only.
 */
function getCurrentLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 8000 }
    )
  })
}

export default function EmployeeDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionError, setActionError] = useState('')
  const [locationWarning, setLocationWarning] = useState('')
  const [working, setWorking] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const d = await dashboardApi.employee()
      setData(d)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleCheckIn = async () => {
    setWorking(true)
    setActionError('')
    setLocationWarning('')
    try {
      const location = await getCurrentLocation()
      if (!location) setLocationWarning('Check-in recorded without location — location access was denied or unavailable.')
      await attendanceApi.checkIn(location)
      load()
    } catch (err) {
      setActionError(getErrorMessage(err))
    } finally {
      setWorking(false)
    }
  }

  const handleCheckOut = async () => {
    setWorking(true)
    setActionError('')
    setLocationWarning('')
    try {
      const location = await getCurrentLocation()
      if (!location) setLocationWarning('Check-out recorded without location — location access was denied or unavailable.')
      await attendanceApi.checkOut(location)
      load()
    } catch (err) {
      setActionError(getErrorMessage(err))
    } finally {
      setWorking(false)
    }
  }

  if (loading) return <div className="loading-state">Loading your dashboard…</div>
  if (!data) return null

  const today = data.todayAttendance

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Welcome, {data.employeeName}</h1>
          <p>Here's your snapshot for today</p>
        </div>
      </div>

      {actionError && <div className="login-error">{actionError}</div>}
      {locationWarning && <div className="text-muted" style={{ marginBottom: '0.75rem' }}>📍 {locationWarning}</div>}

      <div className="card">
        <h3>Today's Attendance</h3>
        <div className="attendance-widget">
          <div className="attendance-times">
            <div>
              <span>Check In</span>
              <span>{today ? formatTime(today.checkIn) : '--'}</span>
            </div>
            <div>
              <span>Check Out</span>
              <span>{today ? formatTime(today.checkOut) : '--'}</span>
            </div>
            <div>
              <span>Working Hours</span>
              <span>{today?.workingHours != null ? `${today.workingHours} hrs` : '---'}</span>
            </div>
            <div>
              <span>Status</span>
              <span><StatusBadge status={today?.status} /></span>
            </div>
          </div>
          <div className="attendance-actions">
            <button className="btn btn-primary" disabled={working || (today && today.checkIn)} onClick={handleCheckIn}>
              Check In
            </button>
            <button className="btn btn-outline" disabled={working || !today?.checkIn || today?.checkOut} onClick={handleCheckOut}>
              Check Out
            </button>
          </div>
        </div>
      </div>

      <h2 className="section-title">My Tasks</h2>
      <div className="stat-grid">
        <div className="stat-card accent-blue"><div className="stat-label">Assigned</div><div className="stat-value">{data.assignedCount}</div></div>
        <div className="stat-card accent-amber"><div className="stat-label">In Progress</div><div className="stat-value">{data.inProgressCount}</div></div>
        <div className="stat-card accent-green"><div className="stat-label">Completed</div><div className="stat-value">{data.completedCount}</div></div>
        <div className="stat-card accent-red"><div className="stat-label">Pending</div><div className="stat-value">{data.pendingCount}</div></div>
      </div>

      <div className="chart-grid">
        <div className="card">
          <h3>Recent Tasks</h3>
          {data.recentTasks.length === 0 && <p className="text-muted">No tasks assigned yet.</p>}
          {data.recentTasks.map((t) => (
            <div key={t.id} className="kanban-card" style={{ cursor: 'default' }}>
              <h5>{t.title}</h5>
              <div className="kanban-meta">
                <StatusBadge status={t.status} />
                <span className="text-muted">{t.dueDate || 'No due date'}</span>
              </div>
            </div>
          ))}
          <Link to="/employee/tasks" className="btn btn-outline btn-sm" style={{ marginTop: '0.5rem', display: 'inline-block' }}>
            View all tasks
          </Link>
        </div>

        <div className="card">
          <h3>Notifications</h3>
          {data.recentNotifications.length === 0 && <p className="text-muted">No notifications yet.</p>}
          {data.recentNotifications.map((n) => (
            <div className="notif-item" key={n.id}>
              <p>{n.message}</p>
              <span>{new Date(n.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}