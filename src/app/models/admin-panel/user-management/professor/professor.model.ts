import { PaginatedResponse } from "../../../pagination.model";

export interface ProfessorData {
  id: number;
  professor_name: string;
  email_address: string;
  mobile_number: string;
  username: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export type ProfessorModel = PaginatedResponse<ProfessorData>;