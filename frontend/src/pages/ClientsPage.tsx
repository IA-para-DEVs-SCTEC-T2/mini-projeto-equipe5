import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '../api/client'
import { useAuthContext } from '../context/AuthContext'
import NavBar from '../components/NavBar'

interface Client {
  id: number
  name: string
  pos: { id: string; username?: string }[]
}

interface ClientForm {
  name: string
  poUserIds: string
}

const emptyForm: ClientForm = { name: '', poUserIds: '' }

export default function ClientsPage() {
  const { user } = useAuthContext()
  const queryClient = useQueryClient()
  const isSupervisor = user?.role === 'SUPERVISOR'

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<ClientForm>(emptyForm)
  const [error, setError] = useState('')

  const { data: clients, isLoading } = useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: () => apiClient.get('/clients').then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: ClientForm) =>
      apiClient.post('/clients', {
        name: data.name,
        poUserIds: data.poUserIds ? data.poUserIds.split(',').map(s => Number(s.trim())).filter(Boolean) : [],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      setShowForm(false)
      setForm(emptyForm)
      setError('')
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to create client'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ClientForm }) =>
      apiClient.put(`/clients/${id}`, {
        name: data.name,
        poUserIds: data.poUserIds ? data.poUserIds.split(',').map(s => Number(s.trim())).filter(Boolean) : [],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      setEditingId(null)
      setForm(emptyForm)
      setError('')
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to update client'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/clients/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      setError('')
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to delete client'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId !== null) {
      updateMutation.mutate({ id: editingId, data: form })
    } else {
      createMutation.mutate(form)
    }
  }

  const startEdit = (c: Client) => {
    setEditingId(c.id)
    setForm({
      name: c.name,
      poUserIds: c.pos.map(p => p.id).join(', '),
    })
    setShowForm(true)
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      deleteMutation.mutate(id)
    }
  }

  if (isLoading) return <><NavBar /><p style={{ padding: 24 }}>Loading...</p></>

  return (
    <>
      <NavBar />
      <div style={{ padding: 24 }}>
        <h1>Clients</h1>
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {isSupervisor && (
          <button
            onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(emptyForm); setError('') }}
            style={{ marginBottom: 16, padding: '8px 16px', cursor: 'pointer' }}
          >
            {showForm ? 'Cancel' : 'Add Client'}
          </button>
        )}

        {showForm && isSupervisor && (
          <form onSubmit={handleSubmit} style={{ marginBottom: 24, padding: 16, border: '1px solid #ccc', borderRadius: 4 }}>
            <div style={{ marginBottom: 8 }}>
              <label>Name: </label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div style={{ marginBottom: 8 }}>
              <label>PO User IDs (comma-separated): </label>
              <input value={form.poUserIds} onChange={e => setForm({ ...form, poUserIds: e.target.value })} />
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
              <th style={{ padding: 8 }}>POs</th>
              {isSupervisor && <th style={{ padding: 8 }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {clients?.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 8 }}>{c.id}</td>
                <td style={{ padding: 8 }}>{c.name}</td>
                <td style={{ padding: 8 }}>{c.pos.map(p => p.id).join(', ') || '—'}</td>
                {isSupervisor && (
                  <td style={{ padding: 8 }}>
                    <button onClick={() => startEdit(c)} style={{ marginRight: 8, cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => handleDelete(c.id)} style={{ cursor: 'pointer', color: 'red' }}>Delete</button>
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
