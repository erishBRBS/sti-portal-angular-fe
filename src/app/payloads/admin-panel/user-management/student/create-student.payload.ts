export interface CreateStudentPayload {
  first_name: string;
  middle_name?: string;
  last_name: string;
  student_no: string;
  email: string;
  contact_number?: string;
  course_id: number;
  section_id: number;
  year_level?: string;
  username?: string;
  rfid_code?: string;
}
export interface DeleteStudentPayload {
  id: number[];
}
