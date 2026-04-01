export type StudentGradeStatus =
  | 'in-progress'
  | 'passed'
  | 'failed'
  | 'dropped'
  | 'incomplete';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface StudentGradeRecord {
  id: number;
  student_id: number;
  schedule_id: number;
  prelim_grade: number | null;
  midterm_grade: number | null;
  pre_finals_grade: number | null;
  finals_grade: number | null;
  status: StudentGradeStatus | null;
  created_at?: string;
  updated_at?: string;
}

export interface ProfessorMyStudent {
  id?: number;
  student_id?: number;
  schedule_id?: number;

  student_name?: string;
  full_name?: string;

  prelim_grade?: number | null;
  midterm_grade?: number | null;
  pre_finals_grade?: number | null;
  finals_grade?: number | null;
  final_grade?: string | number | null;
  status?: StudentGradeStatus | null;

  student?: {
    id?: number;
    student_name?: string;
    full_name?: string;
  };

  schedule?: {
    id?: number;
    subject_id?: number;
    subject?: {
      id?: number;
      subject_code?: string;
      subject_name?: string;
      code?: string;
      name?: string;
    };
    academic_year?: {
      id?: number;
      academic_year?: string;
      semester?: string;
    };
    section?: {
      id?: number;
      section_name?: string;
    };
  };

  subject_id?: number;
  subject_code?: string;
  subject_name?: string;

  academic_year?: string;
  semester?: string;

  section_id?: number;
  section_name?: string;
}

export interface StudentGradeListItem {
  id: number;
  student: {
    id: number;
    student_id: string;
    full_name: string;
  };
  schedule: {
    id: number;
    subject: {
      id: number;
      subject_code: string;
      subject_name: string;
    };
    professor: {
      id: number;
      professor_name: string;
    };
    section: {
      id: number;
      section_name: string;
    };
    academic_year: {
      id: number;
      academic_year: string;
      semester: string;
    };
  };
  prelim_grade: string | number | null;
  midterm_grade: string | number | null;
  pre_finals_grade: string | number | null;
  finals_grade: string | number | null;
  final_average: string | number | null;
  final_grade: string | number | null;
  status: StudentGradeStatus | string | null;
}
export interface StudentGradeListItem {
  id: number;
  student: {
    id: number;
    student_id: string;
    full_name: string;
  };
  schedule: {
    id: number;
    subject: {
      id: number;
      subject_code: string;
      subject_name: string;
    };
    professor: {
      id: number;
      professor_name: string;
    };
    section: {
      id: number;
      section_name: string;
    };
    academic_year: {
      id: number;
      academic_year: string;
      semester: string;
    };
  };
  prelim_grade: string | number | null;
  midterm_grade: string | number | null;
  pre_finals_grade: string | number | null;
  finals_grade: string | number | null;
  final_average: string | number | null;
  final_grade: string | number | null;
  status: StudentGradeStatus | string | null;
}

export type GetMyStudentsResponse = ApiResponse<ProfessorMyStudent[]>;
export type GetStudentGradesResponse = ApiResponse<StudentGradeListItem[]>;
export type CreateStudentGradeResponse = ApiResponse<StudentGradeRecord>;