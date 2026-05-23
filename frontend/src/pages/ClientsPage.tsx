import { useState, FormEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '../api/client'
import { useAuthContext } from '../context/AuthContext'
import { Link } from 'react-router-dom'

interface ClientResponse {
  id: number
  name: string
  pos: { id: number; name: string; email: string }[]
}

export default function ClientsPage() {
  const queryClient = useQueryClient()
  const { user, logout } = useAuthContext()
  const isSupervisor = user?.role === 'SUPERVISOR'

  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const { data: clients = [], isLoading } = useQuery<ClientResponse[]>({
    queryKey: ['clients'],
    queryFn: () => apiClient.get('/clients').then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: { name: string; poUserIds: number[] }) => apiClient.post('/clients', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['clients'] }); resetForm() },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiClient.put(`/clients/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['clients'] }); resetForm() },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/clients/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
  })

  function resetForm() { setShowForm(false); setEditId(null); setName(''); setError('') }

  function handleEdit(c: ClientResponse) { setEditId(c.id); setName(c.name); setShowForm(true); setError('') }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (editId) { updateMutation.mutate({ id: editId, data: { name, poUserIds: [] } }) }
    else { createMutation.mutate({ name, poUserIds: [] }) }
  }

  if (isLoading) return <p>Loading...</p>

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <nav style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <Link to="/projects">Projects</Link>
        <Link to="/clients">Clients</Link>
        <Link to="/epics">Epics</Link>
        <Link to="/tasks">Tasks</Link>
        <Link to="/worklogs">WorkLogs</Link>
        <span style={{ marginLeft: 'auto' }}>{user?.role}</span>
        <button onClick={logout}>Logout</button>
      </nav>

      <h1>Clients</h1>

      {isSupervisor && !showForm && (
        <button onClick={() => { resetForm(); setShowForm(true) }} style={{ marginBottom: 16 }}>+ New Client</button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: 16, marginBottom: 24, borderRadius: 8 }}>
          <h3>{editId ? 'Edit Client' : 'New Client'}</h3>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <div style={{ marginBottom: 8 }}>
            <label htmlFor="clientName">Name</label><br/>
            <input id="clientName" value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%' }} />
          </div>
          <button type="submit">{ editId ? 'Update' : 'Create' }</button>
          <button type="button" onClick={resetForm} style={{ marginLeft: 8 }}>Cancel</button>
        </form>
      )}

      {clients.length === 0 ? <p>No clients yet.</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ borderBottom: '2px solid #333' }}>
            <th style={{ textAlign: 'left', padding: 8 }}>Name</th>
            <th style={{ textAlign: 'left', padding: 8 }}>POs</th>
            {isSupervisor && <th style={{ padding: 8 }}>Actions</th>}
          </tr></thead>
          <tbody>
            {clients.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 8 }}>{c.name}</td>
                <td style={{ padding: 8 }}>{c.pos?.map(p => p.name).join(', ') || '—'}</td>
                {isSupervisor && <td style={{ padding: 8 }}>
                  <button onClick={() => handleEdit(c)}>Edit</button>
                  <button onClick={() => deleteMutation.mutate(c.id)} style={{ marginLeft: 4, color: 'red' }}>Delete</button>
                </td>}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
