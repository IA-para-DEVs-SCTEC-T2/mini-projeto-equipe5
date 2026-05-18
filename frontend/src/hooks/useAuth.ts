import { useMutation } from '@tanstack/react-query'
import apiClient from '../api/client'
import { useAuthContext } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export function useLogin() {
  const { login } = useAuthContext()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const res = await apiClient.post('/auth/login', data)
      return res.data
    },
    onSuccess: (data) => {
      login(data.token)
      navigate('/projects')
    },
  })
}

export function useRegister() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (data: { email: string; name: string; password: string }) => {
      const res = await apiClient.post('/auth/register', data)
      return res.data
    },
    onSuccess: () => {
      navigate('/login')
    },
  })
}
