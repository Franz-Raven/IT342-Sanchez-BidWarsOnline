export interface AuthResponse {
  accessToken: string;
  userEmail: string;
  message: string;
  username: string;
}

export interface ErrorResponse {
  error?: string;
  message?: string;
}