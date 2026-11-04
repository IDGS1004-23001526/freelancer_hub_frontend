import { apiClient } from './client.js';

export interface InternalTask {
  id: string;
  title: string;
  description: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignee: string;
  createdBy: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  assignee: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  createdBy?: string;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  status?: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  assignee?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export const internalTasksApi = {
  getTasks: async (params?: { assignee?: string; status?: string }) => {
    const res = await apiClient.get<{ success: boolean; data: InternalTask[]; meta: { total: number; teamMembers: string[] } }>(
      '/v1/internal/tasks',
      { params }
    );
    return res.data;
  },

  createTask: async (payload: CreateTaskPayload) => {
    const res = await apiClient.post<{ success: boolean; data: InternalTask }>('/v1/internal/tasks', payload);
    return res.data;
  },

  updateTask: async (id: string, payload: UpdateTaskPayload) => {
    const res = await apiClient.patch<{ success: boolean; data: InternalTask }>(`/v1/internal/tasks/${id}`, payload);
    return res.data;
  },

  deleteTask: async (id: string) => {
    const res = await apiClient.delete<{ success: boolean; message: string }>(`/v1/internal/tasks/${id}`);
    return res.data;
  },

  // Auth / Identificación del equipo
  loginMember: async (name: string, password: string) => {
    const res = await apiClient.post<{ success: boolean; message: string; data: { id: string; name: string; role: 'ADMIN' | 'DEV' } }>(
      '/v1/internal/team/auth',
      { name, password }
    );
    return res.data;
  },

  getMembersPasswordsForPaulo: async () => {
    const res = await apiClient.get<{ success: boolean; data: { name: string; role: string; password?: string }[] }>(
      '/v1/internal/team/members',
      { headers: { 'x-admin-key': 'paulo_secret_master_key_2026' } }
    );
    return res.data;
  },
};
