import { apiRequest } from "./api";
import type {
  AdminUser,
  CreateAdminInput,
  DashboardStats,
  LoginResponse,
  Page,
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
