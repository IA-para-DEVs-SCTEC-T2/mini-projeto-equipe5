import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '../api/client'
import NavBar from '../components/NavBar'

interface Task {
  id: number
  title: string
  description: string
  datetimeStart: string
  datetimeEnd: string
  epics: { id: number; title: string }[]
}

interface TaskForm {
  title: string
  description: string
  datetimeStart: string
  datetimeEnd: string
  epicIds: string
}

const emptyForm: TaskForm = { title: '', description: '', datetimeStart: '', datetimeEnd: '', epicIds: '' }

export default function TasksPage() {
  const queryClient = useQueryClient()

  const [epicId, setEpicId] = useState<string>('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<TaskForm>(emptyForm)
  const [error, setError] = useState('')

  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ['tasks', epicId],
    queryFn: () => apiClient.get(`/epics/${epicId}/tasks`).then(r => r.data),
    enabled: !!epicId,
  })

  const createMutation = useMutation({
    mutationFn: (data: TaskForm) =>
      apiClient.post('/tasks', {
        title: data.title,
        description: data.description,
        datetimeStart: data.datetimeStart,
        datetimeEnd: data.datetimeEnd,
        epicIds: data.epicIds.split(',').map(s => Number(s.trim())).filter(Boolean),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      setShowForm(false)
      setForm(emptyForm)
      setError('')
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to create task'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: TaskForm }) =>
      apiClient.put(`/tasks/${id}`, {
        title: data.title,
        description: data.description,
        datetimeStart: data.datetimeStart,
        datetimeEnd: data.datetimeEnd,
        epicIds: data.epicIds.split(',').map(s => Number(s.trim())).filter(Boolean),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      setEditingId(null)
      setForm(emptyForm)
      setError('')
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to update task'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      setError('')
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to delete task'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId !== null) {
      updateMutation.mutate({ id: editingId, data: form })
    } else {
      createMutation.mutate(form)
    }
  }

  const startEdit = (task: Task) => {
    setEditingId(task.id)
    setForm({
      title: task.title,
      description: task.description || '',
      datetimeStart: task.datetimeStart ? task.datetimeStart.slice(0, 16) : '',
      datetimeEnd: task.datetimeEnd ? task.datetimeEnd.slice(0, 16) : '',
      epicIds: task.epics.map(e => e.id).join(', '),
    })
    setShowForm(true)
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <>
      <NavBar />
      <div style={{ padding: 24 }}>
        <h1>Tasks</h1>
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div style={{ marginBottom: 16 }}>
          <label>Epic ID: </label>
          <input
            type="number"
            value={epicId}
            onChange={e => setEpicId(e.target.value)}
            placeholder="Enter epic ID"
            style={{ padding: '4px 8px', width: 120 }}
          />
        </div>

        <button
          onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(emptyForm); setError('') }}
          style={{ marginBottom: 16, padding: '8px 16px', cursor: 'pointer' }}
        >
          {showForm ? 'Cancel' : 'Add Task'}
        </button>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginBottom: 24, padding: 16, border: '1px solid #ccc', borderRadius: 4 }}>
            <div style={{ marginBottom: 8 }}>
              <label>Title: </label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>
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
              <label>Epic IDs (comma-separated): </label>
              <input value={form.epicIds} onChange={e => setForm({ ...form, epicIds: e.target.value })} required />
            </div>
            <button type="submit" style={{ padding: '8px 16px', cursor: 'pointer' }}>
              {editingId !== null ? 'Update' : 'Create'}
            </button>
          </form>
        )}

        {!epicId && <p>Please enter an epic ID to view its tasks.</p>}
        {epicId && isLoading && <p>Loading...</p>}

        {epicId && !isLoading && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ccc', textAlign: 'left' }}>
                <th style={{ padding: 8 }}>ID</th>
                <th style={{ padding: 8 }}>Title</th>
                <th style={{ padding: 8 }}>Start</th>
                <th style={{ padding: 8 }}>End</th>
                <th style={{ padding: 8 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks?.map(task => (
                <tr key={task.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: 8 }}>{task.id}</td>
                  <td style={{ padding: 8 }}>{task.title}</td>
                  <td style={{ padding: 8 }}>{task.datetimeStart}</td>
                  <td style={{ padding: 8 }}>{task.datetimeEnd}</td>
                  <td style={{ padding: 8 }}>
                    <button onClick={() => startEdit(task)} style={{ marginRight: 8, cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => handleDelete(task.id)} style={{ cursor: 'pointer', color: 'red' }}>Delete</button>
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
