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
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  middle_name?: string | null;
  email: string;
  contact_number: string | null;
  username: string | null;
  status: string;
  is_deleted: number;
  image_path: string | null;
  user_role_id: number;
  created_at: string;
  updated_at: string;

  course_id?: number | null;
  section_id?: number | null;
  year_level?: string | null;

  course?: {
    id: number;
    course_name: string;
  } | null;

  section?: {
    id: number;
    section_name: string;
  } | null;

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
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  username?: string | null;
  image_path?: string | null;
  role_name: string;
  user_role_id: number;

  course_id?: number | null;
  section_id?: number | null;
  year_level?: string | null;

  course?: {
    id: number;
    course_name: string;
  } | null;

  section?: {
    id: number;
    section_name: string;
  } | null;
}