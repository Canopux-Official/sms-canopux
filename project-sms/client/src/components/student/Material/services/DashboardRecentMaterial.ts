// services/RecentMaterialsService.ts

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_SERVER_LINK || "http://localhost:3000";

export interface FileDetail {
  fileName: string;
  uploadLink: string;
  fileId?: string;
}

export interface PathItem {
  id: string;
  heading: string;
}

export interface RecentMaterial {
  _id: string;
  heading: string;
  description?: string;
  subject: string;
  breadcrumb: string;
  path: PathItem[];
  fullPath: PathItem[];
  fileCount: number;
  fileDetails: FileDetail[];
  tags: string[];
  targetExam: string;
  updatedAt: string;
  createdAt: string;
  timeLabel: string;
  wasRecentlyUpdated: boolean;
}

export interface MaterialStats {
  today: number;
  thisWeek: number;
  total: number;
}

// Helper to get auth token from localStorage or cookies
const getAuthToken = (): string | null => {
  // Adjust this based on where you store your token
  return localStorage.getItem('authToken');
};

// Helper to create axios config with auth headers
const getAuthConfig = () => {
  const token = getAuthToken();
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

export const fetchRecentMaterials = async (
  limit: number = 10
): Promise<RecentMaterial[]> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/student/material/recent`,
      {
        params: { limit },
        ...getAuthConfig()
      }
    );

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch recent materials');
    }
  } catch (error: any) {
    console.error('Error fetching recent materials:', error);

    // Handle specific error cases
    if (error.response?.status === 401) {
      throw new Error('Please login to view materials');
    } else if (error.response?.status === 404) {
      throw new Error('Student profile not found');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    throw new Error('Failed to fetch recent materials. Please try again.');
  }
};

export const fetchMaterialStats = async (): Promise<MaterialStats> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/student/material/stats`,
      getAuthConfig()
    );

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch material stats');
    }
  } catch (error: any) {
    console.error('Error fetching material stats:', error);

    if (error.response?.status === 401) {
      throw new Error('Please login to view statistics');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    throw new Error('Failed to fetch material statistics. Please try again.');
  }
};