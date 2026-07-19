import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { ManagedUser } from '@/types/api';

// FUNÇÃO PARA LISTAR USUÁRIOS PENDENTES DE HABILITAÇÃO
export function usePendingUsers() {
  return useQuery({
    queryKey: ['coordinator-pending-users'],
    queryFn: async () => {
      const res = await api.get<{ users: ManagedUser[] }>('/coordinator/pending-users');
      return res.data.users;
    },
  });
}

// FUNÇÃO PARA LISTAR TODOS OS USUÁRIOS
export function useAllUsers() {
  return useQuery({
    queryKey: ['coordinator-all-users'],
    queryFn: async () => {
      const res = await api.get<{ users: ManagedUser[] }>('/coordinator/users');
      return res.data.users;
    },
  });
}

// FUNÇÃO PARA HABILITAR UM USUÁRIO
export function useActivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await api.post<{ message: string; emailSent: boolean }>(
        `/coordinator/users/${userId}/activate`,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coordinator-pending-users'] });
      queryClient.invalidateQueries({ queryKey: ['coordinator-all-users'] });
    },
  });
}

// FUNÇÃO PARA DESABILITAR UM USUÁRIO
export function useDeactivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await api.post<{ message: string }>(
        `/coordinator/users/${userId}/deactivate`,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coordinator-pending-users'] });
      queryClient.invalidateQueries({ queryKey: ['coordinator-all-users'] });
    },
  });
}

// FUNÇÃO PARA EXCLUIR UM USUÁRIO PERMANENTEMENTE
export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await api.delete<{ message: string }>(`/coordinator/users/${userId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coordinator-pending-users'] });
      queryClient.invalidateQueries({ queryKey: ['coordinator-all-users'] });
    },
  });
}
