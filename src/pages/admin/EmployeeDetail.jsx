import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { employeeApi } from '../../services/api.js'
import StatusBadge from '../../components/StatusBadge.jsx'

export default function EmployeeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    employeeApi
      .getDetails(id)
      .then(setDetail)
      .catch(() => setError('Unable to load employee details.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="loading-state">Loading employee profile…</div>
  if (error) return <div className="empty-state">{error}</div>
  if (!detail) return null

  const { profile } = detail

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{profile.name}</h1>
          <p>Employee Profile &amp; Summary</p>
        </div>
        <button className="btn btn-outline" onClick={() => navigate('/admin/employees')}>← Back to Employees</button>
      </div>

      <div className="card">
        <h3>Employee Profile</h3>
        <div className="form-grid">
          <InfoRow label="Employee ID" value={profile.employeeId} />
          <InfoRow label="Name" value={profile.name} />
          <InfoRow label="Email" value={profile.email} />
          <InfoRow label="Phone" value={profile.phone || '—'} />
          <InfoRow label="Department" value={profile.department || '—'} />
          <InfoRow label="Designation" value={profile.designation || '—'} />
          <InfoRow label="Joining Date" value={profile.joiningDate || '—'} />
          <InfoRow label="Status" value={<StatusBadge status={profile.status} />} />
        </div>
      </div>

      <h2 className="section-title">Attendance Summary</h2>
      <div className="stat-grid">
        <div className="stat-card accent-green"><div className="stat-label">Present</div><div className="stat-value">{detail.presentCount}</div></div>
        <div className="stat-card accent-red"><div className="stat-label">Absent</div><div className="stat-value">{detail.absentCount}</div></div>
        <div className="stat-card accent-blue"><div className="stat-label">Leave</div><div className="stat-value">{detail.leaveCount}</div></div>
        <div className="stat-card accent-amber"><div className="stat-label">Late</div><div className="stat-value">{detail.lateCount}</div></div>
      </div>

      <h2 className="section-title">Work Summary</h2>
      <div className="stat-grid">
        <div className="stat-card accent-blue"><div className="stat-label">Assigned Tasks</div><div className="stat-value">{detail.assignedTasks}</div></div>
        <div className="stat-card accent-amber"><div className="stat-label">In Progress</div><div className="stat-value">{detail.inProgressTasks}</div></div>
        <div className="stat-card accent-green"><div className="stat-label">Completed</div><div className="stat-value">{detail.completedTasks}</div></div>
        <div className="stat-card accent-red"><div className="stat-label">Pending</div><div className="stat-value">{detail.pendingTasks}</div></div>
      </div>

      <p className="text-muted">
        See full history in <Link to={`/admin/attendance?employeeId=${profile.id}`}>Attendance</Link> and{' '}
        <Link to={`/admin/tasks?employeeId=${profile.id}`}>Work Tracking</Link>.
      </p>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <div>{value}</div>
    </div>
  )
}
