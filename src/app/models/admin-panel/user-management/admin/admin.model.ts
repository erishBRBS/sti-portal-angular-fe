// admin.model.ts

import { PaginatedResponse } from "../../../pagination.model";

export interface Role {
  id: number;
  role_name: string;
}

export interface AdminData {
  id: number;
  full_name: string;
  email: string;
  mobile_number: string;
  username: string;
  image_path: string | null;
  status: string; 
  role: Role;
  created_at: string; 
  updated_at: string;
}

export type AdminModel = PaginatedResponse<AdminData>;