export interface AdminProfile {
  id: number;
  full_name: string;
  email?: string | null;
  image_path: string | null;
  user_role_id: number;
}

export interface ProfessorProfile {
  id: number;
  full_name: string;
  email?: string | null;
  image_path: string | null;
  user_role_id: number;
}

export interface StudentProfile {
  id: number;
  first_name: string;
  last_name: string;
  email?: string | null;
  image_path: string | null;
  year_level: string;
  section_id: number;
  user_role_id: number;

  course?: {
    id: number;
    course_name: string;
  } | null;

  section?: {
    id: number;
    section_name: string;
  } | null;
}

export interface ParentProfile {
  id: number;
  first_name: string;
  last_name: string;
  email?: string | null;
  image_path: string | null;
  user_role_id: number;
}

export interface ApiResponse<T> {
  success?: boolean;
  message: string;
  data: T;
}