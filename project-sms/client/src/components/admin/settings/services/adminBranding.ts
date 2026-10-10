// components/admin/Branding/services/adminBranding.ts
import axios from 'axios';

import { getAuthHeaders } from '../../../../utils/authHeader';
import type { BrandingFormData } from '../types';

const API_BASE_URL = import.meta.env.VITE_SERVER_LINK || 'http://localhost:3000/';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token + org slug to every request
apiClient.interceptors.request.use((config) => {
    const headers = getAuthHeaders();
    config.headers.Authorization = headers.Authorization;
    config.headers['X-Org-Slug'] = headers['X-Org-Slug'];
    return config;
});

export const brandingService = {
    getBranding: async () => {
        const response = await apiClient.get('/admin/branding');
        return response.data;
    },

    updateBranding: async (data: Partial<BrandingFormData>) => {
        const response = await apiClient.put('/admin/branding', data);
        return response.data;
    },
};