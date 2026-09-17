import { useEffect, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts'
import { dashboardApi } from '../../services/api.js'

const PIE_COLORS = ['#94a3b8', '#2563eb', '#d97706', '#dc2626', '#16a34a']

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    dashboardApi
      .admin()
      .then(setData)
      .catch(() => setError('Unable to load dashboard data.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-state">Loading dashboard…</div>
  if (error) return <div className="empty-state">{error}</div>
  if (!data) return null

  const attendanceSeries = Object.entries(data.monthlyAttendance || {}).map(([date, count]) => ({
    date: date.slice(-2),
    present: count
  }))

  const taskPieData = Object.entries(data.taskStatusBreakdown || {}).map(([status, count]) => ({
    name: status.replace('_', ' '),
    value: count
  }))

  const workloadData = (data.employeeWorkload || []).slice(0, 8).map((w) => ({
    name: w.employeeName.split(' ')[0],
    tasks: w.taskCount
  }))

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Organization-wide attendance and task overview</p>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard label="Total Employees" value={data.totalEmployees} accent="blue" />
        <StatCard label="Present Today" value={data.presentToday} accent="green" />
        <StatCard label="Absent Today" value={data.absentToday} accent="red" />
        <StatCard label="On Leave" value={data.onLeaveToday} accent="amber" />
      </div>

      <div className="stat-grid">
        <StatCard label="Total Assigned Tasks" value={data.totalAssignedTasks} accent="blue" />
        <StatCard label="In Progress" value={data.inProgressTasks} accent="amber" />
        <StatCard label="Completed" value={data.completedTasks} accent="green" />
        <StatCard label="Pending" value={data.pendingTasks} accent="red" />
      </div>

      <div className="chart-grid">
        <div className="card">
          <h3>Monthly Attendance (Present count by day)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={attendanceSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="present" stroke="#2563eb" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3>Task Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={taskPieData} dataKey="value" nameKey="name" outerRadius={90} label>
                {taskPieData.map((entry, idx) => (
                  <Cell key={entry.name} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3>Employee Workload (active tasks)</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={workloadData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" fontSize={12} />
            <YAxis fontSize={12} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="tasks" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function StatCard({ label, value, accent }) {
  return (
    <div className={`stat-card accent-${accent}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  )
}
