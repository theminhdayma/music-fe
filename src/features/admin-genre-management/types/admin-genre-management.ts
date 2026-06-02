export interface AdminGenreListItem {
  id: number
  name: string
  slug: string
  description?: string | null
  active: boolean
  createdAt?: string | null
  updatedAt?: string | null
  deletedAt?: string | null
}

export type AdminGenreDetail = AdminGenreListItem

export interface AdminGenreQuery {
  page: number
  keyword: string
}

export interface AdminGenreQueryParams {
  page: number
  size: number
  keyword?: string
}

export interface AdminGenreFormValues {
  name: string
  slug: string
  description: string
  isActive: boolean
}
