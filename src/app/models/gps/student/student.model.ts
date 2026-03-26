export interface StudentGradeStudent {
  id: number | null;
  student_id?: string | null;
  full_name?: string | null;
}

export interface StudentGradeSchedule {
  id: number | null;
  subject?: StudentScheduleSubject | null;
  professor?: StudentScheduleProfessor | null;
  section?: StudentScheduleSection | null;
  academic_year?: StudentScheduleAcademicYear | null;
}

export interface StudentGradeItem {
  id: number;
  student?: StudentGradeStudent | null;
  schedule?: StudentGradeSchedule | null;
  prelim_grade?: string | null;
  midterm_grade?: string | null;
  pre_finals_grade?: string | null;
  finals_grade?: string | null;
  final_average?: string | null;
  final_grade?: string | null;
  status?: string | null;
}

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

export interface StudentAttendanceStudent {
  id: number | null;
  name?: string | null;
}

export interface StudentAttendanceSchedule {
  id: number | null;
  day?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  subject?: StudentScheduleSubject | null;
  professor?: StudentScheduleProfessor | null;
}

export interface StudentAttendanceItem {
  id: number;
  student?: StudentAttendanceStudent | null;
  schedule?: StudentAttendanceSchedule | null;
  status?: string | null;
  time_in?: string | null;
  time_out?: string | null;
  created_at: string;
}

export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface ApiResponse<T> {
  success?: boolean;
  message: string;
  data: T;
}

export interface PaginatedApiResponse<T> extends ApiResponse<T> {
  pagination?: PaginationMeta;
}