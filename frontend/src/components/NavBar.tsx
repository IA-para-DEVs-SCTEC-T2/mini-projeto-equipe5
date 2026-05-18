import { Link } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'

const navStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  padding: '12px 24px',
  backgroundColor: '#1a1a2e',
  color: '#fff',
}

const linkStyle: React.CSSProperties = {
  color: '#e0e0e0',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: 500,
}

const logoutBtnStyle: React.CSSProperties = {
  marginLeft: 'auto',
  background: '#e74c3c',
  color: '#fff',
  border: 'none',
  padding: '6px 14px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '13px',
}

export default function NavBar() {
  const { logout } = useAuthContext()

  return (
    <nav style={navStyle}>
      <Link to="/projects" style={linkStyle}>Projects</Link>
      <Link to="/clients" style={linkStyle}>Clients</Link>
      <Link to="/epics" style={linkStyle}>Epics</Link>
      <Link to="/tasks" style={linkStyle}>Tasks</Link>
      <Link to="/worklogs" style={linkStyle}>WorkLogs</Link>
      <button style={logoutBtnStyle} onClick={logout}>Logout</button>
    </nav>
  )
}
