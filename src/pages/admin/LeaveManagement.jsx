import { useEffect, useState } from 'react'
import { leaveApi, getErrorMessage } from '../../services/api.js'
import StatusBadge from '../../components/StatusBadge.jsx'
import Modal from '../../components/Modal.jsx'

export default function LeaveManagement() {
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [actionTarget, setActionTarget] = useState(null) // { leave, type: 'approve' | 'reject' }
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    leaveApi.getAll().then(setLeaves).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(load, [])

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
    </div>
  )
}
