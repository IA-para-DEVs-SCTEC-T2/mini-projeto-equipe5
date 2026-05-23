import { useState, FormEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '../api/client'
import { useAuthContext } from '../context/AuthContext'
import { Link } from 'react-router-dom'

interface WorkLogResponse {
  id: number
  description: string
  datetimeStart: string
  datetimeEnd: string
}

export default function WorkLogsPage() {
  const queryClient = useQueryClient()
  const { user, logout } = useAuthContext()

  const [taskId, setTaskId] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [description, setDescription] = useState('')
  const [datetimeStart, setDatetimeStart] = useState('')
  const [datetimeEnd, setDatetimeEnd] = useState('')
  const [taskIds, setTaskIds] = useState('')
  const [error, setError] = useState('')

  const { data: worklogs = [], isLoading } = useQuery<WorkLogResponse[]>({
    queryKey: ['worklogs', taskId],
    queryFn: () => taskId ? apiClient.get(`/tasks/${taskId}/worklogs`).then(r => r.data) : Promise.resolve([]),
    enabled: !!taskId,
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/worklogs', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['worklogs'] }); resetForm() },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/worklogs/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['worklogs'] }),
  })

  function resetForm() { setShowForm(false); setEditId(null); setDescription(''); setDatetimeStart(''); setDatetimeEnd(''); setTaskIds(''); setError('') }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const ids = taskIds.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n))
    const payload = { description, datetimeStart: datetimeStart + ':00', datetimeEnd: datetimeEnd + ':00', taskIds: ids }
    createMutation.mutate(payload)
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

      <h1>Work Logs</h1>

      <div style={{ marginBottom: 16 }}>
        <label htmlFor="taskFilter">Task ID: </label>
        <input id="taskFilter" value={taskId} onChange={e => setTaskId(e.target.value)} placeholder="Enter task ID" style={{ width: 100 }} />
      </div>

      {!showForm && <button onClick={() => { resetForm(); setShowForm(true) }} style={{ marginBottom: 16 }}>+ New WorkLog</button>}

      {showForm && (
        <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: 16, marginBottom: 24, borderRadius: 8 }}>
          <h3>New WorkLog</h3>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <div style={{ marginBottom: 8 }}><label>Description</label><br/><textarea value={description} onChange={e => setDescription(e.target.value)} style={{ width: '100%' }} /></div>
          <div style={{ marginBottom: 8 }}><label>Start</label><br/><input type="datetime-local" value={datetimeStart} onChange={e => setDatetimeStart(e.target.value)} required style={{ width: '100%' }} /></div>
          <div style={{ marginBottom: 8 }}><label>End</label><br/><input type="datetime-local" value={datetimeEnd} onChange={e => setDatetimeEnd(e.target.value)} required style={{ width: '100%' }} /></div>
          <div style={{ marginBottom: 8 }}><label>Task IDs (comma-separated)</label><br/><input value={taskIds} onChange={e => setTaskIds(e.target.value)} required style={{ width: '100%' }} /></div>
          <button type="submit">Create</button>
          <button type="button" onClick={resetForm} style={{ marginLeft: 8 }}>Cancel</button>
        </form>
      )}

      {isLoading ? <p>Loading...</p> : worklogs.length === 0 ? <p>No worklogs. Enter a task ID above to filter.</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ borderBottom: '2px solid #333' }}>
            <th style={{ textAlign: 'left', padding: 8 }}>Description</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Start</th>
            <th style={{ textAlign: 'left', padding: 8 }}>End</th>
            <th style={{ padding: 8 }}>Actions</th>
          </tr></thead>
          <tbody>{worklogs.map(w => (
            <tr key={w.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: 8 }}>{w.description}</td>
              <td style={{ padding: 8 }}>{w.datetimeStart}</td>
              <td style={{ padding: 8 }}>{w.datetimeEnd}</td>
              <td style={{ padding: 8 }}>
                <button onClick={() => deleteMutation.mutate(w.id)} style={{ color: 'red' }}>Delete</button>
              </td>
            </tr>
          ))}</tbody>
        </table>
      )}
    </div>
  )
}
