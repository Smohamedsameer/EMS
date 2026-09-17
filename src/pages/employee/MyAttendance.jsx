import { useEffect, useState } from 'react'
import { attendanceApi, getErrorMessage } from '../../services/api.js'
import StatusBadge from '../../components/StatusBadge.jsx'

function formatTime(dt) {
  if (!dt) return '--'
  return new Date(dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function MyAttendance() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [today, setToday] = useState(null)
  const [error, setError] = useState('')
  const [working, setWorking] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [h, t] = await Promise.all([attendanceApi.myHistory(), attendanceApi.today()])
      setHistory(h)
      setToday(t)
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
    setError('')
    try {
      await attendanceApi.checkIn()
      load()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setWorking(false)
    }
  }

  const handleCheckOut = async () => {
    setWorking(true)
    setError('')
    try {
      await attendanceApi.checkOut()
      load()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setWorking(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>My Attendance</h1>
          <p>Check in/out and review your attendance history</p>
        </div>
      </div>

      {error && <div className="login-error">{error}</div>}

      <div className="card">
        <h3>Today</h3>
        <div className="attendance-widget">
          <div className="attendance-times">
            <div><span>Check In</span><span>{formatTime(today?.checkIn)}</span></div>
            <div><span>Check Out</span><span>{formatTime(today?.checkOut)}</span></div>
            <div><span>Working Hours</span><span>{today?.workingHours != null ? `${today.workingHours} hrs` : '---'}</span></div>
          </div>
          <div className="attendance-actions">
            <button className="btn btn-primary" disabled={working || (today && today.checkIn)} onClick={handleCheckIn}>Check In</button>
            <button className="btn btn-outline" disabled={working || !today?.checkIn || today?.checkOut} onClick={handleCheckOut}>Check Out</button>
          </div>
        </div>
      </div>

      <h2 className="section-title">History</h2>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr><th>Date</th><th>Check In</th><th>Check Out</th><th>Working Hours</th><th>Status</th></tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="table-empty">Loading…</td></tr>}
            {!loading && history.length === 0 && <tr><td colSpan={5} className="table-empty">No attendance history yet.</td></tr>}
            {!loading && history.map((r) => (
              <tr key={r.id}>
                <td>{r.attendanceDate}</td>
                <td>{formatTime(r.checkIn)}</td>
                <td>{formatTime(r.checkOut)}</td>
                <td>{r.workingHours != null ? `${r.workingHours} hrs` : '--'}</td>
                <td><StatusBadge status={r.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
