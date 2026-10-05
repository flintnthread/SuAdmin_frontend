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
