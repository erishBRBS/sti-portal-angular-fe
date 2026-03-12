export interface CreateProfessorPayload {               
  full_name?: string;
  email?: string;
  mobile_number?: string;
  username?: string;
  password?: string;
}
export interface DeleteProfessorPayload {
  id: number[];
}