import axios, { AxiosError, type AxiosRequestConfig } from 'axios';

import { getAuthHeaders } from '../utils/authHeader';
import { getOrgSlug } from '../utils/tenant';

export interface OrganizationInfo {
  _id: string;
  name: string;
  slug?: string;
  logoUrl?: string;
}

export interface ValidateTokenResult {
  isValid: boolean;
  role?: string;
  user?: { permissions?: Record<string, boolean>;[key: string]: unknown };
  organization?: OrganizationInfo | null;
}

// Globally ensure cookies are sent
axios.defaults.withCredentials = true;

// --- Token Refresh Interceptor ---
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && (error.response.status === 401 || error.response.status === 403) && !originalRequest._retry) {
      // Prevent infinite loops and don't try to refresh on login/OTP routes
      if (
        originalRequest.url.includes('/auth/refresh') ||
        originalRequest.url.includes('/auth/getLoggedInUser') ||
        originalRequest.url.includes('/auth/verifyOtp') ||
        originalRequest.url.includes('/auth/resendOtp')
      ) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      try {
        // Attempt to get a new access token
        const rs = await axios.post(`${import.meta.env.VITE_SERVER_LINK}/auth/refresh`, {}, { withCredentials: true });
        const { authToken } = rs.data;
        if (authToken) {
          window.localStorage.setItem('authToken', authToken);
          // Re-attempt the original request with the new token
          originalRequest.headers['Authorization'] = `Bearer ${authToken}`;
          return axios(originalRequest);
        }
      } catch (_error) {
        // If refresh fails, clear token to force a re-login
        window.localStorage.removeItem('authToken');
        return Promise.reject(_error);
      }
    }
    return Promise.reject(error);
  }
);

// --- Type Definitions ---

interface LoginPayload {
  name?: string;
  dob?: string;
  phoneNumber?: string;
  currentClass?: string;
  enrollmentNumber?: string;
  password: string;
  role: 'student' | 'admin' | 'superadmin';
}

interface SendOtpPayload {
  email: string;
}

interface VerifyOtpPayload {
  otp: string;
  email: string;
  name?: string;
  dob?: string;
  currentClass?: string;
  phoneNumber?: string;
  enrollmentNumber?: string;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  status?: number;
  message?: string;
  authToken?: string;
  role?: string;
  count?: number;
  admins?: unknown[];
  admin?: unknown;
  error?: unknown;
  pagination?: any;
}

// --- Helper Functions ---

// --- API Functions ---

export async function getAllStudentProfiles(): Promise<ApiResponse> {
  try {
    const config: AxiosRequestConfig = {
      method: "get",
      url: `${import.meta.env.VITE_SERVER_LINK}/auth/getAllStudentProfiles`,
      headers: { 'X-Org-Slug': getOrgSlug() }
    };

    const response = await axios(config);
    return {
      success: true,
      data: response.data.data,
      status: response.status
    };
  } catch (error) {
    const axiosError = error as AxiosError;
    // @ts-expect-error response.data is not typed in AxiosError
    const msg = axiosError.response?.data?.message || axiosError.message;
    return {
      success: false,
      status: axiosError.response ? axiosError.response.status : 500,
      message: msg
    };
  }
}

export async function getLoggedInUser(formData: LoginPayload): Promise<ApiResponse> {
  try {
    const config: AxiosRequestConfig = {
      method: "post",
      url: `${import.meta.env.VITE_SERVER_LINK}/auth/getLoggedInUser`,
      data: formData,
      headers: getAuthHeaders()
    };

    const response = await axios(config);

    if (response.status === 200) {
      if (response.data.authToken) {
        window.localStorage.setItem("authToken", response.data.authToken);
      } else {
        // Store email temporarily for OTP flow
        console.log("Storing email for OTP flow:", response);
        window.localStorage.setItem("authEmail", response.data.email);
        window.localStorage.setItem("authName", response.data.name);
        window.localStorage.setItem("authDob", response.data.dob);
        window.localStorage.setItem("authCurrentClass", response.data.currentClass);
        window.localStorage.setItem("authPhoneNumber", response.data.phoneNumber);
      }
      return {
        success: true,
        data: response.data,
        status: response.status
      };
    }

    return { success: false, status: response.status };

  } catch (error) {
    const axiosError = error as AxiosError;
    // @ts-expect-error response.data is not typed in AxiosError
    const msg = axiosError.response?.data?.message || axiosError.message;
    return {
      success: false,
      status: axiosError.response ? axiosError.response.status : 500,
      message: msg
    };
  }
}

