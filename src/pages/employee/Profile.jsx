import { useAuth } from '../../context/AuthContext.jsx'

export default function Profile() {
  const { user } = useAuth()

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>My Profile</h1>
          <p>Your account information</p>
        </div>
      </div>

      <div className="card">
        <h3>Account Details</h3>
        <div className="form-grid">
          <div className="form-group"><label>Employee ID</label><div>{user?.employeeId || '—'}</div></div>
          <div className="form-group"><label>Name</label><div>{user?.name || user?.username}</div></div>
          <div className="form-group"><label>Email</label><div>{user?.email}</div></div>
          <div className="form-group"><label>Role</label><div>{user?.role}</div></div>
        </div>
        <p className="text-muted">To update your profile details, please contact your administrator.</p>
      </div>
    </div>
  )
}
