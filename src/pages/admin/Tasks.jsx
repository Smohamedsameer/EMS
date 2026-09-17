import { useEffect, useState } from 'react'
import { taskApi, employeeApi, getErrorMessage } from '../../services/api.js'
import StatusBadge from '../../components/StatusBadge.jsx'
import Modal from '../../components/Modal.jsx'

const STATUSES = ['ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED']
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']

const emptyForm = {
  title: '', description: '', project: '', assignedToId: '', priority: 'MEDIUM', startDate: '', dueDate: ''
}

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('kanban')

  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')

  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState(emptyForm)
  const [createError, setCreateError] = useState('')
  const [saving, setSaving] = useState(false)

  const [detailTask, setDetailTask] = useState(null)
  const [detailForm, setDetailForm] = useState(null)
  const [history, setHistory] = useState([])
  const [detailError, setDetailError] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const [t, e] = await Promise.all([
        taskApi.getAll({ search: search || undefined, priority: priorityFilter || undefined }),
        employees.length ? Promise.resolve(employees) : employeeApi.getAll({ status: 'ACTIVE' })
      ])
      setTasks(t)
      if (!employees.length) setEmployees(e)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, priorityFilter])

  const openCreate = () => {
    setCreateForm(emptyForm)
    setCreateError('')
    setCreateOpen(true)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setCreateError('')
    try {
      await taskApi.create(createForm)
      setCreateOpen(false)
      load()
    } catch (err) {
      setCreateError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const openDetail = async (task) => {
    setDetailTask(task)
    setDetailForm({
      title: task.title,
      description: task.description || '',
      assignedToId: task.assignedToId,
      priority: task.priority,
      dueDate: task.dueDate || '',
      status: task.status,
      adminComment: task.adminComment || ''
    })
    setDetailError('')
    try {
      const h = await taskApi.history(task.id)
      setHistory(h)
    } catch {
      setHistory([])
    }
  }

  const handleUpdateTask = async (e) => {
    e.preventDefault()
    try {
      await taskApi.update(detailTask.id, detailForm)
      setDetailTask(null)
      load()
    } catch (err) {
      setDetailError(getErrorMessage(err))
    }
  }

  const handleApprove = async () => {
    try {
      await taskApi.update(detailTask.id, { approved: true })
      setDetailTask(null)
      load()
    } catch (err) {
      setDetailError(getErrorMessage(err))
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this task permanently?')) return
    try {
      await taskApi.remove(detailTask.id)
      setDetailTask(null)
      load()
    } catch (err) {
      setDetailError(getErrorMessage(err))
    }
  }

  const grouped = STATUSES.reduce((acc, s) => {
    acc[s] = tasks.filter((t) => t.status === s)
    return acc
  }, {})

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Work Tracking</h1>
          <p>Assign, track and approve employee work</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Assign Work</button>
      </div>

      <div className="toolbar">
        <input className="input" placeholder="Search tasks…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="select" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select className="select" value={view} onChange={(e) => setView(e.target.value)}>
          <option value="kanban">Kanban View</option>
          <option value="table">Table View</option>
        </select>
      </div>

      {loading && <div className="loading-state">Loading tasks…</div>}

      {!loading && view === 'kanban' && (
        <div className="kanban-board">
          {STATUSES.map((s) => (
            <div key={s} className="kanban-column">
              <h4><span>{s.replace('_', ' ')}</span><span>{grouped[s].length}</span></h4>
              {grouped[s].map((t) => (
                <div key={t.id} className="kanban-card" onClick={() => openDetail(t)}>
                  <h5>{t.title}</h5>
                  <div className="text-muted">{t.assignedToName}</div>
                  <div className="kanban-meta">
                    <StatusBadge status={t.priority} />
                    <span className="text-muted">{t.dueDate || 'No due date'}</span>
                  </div>
                  <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${t.progress}%` }} /></div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {!loading && view === 'table' && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Task ID</th><th>Title</th><th>Assigned To</th><th>Priority</th>
                <th>Due Date</th><th>Status</th><th>Progress</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 && <tr><td colSpan={8} className="table-empty">No tasks found.</td></tr>}
              {tasks.map((t) => (
                <tr key={t.id}>
                  <td>{t.taskId}</td>
                  <td>{t.title}</td>
                  <td>{t.assignedToName}</td>
                  <td><StatusBadge status={t.priority} /></td>
                  <td>{t.dueDate || '—'}</td>
                  <td><StatusBadge status={t.status} /></td>
                  <td>{t.progress}%</td>
                  <td><button className="btn btn-outline btn-sm" onClick={() => openDetail(t)}>Manage</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Task Modal */}
      <Modal title="Assign Work" isOpen={createOpen} onClose={() => setCreateOpen(false)} width="620px">
        <form onSubmit={handleCreate}>
          {createError && <div className="login-error">{createError}</div>}
          <div className="form-group">
            <label>Task Title</label>
            <input className="input" value={createForm.title} onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea className="input" rows={3} value={createForm.description} onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>Project</label>
              <input className="input" value={createForm.project} onChange={(e) => setCreateForm((f) => ({ ...f, project: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Assigned Employee</label>
              <select className="select" value={createForm.assignedToId} onChange={(e) => setCreateForm((f) => ({ ...f, assignedToId: e.target.value }))} required>
                <option value="">Select employee</option>
                {employees.map((e) => <option key={e.id} value={e.id}>{e.name} ({e.employeeId})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select className="select" value={createForm.priority} onChange={(e) => setCreateForm((f) => ({ ...f, priority: e.target.value }))}>
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Start Date</label>
              <input className="input" type="date" value={createForm.startDate} onChange={(e) => setCreateForm((f) => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input className="input" type="date" value={createForm.dueDate} onChange={(e) => setCreateForm((f) => ({ ...f, dueDate: e.target.value }))} />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={() => setCreateOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Assigning…' : 'Assign Task'}</button>
          </div>
        </form>
      </Modal>

      {/* Task Detail / Manage Modal */}
      <Modal title={detailTask ? `${detailTask.taskId} — ${detailTask.title}` : ''} isOpen={!!detailTask} onClose={() => setDetailTask(null)} width="700px">
        {detailTask && detailForm && (
          <div>
            {detailError && <div className="login-error">{detailError}</div>}
            <form onSubmit={handleUpdateTask}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Title</label>
                  <input className="input" value={detailForm.title} onChange={(e) => setDetailForm((f) => ({ ...f, title: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Reassign To</label>
                  <select className="select" value={detailForm.assignedToId} onChange={(e) => setDetailForm((f) => ({ ...f, assignedToId: e.target.value }))}>
                    {employees.map((e) => <option key={e.id} value={e.id}>{e.name} ({e.employeeId})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select className="select" value={detailForm.priority} onChange={(e) => setDetailForm((f) => ({ ...f, priority: e.target.value }))}>
                    {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input className="input" type="date" value={detailForm.dueDate} onChange={(e) => setDetailForm((f) => ({ ...f, dueDate: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select className="select" value={detailForm.status} onChange={(e) => setDetailForm((f) => ({ ...f, status: e.target.value }))}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Progress</label>
                  <div>{detailTask.progress}% {detailTask.approved && detailTask.status === 'COMPLETED' ? '(Approved)' : ''}</div>
                </div>
              </div>
              <div className="form-group">
                <label>Admin Comment</label>
                <textarea className="input" rows={2} value={detailForm.adminComment} onChange={(e) => setDetailForm((f) => ({ ...f, adminComment: e.target.value }))} />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-danger" onClick={handleDelete}>Delete</button>
                {detailTask.status === 'COMPLETED' && !detailTask.approved && (
                  <button type="button" className="btn btn-outline" onClick={handleApprove}>Approve Completion</button>
                )}
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>

            <h3 className="section-title" style={{ marginTop: '1.5rem' }}>Update History</h3>
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
