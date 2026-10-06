import { apiRequest } from "./api";
import type {
  AdminUser,
  CreateAdminInput,
  DashboardStats,
  ActivityLog,
  EmployeeLogDetail,
  LoginResponse,
  LogEmployee,
  LogSummary,
  Page,
  SessionLog,
  SellerDetail,
  SellerSummary,
  UpdateAdminInput,
} from "./types";

const BASE = "/api/super-admin";

export const SELLER_STATUSES = [
  "active",
  "inactive",
  "pending",
  "email_pending",
  "suspended",
  "rejected",
  "deact_req",
  "act_req",
] as const;

export function login(email: string, password: string): Promise<LoginResponse> {
  return apiRequest<LoginResponse>(`${BASE}/auth/login`, {
    method: "POST",
    body: { email, password },
    auth: false,
  });
}

export function fetchMe(): Promise<AdminUser> {
  return apiRequest<AdminUser>(`${BASE}/auth/me`);
}

export function fetchDashboard(): Promise<DashboardStats> {
  return apiRequest<DashboardStats>(`${BASE}/dashboard`);
}

export type AdminFilters = {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  size?: number;
};

export function fetchAdmins(filters: AdminFilters): Promise<Page<AdminUser>> {
  return apiRequest<Page<AdminUser>>(`${BASE}/admins`, { query: filters });
}

export function fetchAdminRoles(): Promise<string[]> {
  return apiRequest<string[]>(`${BASE}/admins/roles`);
}

export function createAdmin(input: CreateAdminInput): Promise<AdminUser> {
  return apiRequest<AdminUser>(`${BASE}/admins`, { method: "POST", body: input });
}

export function updateAdmin(id: number, input: UpdateAdminInput): Promise<AdminUser> {
  return apiRequest<AdminUser>(`${BASE}/admins/${id}`, { method: "PUT", body: input });
}

export type SellerFilters = {
  search?: string;
  status?: string;
  page?: number;
  size?: number;
};

export function fetchSellers(filters: SellerFilters): Promise<Page<SellerSummary>> {
  return apiRequest<Page<SellerSummary>>(`${BASE}/sellers`, { query: filters });
}

export function fetchSeller(id: number): Promise<SellerDetail> {
  return apiRequest<SellerDetail>(`${BASE}/sellers/${id}`);
}

export type LogFilters = {
  search?: string;
  employeeId?: string;
  role?: string;
  action?: string;
  module?: string;
  status?: string;
  group?: string;
  preset?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
};

export function fetchLogSummary(): Promise<LogSummary> {
  return apiRequest<LogSummary>(`${BASE}/logs/summary`);
}

export function fetchLogEmployees(): Promise<LogEmployee[]> {
  return apiRequest<LogEmployee[]>(`${BASE}/logs/employees`);
}

export function fetchLogActions(): Promise<string[]> {
  return apiRequest<string[]>(`${BASE}/logs/actions`);
}

export function fetchLogModules(): Promise<string[]> {
  return apiRequest<string[]>(`${BASE}/logs/modules`);
}

export function fetchActivities(filters: LogFilters): Promise<Page<ActivityLog>> {
  return apiRequest<Page<ActivityLog>>(`${BASE}/logs/activities`, { query: filters });
}

export function fetchActivity(id: number): Promise<ActivityLog> {
  return apiRequest<ActivityLog>(`${BASE}/logs/activities/${id}`);
}

export function fetchLoginHistory(filters: LogFilters): Promise<Page<SessionLog>> {
  return apiRequest<Page<SessionLog>>(`${BASE}/logs/logins`, { query: filters });
}

export function fetchVisits(filters: LogFilters): Promise<Page<SessionLog>> {
  return apiRequest<Page<SessionLog>>(`${BASE}/logs/visits`, { query: filters });
}

export function fetchActiveUsers(filters: LogFilters): Promise<Page<SessionLog>> {
  return apiRequest<Page<SessionLog>>(`${BASE}/logs/active`, { query: filters });
}

export function fetchEmployeeLog(id: number, filters: LogFilters): Promise<EmployeeLogDetail> {
  return apiRequest<EmployeeLogDetail>(`${BASE}/logs/employees/${id}`, { query: filters });
}
