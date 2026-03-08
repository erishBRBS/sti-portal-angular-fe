import { PaginatedResponse } from "../../../pagination.model";

export interface ParentData {
  id: number;
  first_name: string;
  last_name: string;
  middle_name: string;
  email: string;
  username: string;
  image_path: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export type ParentModel = PaginatedResponse<ParentData>;