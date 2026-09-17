import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { dashboardApi, employeeApi } from '../../services/api.js'

export default function Reports() {
  const [dashboard, setDashboard] = useState(null)
  const [employees, setEmployees] = useState([])

  useEffect(() => {
    dashboardApi.admin().then(setDashboard).catch(() => {})
    employeeApi.getAll({}).then(setEmployees).catch(() => {})
  }, [])

  const departmentCounts = employees.reduce((acc, e) => {
    const dept = e.department || 'Unassigned'
    acc[dept] = (acc[dept] || 0) + 1
    return acc
  }, {})

  const deptData = Object.entries(departmentCounts).map(([name, count]) => ({ name, count }))

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Reports</h1>
          <p>Organization-level summaries for headcount, attendance and task delivery</p>
        </div>
      </div>

      <div className="card">
        <h3>Headcount by Department</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={deptData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" fontSize={12} />
            <YAxis fontSize={12} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#1e40af" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {dashboard && (
        <div className="stat-grid">
          <div className="stat-card accent-blue"><div className="stat-label">Total Employees</div><div className="stat-value">{dashboard.totalEmployees}</div></div>
          <div className="stat-card accent-green"><div className="stat-label">Tasks Completed</div><div className="stat-value">{dashboard.completedTasks}</div></div>
          <div className="stat-card accent-amber"><div className="stat-label">Tasks In Progress</div><div className="stat-value">{dashboard.inProgressTasks}</div></div>
          <div className="stat-card accent-red"><div className="stat-label">Tasks Pending</div><div className="stat-value">{dashboard.pendingTasks}</div></div>
        </div>
      )}

      <div className="card">
        <h3>Employee Directory</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Employee ID</th><th>Name</th><th>Department</th><th>Designation</th><th>Status</th></tr>
            </thead>
            <tbody>
              {employees.map((e) => (
                <tr key={e.id}>
                  <td>{e.employeeId}</td><td>{e.name}</td><td>{e.department || '—'}</td>
                  <td>{e.designation || '—'}</td><td>{e.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
