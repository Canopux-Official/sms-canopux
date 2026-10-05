// project-sms/master-admin-sms/src/api/platformApiFunctions.ts
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
  status: 'active' | 'suspended' | 'cancelled';
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
  description: string;
  minStudents: number;
  maxStudents: number | null;
  durationDays: number;
  /** One-time fee, charged once when the plan is assigned. */
  oneTimePrice: number;
  /** Fixed maintenance charge, billed for every month of the duration. */
  monthlyMaintenance: number;
  currency: string;
  /** Institutes currently on this plan. A plan can only be deleted when this is 0. */
  organizationsCount?: number;
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

export interface PlanFormInput {
  name: string;
  description?: string;
  minStudents: number;
  maxStudents: number | null; // null = unlimited
  durationDays: number;
  /** One-time fee (sent to the server as `price`). */
  price: number;
  /** Fixed monthly maintenance charge. */
  monthlyMaintenance: number;
  currency?: string;
}

export async function createPlan(payload: PlanFormInput): Promise<ApiResponse<{ plan: PlanSummary }>> {
  try {
    const config: AxiosRequestConfig = {
      method: 'post',
      url: `${BASE_URL}/platform/plans`,
      data: payload,
      headers: getPlatformAuthHeaders(),
    };
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { success: false, status: extractStatus(error), message: extractErrorMessage(error, 'Failed to create plan') };
  }
}

export async function updatePlan(id: string, payload: Partial<PlanFormInput>): Promise<ApiResponse<{ plan: PlanSummary }>> {
  try {
    const config: AxiosRequestConfig = {
      method: 'patch',
      url: `${BASE_URL}/platform/plans/${id}`,
      data: payload,
      headers: getPlatformAuthHeaders(),
    };
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { success: false, status: extractStatus(error), message: extractErrorMessage(error, 'Failed to update plan') };
  }
}

