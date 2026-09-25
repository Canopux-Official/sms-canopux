import axios from 'axios';
import type { Test, TestFormData, EligibleStudent, MarksEntryResponse } from '../types/types';

const host = import.meta.env.VITE_SERVER_LINK || '';

function getAuthHeaders() {
  const token = window.localStorage.getItem('authToken');
  return {
    Authorization: token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json'
  };
}

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  [key: string]: unknown;
}

const handleError = <T = unknown>(error: unknown, fallback: string): ApiResponse<T> => {
  if (axios.isAxiosError(error)) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || fallback
    };
  }
  return { success: false, message: fallback };
};

export const createTest = async (data: TestFormData): Promise<ApiResponse<Test>> => {
  try {
    const response = await axios.post(`${host}/admin/marks/create-test`, data, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    return handleError(error, 'Failed to create test');
  }
};

export const getAllTests = async (): Promise<ApiResponse<Test[]>> => {
  try {
    const response = await axios.get(`${host}/admin/marks/all-tests`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    return handleError(error, 'Failed to fetch tests');
  }
};

export const getTestById = async (id: string): Promise<ApiResponse<Test>> => {
  try {
    const response = await axios.get(`${host}/admin/marks/test/${id}`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    return handleError(error, 'Failed to fetch test');
  }
};

export const updateTest = async (id: string, data: Partial<TestFormData>): Promise<ApiResponse<Test>> => {
  try {
    const response = await axios.put(`${host}/admin/marks/update-test/${id}`, data, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    return handleError(error, 'Failed to update test');
  }
};

export const deleteTest = async (id: string): Promise<ApiResponse> => {
  try {
    const response = await axios.delete(`${host}/admin/marks/delete-test/${id}`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    return handleError(error, 'Failed to delete test');
  }
};

export const getEligibleStudents = async (testId: string): Promise<ApiResponse<EligibleStudent[]>> => {
  try {
    const response = await axios.get(`${host}/admin/marks/eligible-students/${testId}`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    return handleError(error, 'Failed to fetch eligible students');
  }
};

export const assignStudents = async (testId: string, studentIds: string[]): Promise<ApiResponse> => {
  try {
    const response = await axios.post(
      `${host}/admin/marks/assign/${testId}`,
      { studentIds },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    return handleError(error, 'Failed to assign students');
  }
};

export const getMarksEntry = async (testId: string): Promise<ApiResponse<MarksEntryResponse>> => {
  try {
    const response = await axios.get(`${host}/admin/marks/entry/${testId}`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    return handleError(error, 'Failed to fetch marks entry sheet');
  }
};

export const saveMarksEntry = async (
  testId: string,
  entries: { studentId: string; marksObtained: number | null; isAbsent: boolean }[]
): Promise<ApiResponse> => {
  try {
    const response = await axios.patch(
      `${host}/admin/marks/entry/${testId}`,
      { entries },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    return handleError(error, 'Failed to save marks');
  }
};

export const publishTest = async (testId: string): Promise<ApiResponse> => {
  try {
    const response = await axios.post(`${host}/admin/marks/publish/${testId}`, {}, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    return handleError(error, 'Failed to publish results');
  }
};

export const unpublishTest = async (testId: string): Promise<ApiResponse> => {
  try {
    const response = await axios.post(`${host}/admin/marks/unpublish/${testId}`, {}, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    return handleError(error, 'Failed to unpublish test');
  }
};
