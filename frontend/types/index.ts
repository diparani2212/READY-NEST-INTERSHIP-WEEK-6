export interface SystemHealthResponse {
  success: boolean;
  service: string;
  status: string;
  database: {
    connected: boolean;
    error: string | null;
  };
  timestamp: string;
}
