import type { AccountStatus as AuthAccountStatus, UserRole } from "@/types/auth"

export type AdminAccountStatus = Extract<AuthAccountStatus, "ACTIVE" | "INACTIVE">
export type AdminUserRoleFilter = UserRole | "ALL"
export type AdminUserStatusFilter = AdminAccountStatus | "ALL"

export interface AdminUserListItem {
  id: number
  email: string
  fullName: string
  avatarUrl?: string | null
  role: UserRole
  status: AdminAccountStatus
  emailVerified: boolean
  createdAt?: string | null
}

export interface AdminUserDetail extends AdminUserListItem {
  phoneNumber?: string | null
  address?: string | null
  bio?: string | null
  dateOfBirth?: string | null
  updatedAt?: string | null
  deletedAt?: string | null
}

export interface AdminUsersQuery {
  page: number
  keyword: string
  role: AdminUserRoleFilter
  status: AdminUserStatusFilter
}

export interface AdminUsersQueryParams {
  page: number
  size: number
  keyword?: string
  role?: UserRole
  status?: AdminAccountStatus
}

export interface AdminUserStatusUpdatePayload {
  status: AdminAccountStatus
}