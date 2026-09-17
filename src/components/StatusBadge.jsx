const STATUS_CLASSES = {
  PRESENT: 'badge badge-green',
  ABSENT: 'badge badge-red',
  HALF_DAY: 'badge badge-amber',
  LATE: 'badge badge-amber',
  LEAVE: 'badge badge-blue',
  ASSIGNED: 'badge badge-slate',
  ACCEPTED: 'badge badge-blue',
  IN_PROGRESS: 'badge badge-amber',
  ON_HOLD: 'badge badge-red',
  COMPLETED: 'badge badge-green',
  PENDING: 'badge badge-amber',
  APPROVED: 'badge badge-green',
  REJECTED: 'badge badge-red',
  ACTIVE: 'badge badge-green',
  INACTIVE: 'badge badge-red',
  LOW: 'badge badge-slate',
  MEDIUM: 'badge badge-blue',
  HIGH: 'badge badge-amber',
  URGENT: 'badge badge-red'
}

export default function StatusBadge({ status }) {
  if (!status) return <span className="badge badge-slate">—</span>
  const cls = STATUS_CLASSES[status] || 'badge badge-slate'
  return <span className={cls}>{status.replace('_', ' ')}</span>
}
