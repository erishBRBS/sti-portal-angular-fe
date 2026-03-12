export interface CreateStudentPayload {               
  full_name?: string;
  email?: string;
  mobile_number?: string;
  username?: string;
  password?: string;
  course?: string;
  year_level?: string;
  section?: string;
}
export interface DeleteStudentPayload {
  id: number[];
}