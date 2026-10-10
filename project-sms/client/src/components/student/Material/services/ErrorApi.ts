import axios, { AxiosError } from "axios";

export interface ApiError {
  success: false;
  message: string;
}

export const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError<ApiError>;
    if (!err.response) {
      throw new Error(
        err.code === "ECONNABORTED"
          ? "The server took too long to respond. Please try again."
          : "Cannot reach the server. Check your connection and try again."
      );
    }
    throw new Error(err.response.data?.message || "API Error");
  }
  throw new Error("Unexpected Error");
};