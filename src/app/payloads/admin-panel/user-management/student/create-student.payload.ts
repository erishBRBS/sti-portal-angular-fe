export interface CreateStudentPayload {
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  student_no: string;
  mobile_number?: string;
  course_id: number;
  section_id: number;
  year_level?: string; 
  username?: string;     
  rfid_code?: string; 
}
export interface DeleteStudentPayload {
  id: number[];
}