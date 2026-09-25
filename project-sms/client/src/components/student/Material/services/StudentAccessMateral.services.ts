import axios from "axios";
import { handleApiError } from "./ErrorApi";
import type { Node } from "../../../admin/Material/types/node";

const API = axios.create({
  baseURL: import.meta.env.VITE_SERVER_LINK || "http://localhost:3000",
});


function getAuthHeaders() {
  const token = window.localStorage.getItem("authToken");
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  };
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
    const classes = res.data.data;

    // Transform the data to ensure targetExam and stream are strings (IDs)
    const transformedClasses = classes.map((classItem: any) => ({
      ...classItem,
      // Extract the ID if targetExam is an object, otherwise keep as is
      targetExam: classItem.targetExam.name,
      // Extract the ID if stream is an object, otherwise keep as is
      stream: classItem.stream ? classItem.stream.name : '',
    }));

    return transformedClasses;
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
    return res.data.data;
  } catch (error) {
    handleApiError(error);
    throw error; // ✅ ensures Promise<Node[]>
  }
};

