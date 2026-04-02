export interface AcademicYear {
  id: number;
  academic_year: string;
  semester: string;
}

export interface Section {
  id: number;
  section_name: string;
}

export interface Professor {
  id: number;
  professor_name: string;
}

export interface Subject {
  id: number;
  subject_code: string;
  subject_name: string;
}

export interface ProfessorSchedule {
  id: number;
  course_code: string;
  academic_year: AcademicYear;
  section: Section;
  professor: Professor;
  subject: Subject;
  day: string;
  start_time: string;
  end_time: string;
  duration: string;
  room: string;
}

export interface ProfessorSubject {
  id: number;
  subject_code?: string;
  subject_name?: string;
  course_code?: string;
  section_name?: string;
}

export interface ProfessorStudent {
  id: number;
  first_name: string;
  last_name: string;
  middle_name?: string | null;
  full_name?: string;
  section?: Section;
  course_code?: string;
}

export interface ProfessorAttendanceAnalytics {
  labels: string[];
  present: number[];
  late: number[];
  absent: number[];
}

export interface AttendanceStudent {
  id: number;
  name: string;
  section?: AttendanceSection | null;
}

export interface AttendanceSubject {
  id: number;
  subject_code: string;
  subject_name: string;
}

export interface AttendanceProfessor {
  id: number;
  professor_name: string;
}

export interface AttendanceSection {
  id: number;
  section_name: string;
}

export interface AttendanceSchedule {
  id: number;
  day: string;
  start_time: string;
  end_time: string;
  subject: AttendanceSubject;
  professor: AttendanceProfessor;
}

export interface ProfessorAttendanceRecord {
  id: number;
  student: AttendanceStudent;
  schedule: AttendanceSchedule;
  status: 'Present' | 'Late' | 'Absent' | string;
  time_in: string | null;
  time_out: string | null;
  created_at: string;
}



export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}