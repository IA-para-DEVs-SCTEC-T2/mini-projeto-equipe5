import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useRegister } from '../hooks/useAuth'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const register = useRegister()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    register.mutate({ email, name, password })
  }

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: 24 }}>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <div><label htmlFor="email">Email</label><br/>
          <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%' }} /></div>
        <div style={{ marginTop: 12 }}><label htmlFor="name">Name</label><br/>
          <input id="name" value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%' }} /></div>
        <div style={{ marginTop: 12 }}><label htmlFor="password">Password (min 8 chars)</label><br/>
          <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} style={{ width: '100%' }} /></div>
        <button type="submit" disabled={register.isPending} style={{ marginTop: 16 }}>
          {register.isPending ? 'Registering...' : 'Register'}
        </button>
      </form>
      {register.isError && <p style={{ color: 'red' }}>Registration failed. Check your inputs.</p>}
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  )
}
