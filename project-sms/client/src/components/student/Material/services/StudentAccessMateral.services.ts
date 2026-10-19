import axios from "axios";
import { handleApiError } from "./ErrorApi";
import type { Node } from "../../../admin/Material/types/node";
import { getAuthHeaders as getSharedAuthHeaders } from '../../../../utils/authHeader';


const API = axios.create({
  baseURL: import.meta.env.VITE_SERVER_LINK || "http://localhost:3000",
  timeout: 30000, // a hung request now fails after 30s instead of spinning forever
});


function getAuthHeaders() {
  return { headers: getSharedAuthHeaders() };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const fetchStudentClasses = async (): Promise<Node[]> => {
  try {
    const res = await API.get<ApiResponse<Node[]>>(
      "/student/material/getClasses",
      getAuthHeaders()
    );

    // The backend returns data with populated targetExam and stream objects
    // We need to transform them to match the Node interface expectations
    const classes = res.data.data ?? [];

    // Transform the data to ensure targetExam and stream are strings (IDs)
    const nameOf = (field: any): string =>
      field && typeof field === 'object' ? field.name ?? '' : typeof field === 'string' ? field : '';

    return classes.map((classItem: any) => ({
      ...classItem,
      targetExam: nameOf(classItem.targetExam),
      stream: nameOf(classItem.stream),
    }));


  } catch (error) {
    handleApiError(error);
    throw error; // ✅ ensures Promise<Node[]>
  }
};

export const fetchNodesByParentId = async (
  parentId: string
): Promise<Node[]> => {
  try {
    const res = await API.get<ApiResponse<Node[]>>(
      `/student/material/getChild/${parentId}`,
      getAuthHeaders()
    );
    return res.data.data ?? [];
  } catch (error) {
    handleApiError(error);
    throw error; // ✅ ensures Promise<Node[]>
  }
};

