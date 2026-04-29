  // student.model.ts
import { PaginatedResponse } from "../../../pagination.model";

export interface Course {
  id: number;
  course_name: string;
}

export interface Section {
  id: number;
  section_name: string;
}

export interface StudentCredentials {
  username: string;
  rfid_code: string;
}

export interface StudentData {
  id: number;
  first_name: string;
  last_name: string;
  middle_name: string | null;
  student_no: string;
  email: string;
  mobile_number: string | null;
  course: Course;
  section: Section;
  year_level: string;
  image_path: string | null;
  status: string;
  credentials: StudentCredentials;
  created_at: string; 
  updated_at: string;
}

export type StudentModel = PaginatedResponse<StudentData>;