import { useState } from 'react'
import Sidebar from './Sidebar.jsx'
import Navbar from './Navbar.jsx'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="app-shell">
      <Sidebar
  open={sidebarOpen}
  onClose={() => setSidebarOpen(false)}
/>
      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
      <div className="app-main">
        <Navbar onToggleSidebar={() => setSidebarOpen((o) => !o)} />
        <main className="app-content">{children}</main>
      </div>
    </div>
  )
}
