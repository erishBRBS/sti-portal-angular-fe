export interface CreateSchedulePayload {
  course_id: number;
  section_id: number;
  professor_id: number;
  subject_id: number;
  day: string;
  start_time: string;
  end_time: string;
  duration?: string;
  room: string;
}