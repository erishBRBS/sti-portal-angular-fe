import { ParentData } from "../models/admin-panel/user-management/parent/parent.model";
import { DetailModalConfig } from "../shared/components/view-details/view-details.component";
import { DateHelper } from "./date.helper";

export function createParentDetailConfig(
  data: ParentData,
  imageURL: string  
): DetailModalConfig {
  return {
    title: 'Parent Details',
    showProfile: true,
    profileImage: imageURL + data.image_path,
    fields: [
      { label: 'First Name', value: data.first_name },
      { label: 'Middle Name', value: data.middle_name },
      { label: 'Last Name', value: data.last_name },
      { label: 'Email', value: data.email },
      { label: 'Username', value: data.username },
      { label: 'Created', value: DateHelper.formatDateTime(data.created_at), },
    ],
  };
}