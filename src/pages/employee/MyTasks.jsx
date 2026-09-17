import { useEffect, useState } from 'react'
import { taskApi, getErrorMessage } from '../../services/api.js'
import StatusBadge from '../../components/StatusBadge.jsx'
import Modal from '../../components/Modal.jsx'

const STATUSES = ['ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED']

export default function MyTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  const [detailTask, setDetailTask] = useState(null)
  const [history, setHistory] = useState([])
  const [form, setForm] = useState({ status: '', progress: 0, comment: '', attachmentUrl: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    taskApi.myTasks().then(setTasks).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const filtered = statusFilter ? tasks.filter((t) => t.status === statusFilter) : tasks

  const openDetail = async (task) => {
    setDetailTask(task)
    setForm({ status: task.status, progress: task.progress, comment: '', attachmentUrl: '' })
    setError('')
    try {
      const h = await taskApi.history(task.id)
      setHistory(h)
    } catch {
      setHistory([])
    }
  }

  const handleSubmitUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await taskApi.addUpdate(detailTask.id, {
        status: form.status,
        progress: Number(form.progress),
        comment: form.comment,
        attachmentUrl: form.attachmentUrl
      })
      setDetailTask(null)
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
          <h1>My Tasks</h1>
          <p>Track progress and update status on your assigned work</p>
        </div>
      </div>

      <div className="toolbar">
        <select className="select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr><th>Task ID</th><th>Title</th><th>Project</th><th>Priority</th><th>Due Date</th><th>Status</th><th>Progress</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={8} className="table-empty">Loading…</td></tr>}
            {!loading && filtered.length === 0 && <tr><td colSpan={8} className="table-empty">No tasks assigned yet.</td></tr>}
            {!loading && filtered.map((t) => (
              <tr key={t.id}>
                <td>{t.taskId}</td>
                <td>{t.title}</td>
                <td>{t.project || '—'}</td>
                <td><StatusBadge status={t.priority} /></td>
                <td>{t.dueDate || '—'}</td>
                <td><StatusBadge status={t.status} /></td>
                <td>{t.progress}%</td>
                <td><button className="btn btn-outline btn-sm" onClick={() => openDetail(t)}>Open</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal title={detailTask ? `${detailTask.taskId} — ${detailTask.title}` : ''} isOpen={!!detailTask} onClose={() => setDetailTask(null)} width="640px">
        {detailTask && (
          <div>
            <p className="text-muted">{detailTask.description || 'No description provided.'}</p>
            <div className="form-grid">
              <div className="form-group"><label>Project</label><div>{detailTask.project || '—'}</div></div>
              <div className="form-group"><label>Priority</label><div><StatusBadge status={detailTask.priority} /></div></div>
              <div className="form-group"><label>Start Date</label><div>{detailTask.startDate || '—'}</div></div>
              <div className="form-group"><label>Due Date</label><div>{detailTask.dueDate || '—'}</div></div>
            </div>
            {detailTask.adminComment && (
              <div className="form-group">
                <label>Admin Comments</label>
                <div>{detailTask.adminComment}</div>
              </div>
            )}

            <h3 className="section-title">Update Progress</h3>
            {error && <div className="login-error">{error}</div>}
            <form onSubmit={handleSubmitUpdate}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Status</label>
                  <select className="select" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Progress (%)</label>
                  <input className="input" type="number" min="0" max="100" value={form.progress}
                    onChange={(e) => setForm((f) => ({ ...f, progress: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label>Comment / Completion Notes</label>
                <textarea className="input" rows={3} value={form.comment} onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))} placeholder="What did you complete?" />
              </div>
              <div className="form-group">
                <label>Attachment URL (optional)</label>
                <input className="input" value={form.attachmentUrl} onChange={(e) => setForm((f) => ({ ...f, attachmentUrl: e.target.value }))} placeholder="https://…" />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={() => setDetailTask(null)}>Close</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Submit Update'}</button>
              </div>
            </form>

            <h3 className="section-title">History</h3>
            <div className="timeline">
              {history.length === 0 && <p className="text-muted">No updates yet.</p>}
              {history.map((h) => (
                <div className="timeline-item" key={h.id}>
                  <div className="timeline-date">{new Date(h.createdAt).toLocaleString()}</div>
                  <div className="timeline-status"><StatusBadge status={h.status} /> — {h.progress}%</div>
                  {h.comment && <p>{h.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
