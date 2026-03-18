import { AdminData } from "../models/admin-panel/user-management/admin/admin.model";
import { DetailModalConfig } from "../shared/components/view-details/view-details.component";
import { DateHelper } from "./date.helper";

export function createAdminDetailConfig(
  data: AdminData,
  imageURL: string  
): DetailModalConfig {
  return {
    title: 'Admin Details',
    showProfile: true,
    profileImage: imageURL + data.image_path,
    fields: [
      { label: 'Full Name', value: data.full_name },
      { label: 'Email', value: data.email },
      { label: 'Mobile Number', value: data.mobile_number },
      { label: 'Username', value: data.username },
      { label: 'Status', value: data.status },
      { label: 'Created', value: DateHelper.formatDateTime(data.created_at), },
    ],
  };
}