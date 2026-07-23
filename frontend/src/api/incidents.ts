import { apiClient } from './client';
import type { Attachment, Incident, IncidentEvent, PaginatedResult } from '../types';
import { IncidentSeverity, IncidentStatus } from '../types';

export interface IncidentFilters {
  status?: IncidentStatus;
  severity?: IncidentSeverity;
  ownerId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const incidentsApi = {
  list: (filters: IncidentFilters) =>
    apiClient.get<PaginatedResult<Incident>>('/incidents', { params: filters }).then((r) => r.data),

  getOne: (id: string) => apiClient.get<Incident>(`/incidents/${id}`).then((r) => r.data),

  getTimeline: (id: string) =>
    apiClient.get<IncidentEvent[]>(`/incidents/${id}/timeline`).then((r) => r.data),

  create: (payload: { title: string; description: string; severity: IncidentSeverity }) =>
    apiClient.post<Incident>('/incidents', payload).then((r) => r.data),

  updateStatus: (id: string, status: IncidentStatus) =>
    apiClient.patch<Incident>(`/incidents/${id}/status`, { status }).then((r) => r.data),

  updateSeverity: (id: string, severity: IncidentSeverity) =>
    apiClient.patch<Incident>(`/incidents/${id}/severity`, { severity }).then((r) => r.data),

  assignOwner: (id: string, ownerId: string) =>
    apiClient.patch<Incident>(`/incidents/${id}/owner`, { ownerId }).then((r) => r.data),

  addComment: (id: string, content: string) =>
    apiClient.post<IncidentEvent>(`/incidents/${id}/comments`, { content }).then((r) => r.data),

  uploadAttachment: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient
      .post<Attachment>(`/incidents/${id}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },
};