import { StudentGradeStatus } from '../../../models/gps/professor/professor.model';

export interface CreateStudentGradePayload {
  student_id: number;
  schedule_id: number;
  prelim_grade?: number | null;
  midterm_grade?: number | null;
  pre_finals_grade?: number | null;
  finals_grade?: number | null;
  status?: StudentGradeStatus | null;
}