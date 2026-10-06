export type AdminUser = {
  id: number;
  name: string | null;
  email: string;
  role: string;
  active: boolean;
  lastLogin: string | null;
  createdAt: string | null;
};

export type LoginResponse = {
  accessToken: string;
  expiresInSeconds: number;
  admin: AdminUser;
};

export type Page<T> = {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
};

export type CreateAdminInput = {
  name: string;
  email: string;
  password: string;
  role: string;
  active: boolean;
};

export type UpdateAdminInput = {
  name?: string;
  role?: string;
  active?: boolean;
  password?: string;
};

export type SellerSummary = {
  id: number;
  sellerUniqueId: string | null;
  name: string;
  businessName: string | null;
  email: string | null;
  mobile: string | null;
  status: string | null;
  kycVerified: boolean;
  createdAt: string | null;
};

export type SellerDetail = {
  id: number;
  sellerUniqueId: string | null;
  name: string;
  businessName: string | null;
  businessType: string | null;
  sellerCategory: string | null;
  email: string | null;
  mobile: string | null;
  city: string | null;
  state: string | null;
  status: string | null;
  emailVerified: boolean;
  mobileVerified: boolean;
  profileCompleted: boolean;
  kycCompleted: boolean;
  kycVerified: boolean;
  kycVerifiedAt: string | null;
  adminRemarks: string | null;
  lastLoginAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

/** A value is null when the backend could not count it (for example a missing table). */
export type LogEmployee = {
  id: number;
  name: string | null;
  email: string | null;
  role: string | null;
};

export type LogSummary = {
  totalAdmins: number;
  activeNow: number;
  loginsToday: number;
  visitsToday: number;
  successfulLogins: number;
  failedLogins: number;
  activitiesToday: number;
  productsUpdatedToday: number;
  ordersUpdatedToday: number;
  averageSession: string | null;
};

export type ActivityLog = {
  id: number;
  employeeId: number | null;
  name: string | null;
  email: string | null;
  role: string | null;
  action: string;
  module: string | null;
  entityType: string | null;
  entityId: string | null;
  record: string | null;
  description: string | null;
  page: string | null;
  changeSummary: string | null;
  visitId: number | null;
  sessionLabel: string | null;
  createdAt: string | null;
  loginAt?: string | null;
  lastActivityAt?: string | null;
  logoutAt?: string | null;
  sessionStatus?: string | null;
  sessionDuration?: string | null;
  ipAddress?: string | null;
};

export type SessionLog = {
  id: number;
  employeeId: number | null;
  name: string | null;
  email: string | null;
  role: string | null;
  eventType?: string | null;
  failureReason?: string | null;
  visitId?: number | null;
  sessionLabel: string | null;
  loginStatus?: string | null;
  createdAt?: string | null;
  startedAt?: string | null;
  loginAt: string | null;
  lastActivityAt: string | null;
  logoutAt: string | null;
  sessionDuration: string | null;
  status: string | null;
  currentPage?: string | null;
};

export type EmployeeLogDetail = {
  employee: { id: number; name: string | null; email: string | null; role: string | null };
  firstLogin: string | null;
  lastActivity: string | null;
  logoutAt: string | null;
  sessionDuration: string | null;
  activityCount: number;
  modules: string[];
  actionCounts: { action: string; count: number }[];
  timeline: Page<ActivityLog>;
};

export type DashboardStats = {
  totalAdmins: number | null;
  activeAdmins: number | null;
  superAdmins: number | null;
  totalSellers: number | null;
  activeSellers: number | null;
  pendingSellers: number | null;
  totalProducts: number | null;
  pendingProducts: number | null;
  totalOrders: number | null;
  totalCustomers: number | null;
};
