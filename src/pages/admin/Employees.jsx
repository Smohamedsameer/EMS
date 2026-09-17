import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { employeeApi, getErrorMessage } from '../../services/api.js'
import StatusBadge from '../../components/StatusBadge.jsx'
import Modal from '../../components/Modal.jsx'
import Pagination from '../../components/Pagination.jsx'

const PAGE_SIZE = 8

const emptyForm = {
  employeeId: '',
  name: '',
  email: '',
  phone: '',
  password: '',
  department: '',
  designation: '',
  joiningDate: '',
  status: 'ACTIVE'
}

export default function Employees() {
  const navigate = useNavigate()
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const [confirmDeactivate, setConfirmDeactivate] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await employeeApi.getAll({ search: search || undefined, department: department || undefined, status: status || undefined })
      setEmployees(data)
    } catch {
      // ignore, table just stays empty
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
      load()
    }, 300)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, department, status])

  const departments = useMemo(
    () => Array.from(new Set(employees.map((e) => e.department).filter(Boolean))),
    [employees]
  )

  const paged = employees.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const totalPages = Math.max(1, Math.ceil(employees.length / PAGE_SIZE))

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setFormError('')
    setModalOpen(true)
  }

  const openEdit = (emp) => {
    setEditingId(emp.id)
    setForm({
      employeeId: emp.employeeId,
      name: emp.name,
      email: emp.email,
      phone: emp.phone || '',
      password: '',
      department: emp.department || '',
      designation: emp.designation || '',
      joiningDate: emp.joiningDate || '',
      status: emp.status
    })
    setFormError('')
    setModalOpen(true)
  }

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      const payload = { ...form }
      if (editingId && !payload.password) delete payload.password
      if (editingId) {
        await employeeApi.update(editingId, payload)
      } else {
        await employeeApi.create(payload)
      }
      setModalOpen(false)
      load()
    } catch (err) {
      setFormError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDeactivate = async () => {
    if (!confirmDeactivate) return
    try {
      await employeeApi.deactivate(confirmDeactivate.id)
      setConfirmDeactivate(null)
      load()
    } catch (err) {
      setFormError(getErrorMessage(err))
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Employees</h1>
          <p>Manage employee records, roles and access</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          + Add Employee
        </button>
      </div>

      <div className="toolbar">
        <input
          className="input"
          placeholder="Search by name, ID or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="select" value={department} onChange={(e) => setDepartment(e.target.value)}>
          <option value="">All departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} className="table-empty">Loading…</td></tr>
            )}
            {!loading && paged.length === 0 && (
              <tr><td colSpan={7} className="table-empty">No employees found.</td></tr>
            )}
            {!loading && paged.map((emp) => (
              <tr key={emp.id}>
                <td>{emp.employeeId}</td>
                <td>{emp.name}</td>
                <td>{emp.email}</td>
                <td>{emp.department || '—'}</td>
                <td>{emp.designation || '—'}</td>
                <td><StatusBadge status={emp.status} /></td>
                <td>
                  <div className="actions-cell">
                    <button className="btn btn-outline btn-sm" onClick={() => navigate(`/admin/employees/${emp.id}`)}>View</button>
                    <button className="btn btn-outline btn-sm" onClick={() => openEdit(emp)}>Edit</button>
                    {emp.status === 'ACTIVE' && (
                      <button className="btn btn-danger btn-sm" onClick={() => setConfirmDeactivate(emp)}>Deactivate</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      <Modal
        title={editingId ? 'Edit Employee' : 'Add Employee'}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        width="620px"
      >
        <form onSubmit={handleSubmit}>
          {formError && <div className="login-error">{formError}</div>}
          <div className="form-grid">
            <div className="form-group">
              <label>Employee ID</label>
              <input className="input" value={form.employeeId} onChange={handleChange('employeeId')} required />
            </div>
            <div className="form-group">
              <label>Name</label>
              <input className="input" value={form.name} onChange={handleChange('name')} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input className="input" type="email" value={form.email} onChange={handleChange('email')} required />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input className="input" value={form.phone} onChange={handleChange('phone')} />
            </div>
            <div className="form-group">
              <label>{editingId ? 'New Password (leave blank to keep current)' : 'Password'}</label>
              <input className="input" type="password" value={form.password} onChange={handleChange('password')} required={!editingId} />
            </div>
            <div className="form-group">
              <label>Department</label>
              <input className="input" value={form.department} onChange={handleChange('department')} />
            </div>
            <div className="form-group">
              <label>Designation</label>
              <input className="input" value={form.designation} onChange={handleChange('designation')} />
            </div>
            <div className="form-group">
              <label>Joining Date</label>
              <input className="input" type="date" value={form.joiningDate} onChange={handleChange('joiningDate')} />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select className="select" value={form.status} onChange={handleChange('status')}>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save Employee'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        title="Deactivate Employee"
        isOpen={!!confirmDeactivate}
        onClose={() => setConfirmDeactivate(null)}
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setConfirmDeactivate(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleDeactivate}>Deactivate</button>
          </>
        }
      >
        <p>
          Are you sure you want to deactivate <strong>{confirmDeactivate?.name}</strong>? Their login will be
          disabled but their records will be preserved.
        </p>
      </Modal>
    </div>
  )
}