export async function resendOtp(payload: SendOtpPayload): Promise<ApiResponse<{ otp: string }>> {
  try {
    const config: AxiosRequestConfig = {
      method: "post",
      url: `${import.meta.env.VITE_SERVER_LINK}/auth/resendOtp`,
      data: payload,
      headers: getAuthHeaders()
    };

    const response = await axios(config);

    if (response.status === 201 || response.status === 200) {
      return {
        success: true,
        data: response.data,
        status: response.status
      };
    }

    return { success: false, status: response.status };

  } catch (error) {
    const axiosError = error as AxiosError;
    // @ts-expect-error response.data is not typed in AxiosError
    const msg = axiosError.response?.data?.message || axiosError.message;
    return {
      success: false,
      status: axiosError.response ? axiosError.response.status : 500,
      message: msg
    };
  }
}

export async function verifyOtp(payload: VerifyOtpPayload): Promise<ApiResponse> {
  try {
    const config: AxiosRequestConfig = {
      method: "post",
      url: `${import.meta.env.VITE_SERVER_LINK}/auth/verifyOtp`,
      data: payload,
      headers: getAuthHeaders()
    };

    const response = await axios(config);

    if (response.status === 201 || response.status === 200) {
      if (response.data.authToken) {
        window.localStorage.setItem("authToken", response.data.authToken);
        // Clean up temp email
        window.localStorage.removeItem("authEmail");
        window.localStorage.removeItem("authName");
        window.localStorage.removeItem("authDob");
        window.localStorage.removeItem("authCurrentClass");
        window.localStorage.removeItem("authPhoneNumber");
      }
      return {
        success: true,
        status: response.status
      };
    }

    return { success: false, status: response.status };

  } catch (error) {
    const axiosError = error as AxiosError;
    // @ts-expect-error response.data is not typed in AxiosError
    const msg = axiosError.response?.data?.message || axiosError.message;
    return {
      success: false,
      status: axiosError.response ? axiosError.response.status : 500,
      message: msg
    };
  }
}
export async function validateToken(): Promise<ValidateTokenResult> {
  try {
    const config: AxiosRequestConfig = {
      method: "get",
      url: `${import.meta.env.VITE_SERVER_LINK}/auth/verifyToken`,
      headers: getAuthHeaders(),
    };

    const response = await axios(config);
    if (response.status === 200 && response.data.success) {
      return {
        isValid: true,
        role: response.data.role,
        user: response.data.user,
        organization: response.data.organization ?? null,
      };
    }
    return { isValid: false };
  } catch {
    return { isValid: false };
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await axios.post(`${import.meta.env.VITE_SERVER_LINK}/auth/logout`, {}, { withCredentials: true });
  } catch (error) {
    console.error('Error logging out on server:', error);
  }
}

export async function getAdminProfile(): Promise<ApiResponse> {
  try {
    const config: AxiosRequestConfig = {
      method: "get",
      url: `${import.meta.env.VITE_SERVER_LINK}/admin/dashboard/me`,
      headers: getAuthHeaders()
    };
    const response = await axios(config);
    if (response.status === 200 && response.data.success) {
      return { success: true, admin: response.data.admin };
    }
    return { success: false, message: "Failed to fetch admin profile" };
  } catch {
    return { success: false, message: "Network error" };
  }
}
export interface GetStudentsParams {
  page?: number;
  limit?: number;
  search?: string;
  currentClass?: string;
  stream?: string;
  targetExams?: string[];
  isActive?: string; // 'true', 'false', or ''
}

export async function getStudents(params?: GetStudentsParams): Promise<ApiResponse> {
  try {
    let url = `${import.meta.env.VITE_SERVER_LINK}/admin/studentControl/getAllStudents`;

    if (params) {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.currentClass && params.currentClass !== 'All') queryParams.append('currentClass', params.currentClass);
      if (params.stream && params.stream !== 'All') queryParams.append('stream', params.stream);
      if (params.targetExams && params.targetExams.length > 0) queryParams.append('targetExams', params.targetExams.join(','));
      if (params.isActive && params.isActive !== 'All') {
        queryParams.append('isActive', params.isActive === 'Active' ? 'true' : 'false');
      }

      const queryString = queryParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    const config: AxiosRequestConfig = {
      method: "get",
      url,
      headers: getAuthHeaders()
    };
    const response = await axios(config);
    // console.log("getStudents response:", response);
    if (response.status === 200) {
      return {
        success: true,
        data: response.data.data ? response.data.data : response.data,
        pagination: response.data.pagination,
        status: response.status
      };
    }
    return { success: false, status: response.status };
  } catch (error) {
    const axiosError = error as AxiosError;
    // @ts-expect-error response.data is not typed in AxiosError
    const msg = axiosError.response?.data?.message || axiosError.message;
    return {
      success: false,
      status: axiosError.response ? axiosError.response.status : 500,
      message: msg
    };
  }
}
export async function addStudent(studentData: unknown): Promise<ApiResponse> {
  try {
    const config: AxiosRequestConfig = {
      method: "post",
      url: `${import.meta.env.VITE_SERVER_LINK}/admin/studentControl/add`,
      data: studentData,
      headers: getAuthHeaders()
    };
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    const axiosError = error as AxiosError;
    // @ts-expect-error response.data is not typed in AxiosError
    return { success: false, message: axiosError.response?.data?.message || "Failed to add student" };
  }
}

