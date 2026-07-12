import { apiClient } from './client';
import { Role, type User } from '../types';

export const usersApi = {
  setRole: (id: string, role: Role) =>
    apiClient.patch<User>(`/users/${id}/role`, { role }).then((r) => r.data),
};