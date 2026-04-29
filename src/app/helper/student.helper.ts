import { StudentData } from "../models/admin-panel/user-management/student/student.model";
import { DetailModalConfig } from "../shared/components/view-details/view-details.component";
import { DateHelper } from "./date.helper";

export function createStudentDetailConfig(
  data: StudentData,
  imageURL: string  
): DetailModalConfig {
  return {
    title: 'Student Details',
    showProfile: true,
    profileImage: imageURL + data.image_path,
    fields: [
      { label: 'First Name', value: data.first_name },
      { label: 'Middle Name', value: data.middle_name },
      { label: 'Last Name', value: data.last_name },
      { label: 'Email', value: data.email },
      { label: 'Contact Number', value: data.contact_number },
      { label: 'Course', value: data.course.course_name },
      { label: 'Section', value: data.section.section_name },
      { label: 'Year Level', value: data.year_level },
      { label: 'Status', value: data.status },
      { label: 'Username', value: data.credentials.username },
      { label: 'RFID Code', value: data.credentials.rfid_code },
      { label: 'Created', value: DateHelper.formatDateTime(data.created_at), },
    ],
  };
}