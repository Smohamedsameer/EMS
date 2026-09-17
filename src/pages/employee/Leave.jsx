import { useEffect, useState } from 'react'
import { leaveApi, getErrorMessage } from '../../services/api.js'
import StatusBadge from '../../components/StatusBadge.jsx'
import Modal from '../../components/Modal.jsx'

const LEAVE_TYPES = ['Casual Leave', 'Sick Leave', 'Earned Leave', 'Unpaid Leave', 'Other']

const emptyForm = { leaveType: LEAVE_TYPES[0], fromDate: '', toDate: '', reason: '' }

export default function Leave() {
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    leaveApi.myLeaves().then(setLeaves).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openApply = () => {
    setForm(emptyForm)
    setError('')
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await leaveApi.apply(form)
      setModalOpen(false)
      load()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Leave</h1>
          <p>Apply for leave and track your requests</p>
        </div>
        <button className="btn btn-primary" onClick={openApply}>+ Apply for Leave</button>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr><th>Leave Type</th><th>From</th><th>To</th><th>Reason</th><th>Status</th><th>Admin Remarks</th></tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="table-empty">Loading…</td></tr>}
            {!loading && leaves.length === 0 && <tr><td colSpan={6} className="table-empty">You haven't requested any leave yet.</td></tr>}
            {!loading && leaves.map((l) => (
              <tr key={l.id}>
                <td>{l.leaveType}</td>
                <td>{l.fromDate}</td>
                <td>{l.toDate}</td>
                <td>{l.reason || '—'}</td>
                <td><StatusBadge status={l.status} /></td>
                <td>{l.adminComment || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal title="Apply for Leave" isOpen={modalOpen} onClose={() => setModalOpen(false)} width="520px">
        <form onSubmit={handleSubmit}>
          {error && <div className="login-error">{error}</div>}
          <div className="form-group">
            <label>Leave Type</label>
            <select className="select" value={form.leaveType} onChange={(e) => setForm((f) => ({ ...f, leaveType: e.target.value }))}>
              {LEAVE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>From Date</label>
              <input className="input" type="date" value={form.fromDate} onChange={(e) => setForm((f) => ({ ...f, fromDate: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>To Date</label>
              <input className="input" type="date" value={form.toDate} onChange={(e) => setForm((f) => ({ ...f, toDate: e.target.value }))} required />
            </div>
          </div>
          <div className="form-group">
            <label>Reason</label>
            <textarea className="input" rows={3} value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Submitting…' : 'Submit Request'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
