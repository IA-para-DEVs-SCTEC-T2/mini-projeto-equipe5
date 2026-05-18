import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '../api/client'
import NavBar from '../components/NavBar'

interface WorkLog {
  id: number
  description: string
  datetimeStart: string
  datetimeEnd: string
  tasks: { id: number; title: string }[]
}

interface WorkLogForm {
  description: string
  datetimeStart: string
  datetimeEnd: string
  taskIds: string
}

const emptyForm: WorkLogForm = { description: '', datetimeStart: '', datetimeEnd: '', taskIds: '' }

export default function WorkLogsPage() {
  const queryClient = useQueryClient()

  const [taskId, setTaskId] = useState<string>('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<WorkLogForm>(emptyForm)
  const [error, setError] = useState('')

  const { data: worklogs, isLoading } = useQuery<WorkLog[]>({
    queryKey: ['worklogs', taskId],
    queryFn: () => apiClient.get(`/tasks/${taskId}/worklogs`).then(r => r.data),
    enabled: !!taskId,
  })

  const createMutation = useMutation({
    mutationFn: (data: WorkLogForm) =>
      apiClient.post('/worklogs', {
        description: data.description,
        datetimeStart: data.datetimeStart,
        datetimeEnd: data.datetimeEnd,
        taskIds: data.taskIds.split(',').map(s => Number(s.trim())).filter(Boolean),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worklogs'] })
      setShowForm(false)
      setForm(emptyForm)
      setError('')
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to create work log'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: WorkLogForm }) =>
      apiClient.put(`/worklogs/${id}`, {
        description: data.description,
        datetimeStart: data.datetimeStart,
        datetimeEnd: data.datetimeEnd,
        taskIds: data.taskIds.split(',').map(s => Number(s.trim())).filter(Boolean),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worklogs'] })
      setEditingId(null)
      setForm(emptyForm)
      setError('')
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to update work log'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/worklogs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worklogs'] })
      setError('')
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to delete work log'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId !== null) {
      updateMutation.mutate({ id: editingId, data: form })
    } else {
      createMutation.mutate(form)
    }
  }

  const startEdit = (wl: WorkLog) => {
    setEditingId(wl.id)
    setForm({
      description: wl.description || '',
      datetimeStart: wl.datetimeStart ? wl.datetimeStart.slice(0, 16) : '',
      datetimeEnd: wl.datetimeEnd ? wl.datetimeEnd.slice(0, 16) : '',
      taskIds: wl.tasks.map(t => t.id).join(', '),
    })
    setShowForm(true)
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this work log?')) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <>
      <NavBar />
      <div style={{ padding: 24 }}>
        <h1>Work Logs</h1>
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div style={{ marginBottom: 16 }}>
          <label>Task ID: </label>
          <input
            type="number"
            value={taskId}
            onChange={e => setTaskId(e.target.value)}
            placeholder="Enter task ID"
            style={{ padding: '4px 8px', width: 120 }}
          />
        </div>

        <button
          onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(emptyForm); setError('') }}
          style={{ marginBottom: 16, padding: '8px 16px', cursor: 'pointer' }}
        >
          {showForm ? 'Cancel' : 'Add Work Log'}
        </button>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginBottom: 24, padding: 16, border: '1px solid #ccc', borderRadius: 4 }}>
            <div style={{ marginBottom: 8 }}>
              <label>Description: </label>
              <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div style={{ marginBottom: 8 }}>
              <label>Start DateTime: </label>
              <input type="datetime-local" value={form.datetimeStart} onChange={e => setForm({ ...form, datetimeStart: e.target.value })} required />
            </div>
            <div style={{ marginBottom: 8 }}>
              <label>End DateTime: </label>
              <input type="datetime-local" value={form.datetimeEnd} onChange={e => setForm({ ...form, datetimeEnd: e.target.value })} required />
            </div>
            <div style={{ marginBottom: 8 }}>
              <label>Task IDs (comma-separated): </label>
              <input value={form.taskIds} onChange={e => setForm({ ...form, taskIds: e.target.value })} required />
            </div>
            <button type="submit" style={{ padding: '8px 16px', cursor: 'pointer' }}>
              {editingId !== null ? 'Update' : 'Create'}
            </button>
          </form>
        )}

        {!taskId && <p>Please enter a task ID to view its work logs.</p>}
        {taskId && isLoading && <p>Loading...</p>}

        {taskId && !isLoading && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ccc', textAlign: 'left' }}>
                <th style={{ padding: 8 }}>ID</th>
                <th style={{ padding: 8 }}>Description</th>
                <th style={{ padding: 8 }}>Start</th>
                <th style={{ padding: 8 }}>End</th>
                <th style={{ padding: 8 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {worklogs?.map(wl => (
                <tr key={wl.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: 8 }}>{wl.id}</td>
                  <td style={{ padding: 8 }}>{wl.description || '—'}</td>
                  <td style={{ padding: 8 }}>{wl.datetimeStart}</td>
                  <td style={{ padding: 8 }}>{wl.datetimeEnd}</td>
                  <td style={{ padding: 8 }}>
                    <button onClick={() => startEdit(wl)} style={{ marginRight: 8, cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => handleDelete(wl.id)} style={{ cursor: 'pointer', color: 'red' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
