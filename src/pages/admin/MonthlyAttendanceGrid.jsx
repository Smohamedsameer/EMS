import { useEffect, useMemo, useState } from 'react'
import { attendanceApi, getErrorMessage } from '../../services/api.js'

function currentMonth() {
  return new Date().toISOString().slice(0, 7) // "YYYY-MM"
}

function monthLabel(monthStr) {
  const [y, m] = monthStr.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}

const CODE_TITLE = {
  P: 'Present',
  A: 'Absent',
  L: 'On approved leave',
  HD: 'Half day',
  H: 'Holiday',
  '-': 'Not applicable'
}

export default function MonthlyAttendanceGrid() {
  const [month, setMonth] = useState(currentMonth)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    attendanceApi.monthly(month)
      .then((res) => { if (!cancelled) setData(res) })
      .catch((err) => { if (!cancelled) setError(getErrorMessage(err)) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [month])

  const filteredEmployees = useMemo(() => {
    if (!data) return []
    if (!search) return data.employees
    const q = search.toLowerCase()
    return data.employees.filter(
      (e) => e.employeeName.toLowerCase().includes(q) || e.employeeId.toLowerCase().includes(q)
    )
  }, [data, search])

  return (
    <div>
      <div className="toolbar">
        <input
          className="input"
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
        <input
          className="input"
          placeholder="Search employee…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="text-muted" style={{ alignSelf: 'center' }}>
          {data ? monthLabel(data.month) : ''}
        </span>
      </div>

      {error && <div className="login-error">{error}</div>}

      <div className="table-wrapper monthly-grid">
        <table>
          <thead>
            <tr>
              <th className="emp-col">Employee</th>
              {data?.days.map((d) => (
                <th
                  key={d.day}
                  className={`day-col ${d.sunday ? 'sunday' : ''} ${d.holiday ? 'holiday-col' : ''}`}
                  title={d.holiday ? `Holiday: ${d.holidayReason}` : undefined}
                >
                  {d.day}
                  <span className="weekday">{d.weekday.slice(0, 2)}</span>
                </th>
              ))}
              <th>Working Days</th>
              <th>Present</th>
              <th>Absent</th>
              <th>Leave</th>
              <th>Holidays</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={(data?.days.length || 0) + 6} className="table-empty">Loading…</td></tr>
            )}
            {!loading && filteredEmployees.length === 0 && (
              <tr><td colSpan={(data?.days.length || 0) + 6} className="table-empty">No employees found.</td></tr>
            )}
            {!loading && filteredEmployees.map((row) => (
              <tr key={row.employeeDbId}>
                <td className="emp-col">
                  {row.employeeName}
                  <div className="text-muted" style={{ fontSize: '0.72rem' }}>{row.employeeId}</div>
                </td>
                {row.dayCodes.map((code, idx) => {
                  const meta = data.days[idx]
                  return (
                    <td
                      key={idx}
                      className={meta?.sunday ? 'cell-sunday' : ''}
                      title={meta?.holiday ? meta.holidayReason : CODE_TITLE[code]}
                    >
                      {code === '-' ? (
                        <span className="text-muted">–</span>
                      ) : (
                        <span className={`cell-code cell-${code}`}>{code}</span>
                      )}
                    </td>
                  )
                })}
                <td className="monthly-totals">{row.totalWorkingDays}</td>
                <td className="monthly-totals">{row.totalPresent}{row.totalHalfDays ? ` (+${row.totalHalfDays} HD)` : ''}</td>
                <td className="monthly-totals">{row.totalAbsent}</td>
                <td className="monthly-totals">{row.totalLeave}</td>
                <td className="monthly-totals">{row.totalHolidays}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-muted" style={{ marginTop: '0.75rem', fontSize: '0.8rem' }}>
        P = Present · A = Absent (no check-in) · L = Approved leave · HD = Half day · H = Company holiday · – = Before joining or date not yet occurred.
        Working Days excludes company holidays and days outside the employee's employment period.
      </p>
    </div>
  )
}