export async function updateStudent(id: string, studentData: unknown): Promise<ApiResponse> {
  try {
    const config: AxiosRequestConfig = {
      method: "put",
      url: `${import.meta.env.VITE_SERVER_LINK}/admin/studentControl/update/${id}`,
      data: studentData,
      headers: getAuthHeaders()
    };
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    const axiosError = error as AxiosError;
    // @ts-expect-error response.data is not typed in AxiosError
    return { success: false, message: axiosError.response?.data?.message || "Failed to update student" };
  }
}

export async function toggleStudentStatus(id: string): Promise<ApiResponse> {
  try {
    const config: AxiosRequestConfig = {
      method: "put",
      url: `${import.meta.env.VITE_SERVER_LINK}/admin/studentControl/toggle-status/${id}`,
      headers: getAuthHeaders()
    };
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    const axiosError = error as AxiosError;
    // @ts-expect-error response.data is not typed in AxiosError
    return { success: false, message: axiosError.response?.data?.message || "Failed to update status" };
  }
}

export async function bulkImportStudents(studentsArray: unknown[]): Promise<ApiResponse> {
  try {
    const config: AxiosRequestConfig = {
      method: "post",
      url: `${import.meta.env.VITE_SERVER_LINK}/admin/studentControl/bulk-add`,
      data: { students: studentsArray },
      headers: getAuthHeaders()
    };
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    const axiosError = error as AxiosError;
    // @ts-expect-error response.data is not typed in AxiosError
    return { success: false, message: axiosError.response?.data?.message || "Import failed" };
  }
}

export async function deleteStudent(id: string): Promise<ApiResponse> {
  try {
    const config: AxiosRequestConfig = {
      method: "delete",
      url: `${import.meta.env.VITE_SERVER_LINK}/admin/studentControl/deleteStudent/${id}`,
      headers: getAuthHeaders()
    };
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  }
  catch (error) {
    const axiosError = error as AxiosError;
    // @ts-expect-error response.data is not typed in AxiosError
    return { success: false, message: axiosError.response?.data?.message || "Failed to delete student" };
  }
}
export async function getStudent() {
  try {
    const config: AxiosRequestConfig = {
      method: "get",
      url: `${import.meta.env.VITE_SERVER_LINK}/student/studentProfile/getStudent`,
      headers: getAuthHeaders()
    };
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    const axiosError = error as AxiosError;
    // @ts-expect-error response.data is not typed in AxiosError
    return { success: false, message: axiosError.response?.data?.message || "Failed to fetch student details" };
  }
}


async function crudRequest(method: 'get' | 'post' | 'put' | 'delete', endpoint: string, data?: unknown): Promise<ApiResponse> {
  try {
    const config: AxiosRequestConfig = {
      method,
      url: `${import.meta.env.VITE_SERVER_LINK}${endpoint}`,
      data,
      headers: getAuthHeaders()
    };
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    const axiosError = error as AxiosError;
    // @ts-expect-error response.data is not typed in AxiosError
    return { success: false, message: axiosError.response?.data?.message || "Operation failed" };
  }
}

