import { useState, FormEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '../api/client'
import { useAuthContext } from '../context/AuthContext'
import { Link } from 'react-router-dom'

interface EpicResponse {
  id: number
  title: string
  description: string
  startDate: string
  endDate: string
}

export default function EpicsPage() {
  const queryClient = useQueryClient()
  const { user, logout } = useAuthContext()
  const isSupervisor = user?.role === 'SUPERVISOR'

  const [projectId, setProjectId] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [projectIds, setProjectIds] = useState('')
  const [error, setError] = useState('')

  const { data: epics = [], isLoading } = useQuery<EpicResponse[]>({
    queryKey: ['epics', projectId],
    queryFn: () => projectId ? apiClient.get(`/projects/${projectId}/epics`).then(r => r.data) : Promise.resolve([]),
    enabled: !!projectId,
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/epics', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['epics'] }); resetForm() },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiClient.put(`/epics/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['epics'] }); resetForm() },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/epics/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['epics'] }),
  })

  function resetForm() { setShowForm(false); setEditId(null); setTitle(''); setDescription(''); setStartDate(''); setEndDate(''); setProjectIds(''); setError('') }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const ids = projectIds.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n))
    const payload = { title, description, startDate, endDate, projectIds: ids }
    if (editId) { updateMutation.mutate({ id: editId, data: payload }) }
    else { createMutation.mutate(payload) }
  }

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

      <h1>Epics</h1>

      <div style={{ marginBottom: 16 }}>
        <label htmlFor="projFilter">Project ID: </label>
        <input id="projFilter" value={projectId} onChange={e => setProjectId(e.target.value)} placeholder="Enter project ID" style={{ width: 100 }} />
      </div>

      {isSupervisor && !showForm && <button onClick={() => { resetForm(); setShowForm(true) }} style={{ marginBottom: 16 }}>+ New Epic</button>}

      {showForm && (
        <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: 16, marginBottom: 24, borderRadius: 8 }}>
          <h3>{editId ? 'Edit Epic' : 'New Epic'}</h3>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <div style={{ marginBottom: 8 }}><label>Title</label><br/><input value={title} onChange={e => setTitle(e.target.value)} required style={{ width: '100%' }} /></div>
          <div style={{ marginBottom: 8 }}><label>Description</label><br/><textarea value={description} onChange={e => setDescription(e.target.value)} style={{ width: '100%' }} /></div>
          <div style={{ marginBottom: 8 }}><label>Start Date</label><br/><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required style={{ width: '100%' }} /></div>
          <div style={{ marginBottom: 8 }}><label>End Date</label><br/><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required style={{ width: '100%' }} /></div>
          <div style={{ marginBottom: 8 }}><label>Project IDs (comma-separated)</label><br/><input value={projectIds} onChange={e => setProjectIds(e.target.value)} required style={{ width: '100%' }} /></div>
          <button type="submit">{editId ? 'Update' : 'Create'}</button>
          <button type="button" onClick={resetForm} style={{ marginLeft: 8 }}>Cancel</button>
        </form>
      )}

      {isLoading ? <p>Loading...</p> : epics.length === 0 ? <p>No epics. Enter a project ID above to filter.</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ borderBottom: '2px solid #333' }}>
            <th style={{ textAlign: 'left', padding: 8 }}>Title</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Start</th>
            <th style={{ textAlign: 'left', padding: 8 }}>End</th>
            {isSupervisor && <th style={{ padding: 8 }}>Actions</th>}
          </tr></thead>
          <tbody>{epics.map(ep => (
            <tr key={ep.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: 8 }}>{ep.title}</td>
              <td style={{ padding: 8 }}>{ep.startDate}</td>
              <td style={{ padding: 8 }}>{ep.endDate}</td>
              {isSupervisor && <td style={{ padding: 8 }}>
                <button onClick={() => deleteMutation.mutate(ep.id)} style={{ color: 'red' }}>Delete</button>
              </td>}
            </tr>
          ))}</tbody>
        </table>
      )}
    </div>
  )
}
