export interface CreateStudentPayload {               
  full_name?: string;
  email?: string;
  mobile_number?: string;
  username?: string;
  password?: string;
}
export interface DeleteStudentPayload {
  id: number[];
}