// --- STREAMS ---
export const getStreams = () => crudRequest('get', '/admin/streamControl/all');
export const getActiveStreams = () => crudRequest('get', '/admin/streamControl/getActiveStreams');
export const addStream = (data: unknown) => crudRequest('post', '/admin/streamControl/add', data);
export const updateStream = (id: string, data: unknown) => crudRequest('put', `/admin/streamControl/update/${id}`, data);
export const deleteStream = (id: string) => crudRequest('delete', `/admin/streamControl/delete/${id}`);
// --- TARGET EXAMS ---
export const getTargetExams = () => crudRequest('get', '/admin/targetExamControl/all');
export const addTargetExam = (data: unknown) => crudRequest('post', '/admin/targetExamControl/add', data);
export const updateTargetExam = (id: string, data: unknown) => crudRequest('put', `/admin/targetExamControl/update/${id}`, data);
export const deleteTargetExam = (id: string) => crudRequest('delete', `/admin/targetExamControl/delete/${id}`);
export const getActiveTargetExams = () => crudRequest('get', '/admin/targetExamControl/getActiveTargetExams');
// --- SUBJECTS ---
// Overwriting getSubjects to match the specific controller response structure if needed, 
// or you can use the generic one if your controller returns pure array.
// The current controller returns { subjects: [] }, so we might need to unwrap it in the component or here.
export const getAllSubjects = () => crudRequest('get', '/admin/subjectControl/all');
export const addSubject = (data: unknown) => crudRequest('post', '/admin/subjectControl/add', data);
export const updateSubject = (id: string, data: unknown) => crudRequest('put', `/admin/subjectControl/update/${id}`, data);
export const deleteSubject = (id: string) => crudRequest('delete', `/admin/subjectControl/delete/${id}`);
export const getActiveSubjects = () => crudRequest('get', '/admin/subjectControl/getActiveSubjects');

export async function changePassword(passwordData: { current: string, new: string }): Promise<ApiResponse> {
  try {
    const config: AxiosRequestConfig = {
      method: "post",
      url: `${import.meta.env.VITE_SERVER_LINK}/auth/changePassword`, // You need to create this route in backend
      data: passwordData,
      headers: getAuthHeaders()
    };
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    const axiosError = error as AxiosError;
    // @ts-expect-error response.data is not typed
    return { success: false, message: axiosError.response?.data?.message || "Failed to update password" };
  }
}

export async function getAdminDashboardDetails() {
  try {
    const config: AxiosRequestConfig = {
      method: "get",
      url: `${import.meta.env.VITE_SERVER_LINK}/admin/dashboard/getAdminDashboardDetails`,
      headers: getAuthHeaders()
    };
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };

  } catch (error) {
    const axiosError = error as AxiosError;
    // @ts-expect-error response.data is not typed
    return { success: false, message: axiosError.response?.data?.message || "Failed to fetch admin dashboard details" };
  }
}

// --- SUPER ADMIN: ADMIN ACCESS CONTROL ---
export async function getAllAdmins(): Promise<ApiResponse> {
  try {
    const config: AxiosRequestConfig = {
      method: "get",
      url: `${import.meta.env.VITE_SERVER_LINK}/admin/control/getAllAdmins`,
      headers: getAuthHeaders()
    };
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    const axiosError = error as AxiosError;
    // @ts-expect-error response.data is not typed
    return { success: false, message: axiosError.response?.data?.message || "Failed to fetch admins" };
  }
}

export async function updateAdminPermissions(id: string, permissions: unknown): Promise<ApiResponse> {
  try {
    const config: AxiosRequestConfig = {
      method: "put",
      url: `${import.meta.env.VITE_SERVER_LINK}/admin/control/updatePermissions/${id}`,
      data: { permissions },
      headers: getAuthHeaders()
    };
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    const axiosError = error as AxiosError;
    // @ts-expect-error response.data is not typed
    return { success: false, message: axiosError.response?.data?.message || "Failed to update permissions" };
  }
}

export async function addAdmin(adminData: unknown): Promise<ApiResponse> {
  try {
    const config: AxiosRequestConfig = {
      method: "post",
      url: `${import.meta.env.VITE_SERVER_LINK}/admin/control/addAdmin`,
      data: adminData,
      headers: getAuthHeaders()
    };
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    const axiosError = error as AxiosError;
    // @ts-expect-error response.data is not typed
    return { success: false, message: axiosError.response?.data?.message || "Failed to add admin" };
  }
}

export async function updateAdminDetails(id: string, adminData: unknown): Promise<ApiResponse> {
  try {
    const config: AxiosRequestConfig = {
      method: "put",
      url: `${import.meta.env.VITE_SERVER_LINK}/admin/control/updateAdmin/${id}`,
      data: adminData,
      headers: getAuthHeaders()
    };
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    const axiosError = error as AxiosError;
    // @ts-expect-error response.data is not typed
    return { success: false, message: axiosError.response?.data?.message || "Failed to update admin" };
  }
}

export async function deleteAdmin(id: string): Promise<ApiResponse> {
  try {
    const config: AxiosRequestConfig = {
      method: "delete",
      url: `${import.meta.env.VITE_SERVER_LINK}/admin/control/deleteAdmin/${id}`,
      headers: getAuthHeaders()
    };
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    const axiosError = error as AxiosError;
    // @ts-expect-error response.data is not typed
    return { success: false, message: axiosError.response?.data?.message || "Failed to delete admin" };
  }
}

