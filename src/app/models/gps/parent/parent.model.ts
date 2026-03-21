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

export interface ParentChildSchedule {
  id: number;
  day: string;
  start_time: string;
  end_time: string;
  room?: string | null;
  subject?: {
    id: number;
    subject_code?: string | null;
    subject_name?: string | null;
  } | null;
  professor?: {
    id: number;
    full_name?: string | null;
  } | null;
  section?: {
    id: number;
    section_name?: string | null;
  } | null;
  academic_year?: {
    id: number;
    academic_year?: string | null;
    semester?: string | null;
  } | null;
}

export interface ParentChildGrade {
  id: number;
  prelim_grade?: string | number | null;
  midterm_grade?: string | number | null;
  final_grade?: string | number | null;
  remarks?: string | null;
  student?: {
    id: number;
    full_name?: string | null;
  } | null;
  schedule?: {
    id: number;
    subject?: {
      id: number;
      subject_code?: string | null;
      subject_name?: string | null;
    } | null;
    professor?: {
      id: number;
      full_name?: string | null;
    } | null;
    section?: {
      id: number;
      section_name?: string | null;
    } | null;
    academic_year?: {
      id: number;
      academic_year?: string | null;
      semester?: string | null;
    } | null;
  } | null;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}