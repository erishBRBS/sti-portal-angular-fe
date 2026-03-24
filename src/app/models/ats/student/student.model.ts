export interface StudentScheduleSubject {
  id: number | null;
  subject_code?: string | null;
  subject_name?: string | null;
}

export interface StudentScheduleProfessor {
  id: number | null;
  professor_name?: string | null;
  full_name?: string | null;
}

export interface StudentScheduleSection {
  id: number | null;
  section_name?: string | null;
}

export interface StudentScheduleAcademicYear {
  id: number | null;
  academic_year?: string | null;
  semester?: string | null;
}

export interface StudentScheduleItem {
  id: number;
  day: string;
  start_time: string;
  end_time: string;
  room?: string | null;
  course_code?: string | null;
  subject?: StudentScheduleSubject | null;
  professor?: StudentScheduleProfessor | null;
  section?: StudentScheduleSection | null;
  academic_year?: StudentScheduleAcademicYear | null;
}

export interface ApiResponse<T> {
  success?: boolean;
  message: string;
  data: T;
}