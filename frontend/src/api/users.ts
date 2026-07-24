import { apiClient } from './client';
import type { User } from '../types';
import { Role } from '../types';

export const usersApi = {
  list: () => apiClient.get<User[]>('/users').then((r) => r.data),
  setRole: (id: string, role: Role) =>
    apiClient.patch<User>(`/users/${id}/role`, { role }).then((r) => r.data),
};