export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
  total?: number;
  page?: number;
  limit?: number;
  pageCount?: number;
}
