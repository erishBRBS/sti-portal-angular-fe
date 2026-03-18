import { ParentData } from "../models/admin-panel/user-management/parent/parent.model";
import { ProfessorData } from "../models/admin-panel/user-management/professor/professor.model";
import { DetailModalConfig } from "../shared/components/view-details/view-details.component";
import { DateHelper } from "./date.helper";

export function createProfessorDetailConfig(
  data: ProfessorData,
  imageURL: string  
): DetailModalConfig {
  return {
    title: 'Professor Details',
    showProfile: true,
    profileImage: imageURL + data.image_path,
    fields: [
      { label: 'Professor Name', value: data.professor_name },
      { label: 'Email', value: data.email_address },
      { label: 'Mobile Number', value: data.mobile_number },
      { label: 'Username', value: data.username },
      { label: 'status', value: data.status },
      { label: 'Created', value: DateHelper.formatDateTime(data.created_at), },
    ],
  };
}