export async function deletePlan(id: string): Promise<ApiResponse<null>> {
  try {
    const response = await axios({
      method: 'delete',
      url: `${BASE_URL}/platform/plans/${id}`,
      headers: getPlatformAuthHeaders(),
    });
    return { success: true, data: null, status: response.status };
  } catch (error) {
    return { success: false, status: extractStatus(error), message: extractErrorMessage(error, 'Failed to delete plan') };
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

/**
 * Permanently deletes a SUSPENDED institute and all of its data. The server requires the
 * institute's slug as a typed confirmation and refuses if the institute is not suspended.
 */
export async function deleteOrganization(id: string, confirmSlug: string): Promise<ApiResponse<null>> {
  try {
    const config: AxiosRequestConfig = {
      method: 'delete',
      url: `${BASE_URL}/platform/organizations/${id}`,
      data: { confirmSlug },
      headers: getPlatformAuthHeaders(),
    };
    const response = await axios(config);
    return { success: true, data: null, status: response.status };
  } catch (error) {
    return {
      success: false,
      status: extractStatus(error),
      message: extractErrorMessage(error, 'Failed to delete organization'),
    };
  }
}

// ---------------------------------------------------------------------------
// Organization detail (plan, subscription history, monthly summary)
// ---------------------------------------------------------------------------
export interface OrganizationDetail {
  id: string;
  name: string;
  legalName: string;
  slug: string;
  status: 'active' | 'suspended' | 'cancelled';
  subscriptionStatus: string;
  plan: PlanSummary | null;
  usage: { currentStudentCount: number };
  primaryContact: { name: string; email: string; phone: string } | null;
  billingContact: { name: string; email: string; phone: string } | null;
  address: Record<string, string> | null;
  adminCount: number;
  superAdmin: { id: string; name: string; email: string; phoneNumber: string } | null;
  createdAt: string;
}

export interface SubscriptionSummary {
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
  invoiceId: string | null;
  createdAt: string;
}

export interface MonthlySummaryRow {
  month: string;
  label: string;
  isCurrent: boolean;
  plans: string[];
  invoiced: number;
  paid: number;
}

export interface OrganizationBilling {
  currentSubscription: SubscriptionSummary | null;
  subscriptions: SubscriptionSummary[];
  monthly: MonthlySummaryRow[];
  invoiceSummary: {
    count: number; // issued + paid invoices
    totalInvoiced: number;
    totalPaid: number;
    /** Unpaid balance that is due now or already overdue. */
    outstanding: number;
    /** Unpaid balance on charges that fall due in the future (not yet due). */
    upcoming: number;
    /** outstanding + upcoming (= totalInvoiced - totalPaid). */
    balance: number;
    overdueCount: number;
    overdueAmount: number;
    draftCount: number; // not issued yet, so not counted as billed
    draftTotal: number;
  };
}

export async function getOrganizationDetail(
  id: string
): Promise<ApiResponse<{ organization: OrganizationDetail; billing: OrganizationBilling }>> {
  try {
    const config: AxiosRequestConfig = {
      method: 'get',
      url: `${BASE_URL}/platform/organizations/${id}`,
      headers: getPlatformAuthHeaders(),
    };
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { success: false, status: extractStatus(error), message: extractErrorMessage(error, 'Failed to load organization') };
  }
}

export interface AssignPlanPayload {
  planId: string;
  startDate?: string;
  durationDays?: number;
  maxStudents?: number | null;
  oneTimePrice?: number;
  monthlyMaintenance?: number;
  discountPercent?: number;
  taxPercent?: number;
  notes?: string;
  carryOverRemainingDays?: boolean;
  createInvoice?: boolean;
}

export interface AssignPlanResult {
  subscription: SubscriptionSummary;
  invoice: InvoiceSummary | null;
  /** The whole billing schedule created for this purchase (one-time fee + one per month). */
  invoices: InvoiceSummary[];
  /** What happened to the previous plan's charges when this replaced it. */
  change: { replacedPlans: string[]; voidedCount: number; voidedAmount: number; creditCarried: number };
}

export async function assignPlanToOrganization(
  organizationId: string,
  payload: AssignPlanPayload
): Promise<ApiResponse<AssignPlanResult>> {
  try {
    const config: AxiosRequestConfig = {
      method: 'post',
      url: `${BASE_URL}/platform/organizations/${organizationId}/subscription`,
      data: payload,
      headers: getPlatformAuthHeaders(),
    };
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { success: false, status: extractStatus(error), message: extractErrorMessage(error, 'Failed to assign plan') };
  }
}

// ---------------------------------------------------------------------------
// Invoices
// ---------------------------------------------------------------------------
export interface InvoiceItem { description: string; quantity: number; unitPrice: number; amount: number }
export interface InvoiceParty { name: string; contactName?: string; email: string; phone: string; address: string; gstin: string }

export interface InvoicePayment { id: string; amount: number; paidAt: string; method: string; reference: string; note: string }

export interface InvoiceSummary {
  id: string;
  organizationId: string;
  subscriptionId: string | null;
  invoiceNumber: string;
  status: 'draft' | 'issued' | 'paid' | 'void';
  issueDate: string;
  dueDate: string | null;
  paidAt: string | null;
  paymentMethod: string;
  paymentReference: string;
  /** Set on scheduled plan charges (the one-time fee / each month); null for manual or older invoices. */
  installment: { kind: 'one_time' | 'maintenance'; sequence: number; label: string } | null;
  voidReason: string;
  amountPaid: number;
  balanceDue: number;
  payments: InvoicePayment[];
  seller: InvoiceParty & { paymentInstructions?: string };
  billedTo: InvoiceParty;
  periodStart: string | null;
  periodEnd: string | null;
  items: InvoiceItem[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  taxPercent: number;
  taxAmount: number;
  total: number;
  currency: string;
  notes: string;
  terms: string;
  createdAt: string;
  updatedAt: string;
}

export async function getOrganizationInvoices(organizationId: string): Promise<ApiResponse<InvoiceSummary[]>> {
  try {
    const config: AxiosRequestConfig = {
      method: 'get',
      url: `${BASE_URL}/platform/organizations/${organizationId}/invoices`,
      headers: getPlatformAuthHeaders(),
    };
    const response = await axios(config);
    return { success: true, data: response.data.invoices, status: response.status };
  } catch (error) {
    return { success: false, status: extractStatus(error), message: extractErrorMessage(error, 'Failed to load invoices') };
  }
}

export interface ManualInvoicePayload {
  items: { description: string; quantity: number; unitPrice: number }[];
  discountPercent?: number;
  taxPercent?: number;
  periodStart?: string;
  periodEnd?: string;
  notes?: string;
}

export async function createManualInvoice(
  organizationId: string,
  payload: ManualInvoicePayload
): Promise<ApiResponse<{ invoice: InvoiceSummary }>> {
  try {
    const config: AxiosRequestConfig = {
      method: 'post',
      url: `${BASE_URL}/platform/organizations/${organizationId}/invoices`,
      data: payload,
      headers: getPlatformAuthHeaders(),
    };
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { success: false, status: extractStatus(error), message: extractErrorMessage(error, 'Failed to create invoice') };
  }
}

export interface InvoiceEditPayload {
  items?: { description: string; quantity: number; unitPrice: number }[];
  discountPercent?: number;
  taxPercent?: number;
  dueDate?: string;
  issueDate?: string;
  notes?: string;
  terms?: string;
  billedTo?: Partial<InvoiceParty>;
}

export async function updateInvoice(id: string, payload: InvoiceEditPayload): Promise<ApiResponse<{ invoice: InvoiceSummary }>> {
  try {
    const config: AxiosRequestConfig = {
      method: 'patch',
      url: `${BASE_URL}/platform/invoices/${id}`,
      data: payload,
      headers: getPlatformAuthHeaders(),
    };
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { success: false, status: extractStatus(error), message: extractErrorMessage(error, 'Failed to update invoice') };
  }
}

async function invoiceAction(id: string, action: 'issue' | 'mark-paid' | 'mark-unpaid' | 'void', body?: Record<string, unknown>): Promise<ApiResponse<{ invoice: InvoiceSummary }>> {
  try {
    const config: AxiosRequestConfig = {
      method: 'post',
      url: `${BASE_URL}/platform/invoices/${id}/${action}`,
      data: body || {},
      headers: getPlatformAuthHeaders(),
    };
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { success: false, status: extractStatus(error), message: extractErrorMessage(error, `Failed to ${action.replace('-', ' ')} invoice`) };
  }
}

export const issueInvoice = (id: string) => invoiceAction(id, 'issue');
export interface VoidInvoiceInput {
  /** Why the charge is being removed (kept on the voided invoice). */
  reason?: string;
  /** Must be true to void a charge that already has payments recorded against it. */
  discardPayments?: boolean;
}
/** Voids (waives) one charge. It stops counting in total invoiced / outstanding / upcoming. */
export const voidInvoice = (id: string, input: VoidInvoiceInput = {}) => invoiceAction(id, 'void', { ...input });
export interface RecordPaymentInput {
  /** Leave out to record the whole remaining balance. */
  amount?: number;
  paidAt?: string;
  paymentMethod?: string;
  paymentReference?: string;
  note?: string;
}
export const recordInvoicePayment = (id: string, input: RecordPaymentInput) => invoiceAction(id, 'mark-paid', { ...input });
export const markInvoiceUnpaid = (id: string) => invoiceAction(id, 'mark-unpaid');

export interface BulkPaymentInput {
  invoiceIds: string[];
  paidAt?: string;
  paymentMethod?: string;
  paymentReference?: string;
  note?: string;
}

/** Settles the full balance of every listed invoice with one shared date / method / reference. */
export async function recordBulkPayment(input: BulkPaymentInput): Promise<ApiResponse<{ invoices: InvoiceSummary[] }>> {
  try {
    const response = await axios({
      method: 'post',
      url: `${BASE_URL}/platform/invoices/bulk-payment`,
      data: input,
      headers: getPlatformAuthHeaders(),
    });
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { success: false, status: extractStatus(error), message: extractErrorMessage(error, 'Failed to record payments') };
  }
}

export async function deleteInvoicePayment(id: string, paymentId: string): Promise<ApiResponse<{ invoice: InvoiceSummary }>> {
  try {
    const response = await axios({
      method: 'delete',
      url: `${BASE_URL}/platform/invoices/${id}/payments/${paymentId}`,
      headers: getPlatformAuthHeaders(),
    });
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { success: false, status: extractStatus(error), message: extractErrorMessage(error, 'Failed to remove payment') };
  }
}

/** Downloads the invoice PDF and triggers a browser save — plain <a href> can't carry the auth header. */
export async function downloadInvoicePdf(id: string, filename: string): Promise<ApiResponse<null>> {
  try {
    const response = await axios({
      method: 'get',
      url: `${BASE_URL}/platform/invoices/${id}/pdf`,
      headers: getPlatformAuthHeaders(),
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
    return { success: false, status: extractStatus(error), message: extractErrorMessage(error, 'Failed to download invoice PDF') };
  }
}

// ---------------------------------------------------------------------------
// Login-as (impersonation)
// ---------------------------------------------------------------------------
export interface LoginAsResult {
  token: string;
  orgSlug: string;
  orgName: string;
  admin: { id: string; name: string; email: string; role: string };
}

export async function loginAsOrganizationAdmin(organizationId: string): Promise<ApiResponse<LoginAsResult>> {
  try {
    const config: AxiosRequestConfig = {
      method: 'post',
      url: `${BASE_URL}/platform/organizations/${organizationId}/login-as`,
      headers: getPlatformAuthHeaders(),
    };
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { success: false, status: extractStatus(error), message: extractErrorMessage(error, 'Failed to start login-as session') };
  }
}

/**
 * Builds the URL to open the institute app impersonating that org's superadmin.
 * VITE_INSTITUTE_APP_URL_TEMPLATE may contain a "{slug}" placeholder for production
 * (e.g. https://{slug}.sms.canopux.org) — substituted in. For local dev, point it at
 * a plain origin (e.g. http://localhost:5173); the placeholder is simply absent there,
 * since subdomains don't resolve on localhost and the JWT alone carries the org context.
 */
export function buildInstituteImpersonationUrl(orgSlug: string, token: string): string {
  const template = (import.meta.env.VITE_INSTITUTE_APP_URL_TEMPLATE as string) || 'http://localhost:5173';
  const base = template.includes('{slug}') ? template.replace('{slug}', orgSlug) : template;
  return `${base.replace(/\/$/, '')}/admin/impersonate?impersonation_token=${encodeURIComponent(token)}`;
}