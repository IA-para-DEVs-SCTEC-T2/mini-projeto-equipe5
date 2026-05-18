import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '../api/client'
import { useAuthContext } from '../context/AuthContext'
import NavBar from '../components/NavBar'

interface Project {
  id: number
  name: string
  startDate: string
  endDate: string
  clients: { id: number; name: string }[]
  supervisors: { id: string; username?: string }[]
}

interface ProjectForm {
  name: string
  startDate: string
  endDate: string
  clientIds: string
  supervisorUserIds: string
}

const emptyForm: ProjectForm = { name: '', startDate: '', endDate: '', clientIds: '', supervisorUserIds: '' }

export default function ProjectsPage() {
  const { user } = useAuthContext()
  const queryClient = useQueryClient()
  const isSupervisor = user?.role === 'SUPERVISOR'

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<ProjectForm>(emptyForm)
  const [error, setError] = useState('')

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: () => apiClient.get('/projects').then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: ProjectForm) =>
      apiClient.post('/projects', {
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        clientIds: data.clientIds.split(',').map(s => Number(s.trim())).filter(Boolean),
        supervisorUserIds: data.supervisorUserIds ? data.supervisorUserIds.split(',').map(s => Number(s.trim())).filter(Boolean) : [],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      setShowForm(false)
      setForm(emptyForm)
      setError('')
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to create project'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProjectForm }) =>
      apiClient.put(`/projects/${id}`, {
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        clientIds: data.clientIds.split(',').map(s => Number(s.trim())).filter(Boolean),
        supervisorUserIds: data.supervisorUserIds ? data.supervisorUserIds.split(',').map(s => Number(s.trim())).filter(Boolean) : [],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      setEditingId(null)
      setForm(emptyForm)
      setError('')
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to update project'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      setError('')
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to delete project'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId !== null) {
      updateMutation.mutate({ id: editingId, data: form })
    } else {
      createMutation.mutate(form)
    }
  }

  const startEdit = (p: Project) => {
    setEditingId(p.id)
    setForm({
      name: p.name,
      startDate: p.startDate,
      endDate: p.endDate,
      clientIds: p.clients.map(c => c.id).join(', '),
      supervisorUserIds: p.supervisors.map(s => s.id).join(', '),
    })
    setShowForm(true)
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      deleteMutation.mutate(id)
    }
  }

  if (isLoading) return <><NavBar /><p style={{ padding: 24 }}>Loading...</p></>

  return (
    <>
      <NavBar />
      <div style={{ padding: 24 }}>
        <h1>Projects</h1>
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {isSupervisor && (
          <button
            onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(emptyForm); setError('') }}
            style={{ marginBottom: 16, padding: '8px 16px', cursor: 'pointer' }}
          >
            {showForm ? 'Cancel' : 'Add Project'}
          </button>
        )}

        {showForm && isSupervisor && (
          <form onSubmit={handleSubmit} style={{ marginBottom: 24, padding: 16, border: '1px solid #ccc', borderRadius: 4 }}>
            <div style={{ marginBottom: 8 }}>
              <label>Name: </label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
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
              <label>Client IDs (comma-separated): </label>
              <input value={form.clientIds} onChange={e => setForm({ ...form, clientIds: e.target.value })} required />
            </div>
            <div style={{ marginBottom: 8 }}>
              <label>Supervisor User IDs (comma-separated): </label>
              <input value={form.supervisorUserIds} onChange={e => setForm({ ...form, supervisorUserIds: e.target.value })} />
            </div>
            <button type="submit" style={{ padding: '8px 16px', cursor: 'pointer' }}>
              {editingId !== null ? 'Update' : 'Create'}
            </button>
          </form>
        )}

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ccc', textAlign: 'left' }}>
              <th style={{ padding: 8 }}>ID</th>
              <th style={{ padding: 8 }}>Name</th>
              <th style={{ padding: 8 }}>Start Date</th>
              <th style={{ padding: 8 }}>End Date</th>
              {isSupervisor && <th style={{ padding: 8 }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {projects?.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 8 }}>{p.id}</td>
                <td style={{ padding: 8 }}>{p.name}</td>
                <td style={{ padding: 8 }}>{p.startDate}</td>
                <td style={{ padding: 8 }}>{p.endDate}</td>
                {isSupervisor && (
                  <td style={{ padding: 8 }}>
                    <button onClick={() => startEdit(p)} style={{ marginRight: 8, cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => handleDelete(p.id)} style={{ cursor: 'pointer', color: 'red' }}>Delete</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
