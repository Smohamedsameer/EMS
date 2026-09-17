import { useEffect, useMemo, useState } from 'react'
import { attendanceApi, employeeApi, getErrorMessage } from '../../services/api.js'
import StatusBadge from '../../components/StatusBadge.jsx'
import Modal from '../../components/Modal.jsx'

const STATUS_OPTIONS = ['PRESENT', 'ABSENT', 'HALF_DAY', 'LATE', 'LEAVE']

function formatTime(dt) {
  if (!dt) return '--'
  return new Date(dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function Attendance() {
  const [records, setRecords] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [department, setDepartment] = useState('')
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')

  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ checkIn: '', checkOut: '', status: 'PRESENT' })
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [attData, empData] = await Promise.all([
        attendanceApi.search({ date: date || undefined, department: department || undefined, status: status || undefined }),
        employees.length ? Promise.resolve(employees) : employeeApi.getAll({})
      ])
      setRecords(attData)
      if (!employees.length) setEmployees(empData)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, department, status])

  const departments = useMemo(
    () => Array.from(new Set(employees.map((e) => e.department).filter(Boolean))),
    [employees]
  )

  const filtered = records.filter((r) => {
    if (!search) return true
    const q = search.toLowerCase()
    return r.employeeName.toLowerCase().includes(q) || r.employeeId.toLowerCase().includes(q)
  })

  const openCorrect = (record) => {
    setEditing(record)
    setForm({
      checkIn: record.checkIn ? record.checkIn.slice(0, 16) : '',
      checkOut: record.checkOut ? record.checkOut.slice(0, 16) : '',
      status: record.status
    })
    setFormError('')
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      await attendanceApi.correct(editing.id, {
        checkIn: form.checkIn ? form.checkIn + ':00' : null,
        checkOut: form.checkOut ? form.checkOut + ':00' : null,
        status: form.status
      })
      setEditing(null)
      load()
    } catch (err) {
      setFormError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Attendance Management</h1>
          <p>Review and correct employee attendance records</p>
        </div>
      </div>

      <div className="toolbar">
        <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <select className="select" value={department} onChange={(e) => setDepartment(e.target.value)}>
          <option value="">All departments</option>
          {departments.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        <input className="input" placeholder="Search employee…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <button className="btn btn-outline" onClick={() => setDate('')}>Clear date</button>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Employee Name</th>
              <th>Date</th>
              <th>Check In</th>
              {/* <th>Locations</th> */}
              <th>Check Out</th>
              <th>Working Hours</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={8} className="table-empty">Loading…</td></tr>}
            {!loading && filtered.length === 0 && <tr><td colSpan={8} className="table-empty">No attendance records found.</td></tr>}
            {!loading && filtered.map((r) => (
              <tr key={r.id}>
                <td>{r.employeeId}</td>
                <td>{r.employeeName}</td>
                <td>{r.attendanceDate}</td>
                <td>{formatTime(r.checkIn)}</td>
                {/* <td>
  {r.checkInLatitude && r.checkInLongitude ? (
    <a
      href={`https://www.google.com/maps?q=${r.checkInLatitude},${r.checkInLongitude}`}
      target="_blank"
      rel="noopener noreferrer"
      title="View check-in location"
      style={{
        fontSize: '20px',
        textDecoration: 'none',
        cursor: 'pointer'
      }}
    >
      📍
    </a>
  ) : (
    <span>—</span>
  )}
</td> */}
                <td>{formatTime(r.checkOut)}</td>
                <td>{r.workingHours != null ? `${r.workingHours} hrs` : '--'}</td>
                <td><StatusBadge status={r.status} /></td>
                <td>
                  <button className="btn btn-outline btn-sm" onClick={() => openCorrect(r)}>Correct</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal title="Correct Attendance" isOpen={!!editing} onClose={() => setEditing(null)} width="480px">
        {editing && (
          <form onSubmit={handleSave}>
            {formError && <div className="login-error">{formError}</div>}
            <p className="text-muted">
              {editing.employeeName} ({editing.employeeId}) — {editing.attendanceDate}
            </p>
            <div className="form-group">
              <label>Check In</label>
              <input className="input" type="datetime-local" value={form.checkIn}
                onChange={(e) => setForm((f) => ({ ...f, checkIn: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Check Out</label>
              <input className="input" type="datetime-local" value={form.checkOut}
                onChange={(e) => setForm((f) => ({ ...f, checkOut: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select className="select" value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={() => setEditing(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
