import { useState, FormEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '../api/client'
import { useAuthContext } from '../context/AuthContext'
import { Link } from 'react-router-dom'

interface TaskResponse {
  id: number
  title: string
  description: string
  datetimeStart: string
  datetimeEnd: string
}

export default function TasksPage() {
  const queryClient = useQueryClient()
  const { user, logout } = useAuthContext()

  const [epicId, setEpicId] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [datetimeStart, setDatetimeStart] = useState('')
  const [datetimeEnd, setDatetimeEnd] = useState('')
  const [epicIds, setEpicIds] = useState('')
  const [error, setError] = useState('')

  const { data: tasks = [], isLoading } = useQuery<TaskResponse[]>({
    queryKey: ['tasks', epicId],
    queryFn: () => epicId ? apiClient.get(`/epics/${epicId}/tasks`).then(r => r.data) : Promise.resolve([]),
    enabled: !!epicId,
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/tasks', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tasks'] }); resetForm() },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiClient.put(`/tasks/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tasks'] }); resetForm() },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/tasks/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  })

  function resetForm() { setShowForm(false); setEditId(null); setTitle(''); setDescription(''); setDatetimeStart(''); setDatetimeEnd(''); setEpicIds(''); setError('') }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const ids = epicIds.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n))
    const payload = { title, description, datetimeStart: datetimeStart + ':00', datetimeEnd: datetimeEnd + ':00', epicIds: ids }
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

      <h1>Tasks</h1>

      <div style={{ marginBottom: 16 }}>
        <label htmlFor="epicFilter">Epic ID: </label>
        <input id="epicFilter" value={epicId} onChange={e => setEpicId(e.target.value)} placeholder="Enter epic ID" style={{ width: 100 }} />
      </div>

      {!showForm && <button onClick={() => { resetForm(); setShowForm(true) }} style={{ marginBottom: 16 }}>+ New Task</button>}

      {showForm && (
        <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: 16, marginBottom: 24, borderRadius: 8 }}>
          <h3>{editId ? 'Edit Task' : 'New Task'}</h3>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <div style={{ marginBottom: 8 }}><label>Title</label><br/><input value={title} onChange={e => setTitle(e.target.value)} required style={{ width: '100%' }} /></div>
          <div style={{ marginBottom: 8 }}><label>Description</label><br/><textarea value={description} onChange={e => setDescription(e.target.value)} style={{ width: '100%' }} /></div>
          <div style={{ marginBottom: 8 }}><label>Start</label><br/><input type="datetime-local" value={datetimeStart} onChange={e => setDatetimeStart(e.target.value)} required style={{ width: '100%' }} /></div>
          <div style={{ marginBottom: 8 }}><label>End</label><br/><input type="datetime-local" value={datetimeEnd} onChange={e => setDatetimeEnd(e.target.value)} required style={{ width: '100%' }} /></div>
          <div style={{ marginBottom: 8 }}><label>Epic IDs (comma-separated)</label><br/><input value={epicIds} onChange={e => setEpicIds(e.target.value)} required style={{ width: '100%' }} /></div>
          <button type="submit">{editId ? 'Update' : 'Create'}</button>
          <button type="button" onClick={resetForm} style={{ marginLeft: 8 }}>Cancel</button>
        </form>
      )}

      {isLoading ? <p>Loading...</p> : tasks.length === 0 ? <p>No tasks. Enter an epic ID above to filter.</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ borderBottom: '2px solid #333' }}>
            <th style={{ textAlign: 'left', padding: 8 }}>Title</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Start</th>
            <th style={{ textAlign: 'left', padding: 8 }}>End</th>
            <th style={{ padding: 8 }}>Actions</th>
          </tr></thead>
          <tbody>{tasks.map(t => (
            <tr key={t.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: 8 }}>{t.title}</td>
              <td style={{ padding: 8 }}>{t.datetimeStart}</td>
              <td style={{ padding: 8 }}>{t.datetimeEnd}</td>
              <td style={{ padding: 8 }}>
                <button onClick={() => deleteMutation.mutate(t.id)} style={{ color: 'red' }}>Delete</button>
              </td>
            </tr>
          ))}</tbody>
        </table>
      )}
    </div>
  )
}
