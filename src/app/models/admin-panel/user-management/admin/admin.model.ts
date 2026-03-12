  // admin.model.ts

  import { PaginatedResponse } from "../../../pagination.model";
// MARK: - This model is for Admin Details Model
  export interface AdminDetailResponse {
  success: boolean;
  message: string;
  data: AdminData;
}

  export interface Role {
    id: number;
    role_name: string;
  }
// MARK: - This model is for Admin Model
  export interface AdminData {
    student_name: string;
    id: number;
    full_name: string;
    email: string;
    mobile_number: string;
    username: string;
    password: string;
    image_path: string | null;
    status: string; 
    role: Role;
    created_at: string; 
    updated_at: string;
  }

  export type AdminModel = PaginatedResponse<AdminData>;