import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '../api/client'
import { useAuthContext } from '../context/AuthContext'
import NavBar from '../components/NavBar'

interface Epic {
  id: number
  title: string
  description: string
  startDate: string
  endDate: string
  projects: { id: number; name: string }[]
}

interface Project {
  id: number
  name: string
}

interface EpicForm {
  title: string
  description: string
  startDate: string
  endDate: string
  projectIds: string
}

const emptyForm: EpicForm = { title: '', description: '', startDate: '', endDate: '', projectIds: '' }

export default function EpicsPage() {
  const { user } = useAuthContext()
  const queryClient = useQueryClient()
  const isSupervisor = user?.role === 'SUPERVISOR'

  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<EpicForm>(emptyForm)
  const [error, setError] = useState('')

  const { data: projects } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: () => apiClient.get('/projects').then(r => r.data),
  })

  const { data: epics, isLoading } = useQuery<Epic[]>({
    queryKey: ['epics', selectedProjectId],
    queryFn: () => apiClient.get(`/projects/${selectedProjectId}/epics`).then(r => r.data),
    enabled: !!selectedProjectId,
  })

  const createMutation = useMutation({
    mutationFn: (data: EpicForm) =>
      apiClient.post('/epics', {
        title: data.title,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        projectIds: data.projectIds.split(',').map(s => Number(s.trim())).filter(Boolean),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['epics'] })
      setShowForm(false)
      setForm(emptyForm)
      setError('')
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to create epic'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: EpicForm }) =>
      apiClient.put(`/epics/${id}`, {
        title: data.title,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        projectIds: data.projectIds.split(',').map(s => Number(s.trim())).filter(Boolean),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['epics'] })
      setEditingId(null)
      setForm(emptyForm)
      setError('')
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to update epic'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/epics/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['epics'] })
      setError('')
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to delete epic'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId !== null) {
      updateMutation.mutate({ id: editingId, data: form })
    } else {
      createMutation.mutate(form)
    }
  }

  const startEdit = (epic: Epic) => {
    setEditingId(epic.id)
    setForm({
      title: epic.title,
      description: epic.description || '',
      startDate: epic.startDate,
      endDate: epic.endDate,
      projectIds: epic.projects.map(p => p.id).join(', '),
    })
    setShowForm(true)
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this epic?')) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <>
      <NavBar />
      <div style={{ padding: 24 }}>
        <h1>Epics</h1>
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div style={{ marginBottom: 16 }}>
          <label>Select Project: </label>
          <select
            value={selectedProjectId}
            onChange={e => setSelectedProjectId(e.target.value)}
            style={{ padding: '4px 8px' }}
          >
            <option value="">-- Select a project --</option>
            {projects?.map(p => (
              <option key={p.id} value={p.id}>{p.name} (ID: {p.id})</option>
            ))}
          </select>
        </div>

        {isSupervisor && (
          <button
            onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(emptyForm); setError('') }}
            style={{ marginBottom: 16, padding: '8px 16px', cursor: 'pointer' }}
          >
            {showForm ? 'Cancel' : 'Add Epic'}
          </button>
        )}

        {showForm && isSupervisor && (
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
              <label>Start Date: </label>
              <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required />
            </div>
            <div style={{ marginBottom: 8 }}>
              <label>End Date: </label>
              <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} required />
            </div>
            <div style={{ marginBottom: 8 }}>
              <label>Project IDs (comma-separated): </label>
              <input value={form.projectIds} onChange={e => setForm({ ...form, projectIds: e.target.value })} required />
            </div>
            <button type="submit" style={{ padding: '8px 16px', cursor: 'pointer' }}>
              {editingId !== null ? 'Update' : 'Create'}
            </button>
          </form>
        )}

        {!selectedProjectId && <p>Please select a project to view its epics.</p>}
        {selectedProjectId && isLoading && <p>Loading...</p>}

        {selectedProjectId && !isLoading && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ccc', textAlign: 'left' }}>
                <th style={{ padding: 8 }}>ID</th>
                <th style={{ padding: 8 }}>Title</th>
                <th style={{ padding: 8 }}>Start Date</th>
                <th style={{ padding: 8 }}>End Date</th>
                {isSupervisor && <th style={{ padding: 8 }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {epics?.map(epic => (
                <tr key={epic.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: 8 }}>{epic.id}</td>
                  <td style={{ padding: 8 }}>{epic.title}</td>
                  <td style={{ padding: 8 }}>{epic.startDate}</td>
                  <td style={{ padding: 8 }}>{epic.endDate}</td>
                  {isSupervisor && (
                    <td style={{ padding: 8 }}>
                      <button onClick={() => startEdit(epic)} style={{ marginRight: 8, cursor: 'pointer' }}>Edit</button>
                      <button onClick={() => handleDelete(epic.id)} style={{ cursor: 'pointer', color: 'red' }}>Delete</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
