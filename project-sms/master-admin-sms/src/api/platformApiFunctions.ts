import axios, { type AxiosError, type AxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env.VITE_SERVER_LINK as string;

// Single source of truth for the localStorage keys, so PlatformAuthContext.tsx and this
// file can never drift apart on the key name.
export const PLATFORM_TOKEN_KEY = 'platformAuthToken';
export const PLATFORM_USER_KEY = 'platformAuthUser';

function getPlatformAuthHeaders(): Record<string, string> {
  const token = window.localStorage.getItem(PLATFORM_TOKEN_KEY);
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  /** HTTP status code of the response (or the request failure). Callers use this to
   *  detect 401s and trigger a logout without duplicating axios error-handling everywhere. */
  status?: number;
}

function extractErrorMessage(error: unknown, fallback: string): string {
  const axiosError = error as AxiosError<{ message?: string }>;
  return axiosError.response?.data?.message || axiosError.message || fallback;
}

function extractStatus(error: unknown): number {
  const axiosError = error as AxiosError;
  return axiosError.response ? axiosError.response.status : 500;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: 'platform-superadmin';
}

export async function platformLogin(
  email: string,
  password: string
): Promise<ApiResponse<{ token: string; user: PlatformUser }>> {
  try {
    const config: AxiosRequestConfig = {
      method: 'post',
      url: `${BASE_URL}/platform/auth/login`,
      data: { email, password },
      headers: { 'Content-Type': 'application/json' },
    };
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      status: extractStatus(error),
      message: extractErrorMessage(error, 'Login failed'),
    };
  }
}

// ---------------------------------------------------------------------------
// Organizations
// ---------------------------------------------------------------------------
export interface OrganizationPlanSummary {
  id: string;
  name: string;
  maxStudents: number | null;
}

export interface OrganizationSummary {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'suspended' | 'trial' | 'cancelled';
  subscriptionStatus: string;
  plan: OrganizationPlanSummary | null;
  usage: { currentStudentCount: number };
  createdAt: string;
}

export async function getOrganizations(): Promise<ApiResponse<OrganizationSummary[]>> {
  try {
    const config: AxiosRequestConfig = {
      method: 'get',
      url: `${BASE_URL}/platform/organizations`,
      headers: getPlatformAuthHeaders(),
    };
    const response = await axios(config);
    return { success: true, data: response.data.organizations, status: response.status };
  } catch (error) {
    return {
      success: false,
      status: extractStatus(error),
      message: extractErrorMessage(error, 'Failed to fetch organizations'),
    };
  }
}

export interface PlanSummary {
  id: string;
  name: string;
  minStudents: number;
  maxStudents: number | null;
  monthlyPrice: number;
  isCustom: boolean;
}

export async function getPlans(): Promise<ApiResponse<PlanSummary[]>> {
  try {
    const config: AxiosRequestConfig = {
      method: 'get',
      url: `${BASE_URL}/platform/plans`,
      headers: getPlatformAuthHeaders(),
    };
    const response = await axios(config);
    return { success: true, data: response.data.plans, status: response.status };
  } catch (error) {
    return {
      success: false,
      status: extractStatus(error),
      message: extractErrorMessage(error, 'Failed to fetch plans'),
    };
  }
}

export async function checkSlugAvailability(
  slug: string
): Promise<ApiResponse<{ available: boolean }>> {
  try {
    const config: AxiosRequestConfig = {
      method: 'get',
      url: `${BASE_URL}/platform/organizations/check-slug`,
      params: { slug },
      headers: getPlatformAuthHeaders(),
    };
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      status: extractStatus(error),
      message: extractErrorMessage(error, 'Failed to check slug availability'),
    };
  }
}

export interface CreateOrganizationPayload {
  name: string;
  slug: string;
  planId: string;
  primaryContact: { name: string; email: string; phone: string };
}

export interface CreateOrganizationResult {
  organization: { id: string; name: string; slug: string };
  adminCredentialsEmailed: boolean;
}

export async function createOrganization(
  payload: CreateOrganizationPayload
): Promise<ApiResponse<CreateOrganizationResult>> {
  try {
    const config: AxiosRequestConfig = {
      method: 'post',
      url: `${BASE_URL}/platform/organizations`,
      data: payload,
      headers: getPlatformAuthHeaders(),
    };
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      status: extractStatus(error),
      message: extractErrorMessage(error, 'Failed to create organization'),
    };
  }
}

export async function updateOrganizationStatus(
  id: string,
  status: 'active' | 'suspended'
): Promise<ApiResponse<{ organization: { id: string; status: string } }>> {
  try {
    const config: AxiosRequestConfig = {
      method: 'patch',
      url: `${BASE_URL}/platform/organizations/${id}/status`,
      data: { status },
      headers: getPlatformAuthHeaders(),
    };
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      status: extractStatus(error),
      message: extractErrorMessage(error, 'Failed to update organization status'),
    };
  }
}