// --- STUDENT SPECIFIC APIs ---

export async function getStudentProfile(): Promise<ApiResponse> {
  try {
    const config: AxiosRequestConfig = {
      method: "get",
      url: `${import.meta.env.VITE_SERVER_LINK}/admin/landingPage/getAllStudentProfiles`,
      headers: getAuthHeaders()
    };
    const response = await axios(config);
    // console.log(response)
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    const axiosError = error as AxiosError;
    // @ts-expect-error response.data is not typed
    return { success: false, message: axiosError.response?.data?.message || "Failed to fetch student profile" };
  }
}

export async function getStudentNotices(): Promise<ApiResponse> {
  try {
    const config: AxiosRequestConfig = {
      method: "get",
      url: `${import.meta.env.VITE_SERVER_LINK}/student/notice`,
      headers: getAuthHeaders()
    };
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    const axiosError = error as AxiosError;
    // @ts-expect-error response.data is not typed
    return { success: false, message: axiosError.response?.data?.message || "Failed to fetch student notices" };
  }
};

// --- LANDING PAGE APIs ---
export const getLandingPage = () => crudRequest('get', '/landingPage');
export const updateLandingPage = (data: unknown) => crudRequest('post', '/admin/landingPage/update', data);







// --- BILLING APIs (superadmin only — see server/src/controllers/billingController.ts) ---

export interface BillingSubscription {
  id: string;
  planId: string | null;
  planName: string;
  planDescription: string;
  maxStudents: number | null;
  durationDays: number;
  oneTimePrice: number;
  monthlyMaintenance: number;
  maintenanceMonths: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'replaced' | 'cancelled';
  state: 'active' | 'expiring_soon' | 'expired' | 'replaced' | 'cancelled';
  totalDays: number;
  elapsedDays: number;
  daysRemaining: number;
  progressPercent: number;
  pricing: {
    subtotal: number; discountPercent: number; discountAmount: number;
    taxPercent: number; taxAmount: number; total: number; currency: string;
  };
  notes: string;
}

export interface BillingMonthlyRow {
  month: string;
  label: string;
  isCurrent: boolean;
  plans: string[];
  invoiced: number;
  paid: number;
}

export interface BillingSummary {
  currentSubscription: BillingSubscription | null;
  subscriptions: BillingSubscription[];
  monthly: BillingMonthlyRow[];
  invoiceSummary: { count: number; totalInvoiced: number; totalPaid: number; outstanding: number; upcoming?: number; balance?: number; overdueCount: number };
}

export async function getBillingSummary(): Promise<ApiResponse<BillingSummary>> {
  try {
    const config: AxiosRequestConfig = {
      method: 'get',
      url: `${import.meta.env.VITE_SERVER_LINK}/admin/billing/summary`,
      headers: getAuthHeaders(),
    };
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    const axiosError = error as AxiosError;
    // @ts-expect-error response.data is not typed
    return { success: false, status: axiosError.response?.status, message: axiosError.response?.data?.message || 'Failed to fetch billing summary' };
  }
}

export interface BillingInvoice {
  id: string;
  invoiceNumber: string;
  status: 'draft' | 'issued' | 'paid' | 'void';
  issueDate: string;
  dueDate: string | null;
  paidAt: string | null;
  total: number;
  currency: string;
}

export async function getMyInvoices(): Promise<ApiResponse<BillingInvoice[]>> {
  try {
    const config: AxiosRequestConfig = {
      method: 'get',
      url: `${import.meta.env.VITE_SERVER_LINK}/admin/billing/invoices`,
      headers: getAuthHeaders(),
    };
    const response = await axios(config);
    return { success: true, data: response.data.invoices, status: response.status };
  } catch (error) {
    const axiosError = error as AxiosError;
    // @ts-expect-error response.data is not typed
    return { success: false, status: axiosError.response?.status, message: axiosError.response?.data?.message || 'Failed to fetch invoices' };
  }
}

/** Downloads an invoice PDF and triggers a browser save — a plain <a href> can't carry the auth header. */
export async function downloadMyInvoicePdf(id: string, filename: string): Promise<ApiResponse<null>> {
  try {
    const response = await axios({
      method: 'get',
      url: `${import.meta.env.VITE_SERVER_LINK}/admin/billing/invoices/${id}/pdf`,
      headers: getAuthHeaders(),
      responseType: 'blob',
    });
    const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `${filename}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
    return { success: true, data: null, status: response.status };
  } catch (error) {
    const axiosError = error as AxiosError;
    return { success: false, status: axiosError.response?.status, message: 'Failed to download invoice PDF' };
  }
}