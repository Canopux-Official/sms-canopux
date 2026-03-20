import axios, { AxiosError } from "axios";

export interface ApiError {
  success: false;
  message: string;
}


export const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError<ApiError>;
    throw new Error(err.response?.data?.message || "API Error");
  }
  throw new Error("Unexpected Error");
};
