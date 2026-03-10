  // schedule.model.ts

import { PaginatedResponse } from "../../pagination.model";

// MARK: - This model is for Admin Model
 export interface ScheduleSection {
  id: number;
  section_name: string;
}

export interface ScheduleProfessor {
  id: number;
  professor_name: string;
}

export interface ScheduleSubject {
  id: number;
  subject_code: string;
  subject_name: string;
}

export interface ScheduleData {
  id: number;
  course_code: string;
  section: ScheduleSection;
  professor: ScheduleProfessor;
  subject: ScheduleSubject;
  day: string;
  start_time: string;
  end_time: string;
  duration: string;
  room: string;
}

  export type ScheduleModel = PaginatedResponse<ScheduleData>;