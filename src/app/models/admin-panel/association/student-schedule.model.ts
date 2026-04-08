export interface AssignStudent {
  id: number;
  first_name: string;
  last_name: string;
  middle_name?: string | null;
  email?: string | null;
  contact_number?: string | null;
  course_id?: number | null;
  section_id?: number | null;
  course?: {
    id: number;
    course_name: string;
  } | null;
  section?: {
    id: number;
    section_name: string;
  } | null;
  year_level?: string | null;
  image_path?: string | null;
  status?: string | null;
  credentials?: {
    username?: string | null;
    rfid_code?: string | null;
  } | null;
  created_at?: string;
  updated_at?: string;
}

export interface AssignSchedule {
  id: number;
  course_code?: string | null;
  academic_year?: {
    id: number;
    academic_year: string;
    semester: string;
  } | null;
  section?: {
    id: number;
    section_name: string;
  } | null;
  professor?: {
    id: number;
    professor_name: string;
  } | null;
  subject?: {
    id: number;
    subject_code?: string | null;
    subject_name: string;
  } | null;
  day?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  duration?: string | null;
  room?: string | null;
}

export interface AssignStudentScheduleModelData {
  id: number;
  student?: AssignStudent | null;
  schedule?: AssignSchedule | null;
}

export interface AssignStudentScheduleModel {
  success: boolean;
  message: string;
  data: AssignStudentScheduleModelData[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface StudentListAllModel {
  success: boolean;
  message: string;
  data: AssignStudent[];
}

export interface ScheduleListAllModel {
  success: boolean;
  message: string;
  data: AssignSchedule[];
}