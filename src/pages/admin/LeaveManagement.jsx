import { useEffect, useState } from 'react'
import { leaveApi, holidayApi, getErrorMessage } from '../../services/api.js'
import StatusBadge from '../../components/StatusBadge.jsx'
import Modal from '../../components/Modal.jsx'

export default function LeaveManagement() {
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [actionTarget, setActionTarget] = useState(null) // { leave, type: 'approve' | 'reject' }
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')

  const [holidays, setHolidays] = useState([])
  const [holidaysLoading, setHolidaysLoading] = useState(true)
  const [showHolidayModal, setShowHolidayModal] = useState(false)
  const [holidayForm, setHolidayForm] = useState({ date: '', reason: '' })
  const [holidayError, setHolidayError] = useState('')
  const [holidaySaving, setHolidaySaving] = useState(false)

  const load = () => {
    setLoading(true)
    leaveApi.getAll().then(setLeaves).catch(() => {}).finally(() => setLoading(false))
  }

  const loadHolidays = () => {
    setHolidaysLoading(true)
    holidayApi.getAll().then(setHolidays).catch(() => {}).finally(() => setHolidaysLoading(false))
  }

  useEffect(load, [])
  useEffect(loadHolidays, [])

  const openHolidayModal = () => {
    setHolidayForm({ date: '', reason: '' })
    setHolidayError('')
    setShowHolidayModal(true)
  }

  const submitHoliday = async (e) => {
    e.preventDefault()
    setHolidaySaving(true)
    setHolidayError('')
    try {
      await holidayApi.create({ date: holidayForm.date, reason: holidayForm.reason })
      setShowHolidayModal(false)
      loadHolidays()
    } catch (err) {
      setHolidayError(getErrorMessage(err))
    } finally {
      setHolidaySaving(false)
    }
  }

  const removeHoliday = async (id) => {
    if (!window.confirm('Remove this holiday? It will no longer show as "H" in the attendance grid.')) return
    try {
      await holidayApi.remove(id)
      loadHolidays()
    } catch {
      // ignore
    }
  }

  const filtered = statusFilter ? leaves.filter((l) => l.status === statusFilter) : leaves

  const openAction = (leave, type) => {
    setActionTarget({ leave, type })
    setComment('')
    setError('')
  }

  const submitAction = async () => {
    try {
      if (actionTarget.type === 'approve') {
        await leaveApi.approve(actionTarget.leave.id, comment)
      } else {
        await leaveApi.reject(actionTarget.leave.id, comment)
      }
      setActionTarget(null)
      load()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Leave Requests</h1>
          <p>Review, approve or reject employee leave applications</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="page-header" style={{ marginBottom: '0.5rem' }}>
          <div>
            <h3>Company Holidays</h3>
            <p className="text-muted" style={{ margin: 0 }}>
              Declare a special date (e.g. a festival) as a holiday for every employee — it will
              show as <strong>H</strong> for everyone in the monthly attendance grid.
            </p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={openHolidayModal}>+ Add Holiday</button>
        </div>

        <div className="holiday-list">
          {holidaysLoading && <p className="text-muted">Loading…</p>}
          {!holidaysLoading && holidays.length === 0 && <p className="text-muted">No holidays declared yet.</p>}
          {!holidaysLoading && holidays.map((h) => (
            <div className="holiday-row" key={h.id}>
              <span className="holiday-date">{h.date}</span>
              <span className="holiday-reason">{h.reason}</span>
              <button className="btn btn-outline btn-sm" onClick={() => removeHoliday(h.id)}>Remove</button>
            </div>
          ))}
        </div>
      </div>

      <div className="toolbar">
        <select className="select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Employee</th><th>Leave Type</th><th>From</th><th>To</th>
              <th>Reason</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} className="table-empty">Loading…</td></tr>}
            {!loading && filtered.length === 0 && <tr><td colSpan={7} className="table-empty">No leave requests found.</td></tr>}
            {!loading && filtered.map((l) => (
              <tr key={l.id}>
                <td>{l.employeeName} ({l.employeeId})</td>
                <td>{l.leaveType}</td>
                <td>{l.fromDate}</td>
                <td>{l.toDate}</td>
                <td>{l.reason || '—'}</td>
                <td><StatusBadge status={l.status} /></td>
                <td>
                  {l.status === 'PENDING' ? (
                    <div className="actions-cell">
                      <button className="btn btn-primary btn-sm" onClick={() => openAction(l, 'approve')}>Approve</button>
                      <button className="btn btn-danger btn-sm" onClick={() => openAction(l, 'reject')}>Reject</button>
                    </div>
                  ) : (
                    <span className="text-muted">{l.adminComment || '—'}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        title={actionTarget?.type === 'approve' ? 'Approve Leave' : 'Reject Leave'}
        isOpen={!!actionTarget}
        onClose={() => setActionTarget(null)}
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setActionTarget(null)}>Cancel</button>
            <button className={actionTarget?.type === 'approve' ? 'btn btn-primary' : 'btn btn-danger'} onClick={submitAction}>
              Confirm {actionTarget?.type === 'approve' ? 'Approval' : 'Rejection'}
            </button>
          </>
        }
      >
        {error && <div className="login-error">{error}</div>}
        <p>
          {actionTarget?.leave.employeeName} — {actionTarget?.leave.leaveType} leave
          ({actionTarget?.leave.fromDate} to {actionTarget?.leave.toDate})
        </p>
        <div className="form-group">
          <label>Remarks (optional)</label>
          <textarea className="input" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} />
        </div>
      </Modal>

      <Modal title="Add Company Holiday" isOpen={showHolidayModal} onClose={() => setShowHolidayModal(false)} width="440px">
        <form onSubmit={submitHoliday}>
          {holidayError && <div className="login-error">{holidayError}</div>}
          <div className="form-group">
            <label>Date</label>
            <input
              className="input"
              type="date"
              required
              value={holidayForm.date}
              onChange={(e) => setHolidayForm((f) => ({ ...f, date: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label>Reason</label>
            <input
              className="input"
              type="text"
              placeholder="e.g. Diwali, Independence Day"
              required
              value={holidayForm.reason}
              onChange={(e) => setHolidayForm((f) => ({ ...f, reason: e.target.value }))}
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={() => setShowHolidayModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={holidaySaving}>
              {holidaySaving ? 'Saving…' : 'Save Holiday'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
