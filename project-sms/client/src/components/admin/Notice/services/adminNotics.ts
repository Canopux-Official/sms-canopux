import axios from 'axios';
import type { NoticeFormData } from '../types/types';


const API_BASE_URL = import.meta.env.VITE_SERVER_LINK || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const noticeService = {
  // Admin APIs
  getAllNotices: async () => {
    const response = await apiClient.get('/admin/notice/all');
    return response.data;
  },

  getNoticeById: async (id: string) => {
    const response = await apiClient.get(`/admin/notice/getById/${id}`);
    return response.data;
  },

  createNotice: async (data: NoticeFormData) => {
    const response = await apiClient.post('/admin/notice/create', data);
    return response.data;
  },

  updateNotice: async (id: string, data: Partial<NoticeFormData>) => {
    const response = await apiClient.put(`/admin/notice/edit/${id}`, data);
    return response.data;
  },

  deleteNotice: async (id: string) => {
    const response = await apiClient.delete(`/admin/notice/delete/${id}`);
    return response.data;
  },
};