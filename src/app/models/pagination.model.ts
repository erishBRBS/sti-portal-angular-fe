// pagination.model.ts
export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export type PaginatedResponse<TItem> = ApiResponse<TItem[]> & {
  pagination: PaginationMeta;
};