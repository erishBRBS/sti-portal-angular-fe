import { PaginatedResponse } from "../../../pagination.model";

export interface ProfessorData {
  id: number;
  full_name: string; 
  email: string;
  mobile_number: string;
  username: string;
  status: string;
  created_at: string;
  updated_at: string;
  image_path?: string;
}

export type ProfessorModel = PaginatedResponse<ProfessorData>;  