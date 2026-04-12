import { PaginatedResponse } from "../../pagination.model";

export interface FaceRecognitionData {
  id: number;
  student_no: string;
  full_name: string;
  image_paths: string[];
  created_at: string;
  updated_at: string;
}

export type FaceRecognitionModel = PaginatedResponse<FaceRecognitionData>;