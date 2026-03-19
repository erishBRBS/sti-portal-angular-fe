  // course.model.ts

import { PaginatedResponse } from "../../pagination.model";

// MARK: - This model is for Admin Model
  export interface CourseData {
    id: number;
    course_name: string;


  }

  export type CourseModel = PaginatedResponse<CourseData>;