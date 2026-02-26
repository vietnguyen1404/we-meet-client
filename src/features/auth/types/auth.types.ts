export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface RefreshResponse {
  accessToken: string;
}
