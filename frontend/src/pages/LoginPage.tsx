import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useLogin } from '../hooks/useAuth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const login = useLogin()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    login.mutate({ email, password })
  }

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: 24 }}>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div><label htmlFor="email">Email</label><br/>
          <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%' }} /></div>
        <div style={{ marginTop: 12 }}><label htmlFor="password">Password</label><br/>
          <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%' }} /></div>
        <button type="submit" disabled={login.isPending} style={{ marginTop: 16 }}>
          {login.isPending ? 'Logging in...' : 'Login'}
        </button>
      </form>
      {login.isError && <p style={{ color: 'red' }}>Invalid credentials</p>}
      <p>Don't have an account? <Link to="/register">Register</Link></p>
    </div>
  )
}
