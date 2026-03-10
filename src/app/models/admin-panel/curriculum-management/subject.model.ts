  // subject.model.ts

import { PaginatedResponse } from "../../pagination.model";

// MARK: - This model is for Admin Model
  export interface SubjectData {
    id: number;
    subject_code: string;
    subject_name: string;
    created_at: string; 
    updated_at: string;
  }

  export type SubjectModel = PaginatedResponse<SubjectData>;