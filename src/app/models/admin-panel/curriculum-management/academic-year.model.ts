import { PaginatedResponse } from "../../pagination.model";

// MARK: - This model is for Admin Model
  export interface AcademicYearData {
    id: number;
    academic_year: string;
    semester: string;
  }

  export type AcademicYearModel = PaginatedResponse<AcademicYearData>;