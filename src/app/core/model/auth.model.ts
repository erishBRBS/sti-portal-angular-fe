export type RoleName = 'Admin' | 'Student' | 'Teacher' | string;

export interface UserROle {
  id: number;
  role_name: RoleName;
  is_deleted: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  full_name: string;
  email: string;
  mobile_number: string | null;
  username: string | null;
  status: string;
  is_deleted: number;
  image_path: string | null;
  user_role_id: number;
  created_at: string;
  updated_at: string;
  role: UserROle;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface SessionUser {
  id: number;
  full_name: string;
  email: string;
  role_name: RoleName;
  user_role_id: number;
}