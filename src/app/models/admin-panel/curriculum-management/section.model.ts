  // course.model.ts

import { PaginatedResponse } from "../../pagination.model";

// MARK: - This model is for Admin Model
  export interface SectionData {
    id: number;
    section_name: string;
  }

  export type SectionModel = PaginatedResponse<SectionData>;