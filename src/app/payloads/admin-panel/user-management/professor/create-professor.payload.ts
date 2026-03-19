export interface CreateProfessorPayload {               
  professor_name?: string;
  email?: string;
  username?: string;
  password?: string;
  mobile_number: string; 
  department_id: number; 
  user_role_id: number;
}
export interface DeleteProfessorPayload {
  id: number[];
}