export interface ParentChildSection {
  id: number | null;
  section_name: string | null;
}

export interface ParentChildCourse {
  id: number | null;
  course_name: string | null;
}

export interface ParentChild {
  id: number;
  full_name: string;
  year_level: string | number | null;
  section: ParentChildSection | null;
  course: ParentChildCourse | null;
}

export interface ParentAcademicYear {
  id: number | null;
  academic_year?: string | null;
  semester?: string | null;
}

export interface ParentScheduleProfessor {
  id: number | null;
  professor_name?: string | null;
  full_name?: string | null;
}

export interface ParentScheduleSubject {
  id: number | null;
  subject_code?: string | null;
  subject_name?: string | null;
}

export interface ParentChildSchedule {
  id: number;
  course_code?: string | null;
  day: string;
  start_time: string;
  end_time: string;
  duration?: string | null;
  room?: string | null;
  subject?: ParentScheduleSubject | null;
  professor?: ParentScheduleProfessor | null;
  section?: {
    id: number | null;
    section_name?: string | null;
  } | null;
  academic_year?: ParentAcademicYear | null;
}

export interface ParentChildGrade {
  id: number;
  prelim_grade?: string | number | null;
  midterm_grade?: string | number | null;
  pre_finals_grade?: string | number | null;
  finals_grade?: string | number | null;
  final_average?: string | number | null;
  final_grade?: string | number | null;
  remarks?: string | null;
  status?: string | null;
  student?: {
    id: number | null;
    student_id?: string | null;
    full_name?: string | null;
  } | null;
  schedule?: {
    id: number | null;
    subject?: ParentScheduleSubject | null;
    professor?: ParentScheduleProfessor | null;
    section?: {
      id: number | null;
      section_name?: string | null;
    } | null;
    academic_year?: ParentAcademicYear | null;
  } | null;
}

export interface ApiResponse<T> {
  success?: boolean;
  message: string;
  data: T;
}