import { useState, FormEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '../api/client'
import { useAuthContext } from '../context/AuthContext'
import { Link } from 'react-router-dom'

interface ProjectResponse {
  id: number
  name: string
  startDate: string
  endDate: string
  clients: { id: number; name: string }[]
  supervisors: { id: number; name: string }[]
}

export default function ProjectsPage() {
  const queryClient = useQueryClient()
  const { user, logout } = useAuthContext()
  const isSupervisor = user?.role === 'SUPERVISOR'

  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [error, setError] = useState('')

  const { data: projects = [], isLoading } = useQuery<ProjectResponse[]>({
    queryKey: ['projects'],
    queryFn: () => apiClient.get('/projects').then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: { name: string; startDate: string; endDate: string; clientIds: number[]; supervisorUserIds: number[] }) =>
      apiClient.post('/projects', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['projects'] }); resetForm() },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to create'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiClient.put(`/projects/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['projects'] }); resetForm() },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to update'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/projects/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to delete'),
  })

  function resetForm() {
    setShowForm(false); setEditId(null); setName(''); setStartDate(''); setEndDate(''); setError('')
  }

  function handleEdit(p: ProjectResponse) {
    setEditId(p.id); setName(p.name); setStartDate(p.startDate); setEndDate(p.endDate); setShowForm(true); setError('')
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const payload = { name, startDate, endDate, clientIds: [] as number[], supervisorUserIds: [] as number[] }
    if (editId) {
      updateMutation.mutate({ id: editId, data: payload })
    } else {
      createMutation.mutate(payload)
    }
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

      <h1>Projects</h1>

      {isSupervisor && !showForm && (
        <button onClick={() => { resetForm(); setShowForm(true) }} style={{ marginBottom: 16 }}>+ New Project</button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: 16, marginBottom: 24, borderRadius: 8 }}>
          <h3>{editId ? 'Edit Project' : 'New Project'}</h3>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <div style={{ marginBottom: 8 }}>
            <label htmlFor="name">Name</label><br/>
            <input id="name" value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%' }} />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label htmlFor="startDate">Start Date</label><br/>
            <input id="startDate" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required style={{ width: '100%' }} />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label htmlFor="endDate">End Date</label><br/>
            <input id="endDate" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required style={{ width: '100%' }} />
          </div>
          <button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
            {editId ? 'Update' : 'Create'}
          </button>
          <button type="button" onClick={resetForm} style={{ marginLeft: 8 }}>Cancel</button>
        </form>
      )}

      {projects.length === 0 ? (
        <p>No projects yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #333' }}>
              <th style={{ textAlign: 'left', padding: 8 }}>Name</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Start</th>
              <th style={{ textAlign: 'left', padding: 8 }}>End</th>
              {isSupervisor && <th style={{ padding: 8 }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {projects.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 8 }}>{p.name}</td>
                <td style={{ padding: 8 }}>{p.startDate}</td>
                <td style={{ padding: 8 }}>{p.endDate}</td>
                {isSupervisor && (
                  <td style={{ padding: 8 }}>
                    <button onClick={() => handleEdit(p)}>Edit</button>
                    <button onClick={() => deleteMutation.mutate(p.id)} style={{ marginLeft: 4, color: 'red' }}>Delete</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
