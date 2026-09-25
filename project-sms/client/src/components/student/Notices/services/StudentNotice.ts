// Updated services/StudentNotice.ts
import type { Notice } from "../../../admin/Notice/types/types"

const host = import.meta.env.VITE_SERVER_LINK || '';

function getAuthHeaders() {
  const token = window.localStorage.getItem("authToken");
  return {
    Authorization: token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json'
  };
}

interface ApiResponse {
  success: boolean;
  data?: Notice[];
  count?: number;
  message?: string;
  error?: string;
}

export const getNoticesForStudent = async (): Promise<Notice[]> => {
  try {
    const response = await fetch(`${host}/student/notice`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    // Handle HTTP errors
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized. Please log in again.');
      } else if (response.status === 403) {
        throw new Error('Access forbidden. You do not have permission to view notices.');
      } else if (response.status === 404) {
        throw new Error('Notice service not found.');
      } else if (response.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw new Error(`Failed to fetch notices (Error ${response.status})`);
      }
    }

    const data: ApiResponse = await response.json();

    // Handle API-level errors (success: false)
    if (!data.success) {
      throw new Error(data.message || data.error || 'Failed to fetch notices');
    }

    // Handle missing data
    if (!data.data) {
      throw new Error('No notice data received from server');
    }

    return data.data;
  } catch (error) {
    // Re-throw known errors
    if (error instanceof Error) {
      throw error;
    }
    
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your internet connection.');
    }
    
    // Fallback for unknown errors
    throw new Error('An unexpected error occurred while fetching notices.');
  }
};