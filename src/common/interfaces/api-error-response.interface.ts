export interface ApiErrorResponse {
  status: number;
  message: string | string[];
  error: string;
  details?: any;
}
