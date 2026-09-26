import axios from 'axios';
import { getAuthHeaders } from '../../../../utils/authHeader';


const host = import.meta.env.VITE_SERVER_LINK || '';


export interface StudentMarkRow {
  testId: string;
  heading: string;
  description: string;
  testDate: string;
  totalMarks: number;
  classType: string;
  stream: string | null;
  targetExam: string | null;
  marksObtained: number | null;
  isAbsent: boolean;
  percentage: number | null;
  rank: number | null;
  totalStudents: number;
  classAverage: number;
  classHighest: number;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export const getStudentMarks = async (): Promise<ApiResponse<StudentMarkRow[]>> => {
  try {
    const response = await axios.get(`${host}/student/marks`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch marks'
      };
    }
    return { success: false, message: 'Failed to fetch marks' };
  }
};