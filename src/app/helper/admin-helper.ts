import { AdminData } from "../models/admin-panel/user-management/admin/admin.model";
import { DetailModalConfig } from "../shared/components/view-details/view-details.component";

export function createAdminDetailConfig(
  data: AdminData,
  imageURL: String  
): DetailModalConfig {
  return {
    title: 'Admin Details',
    showProfile: true,
    profileImage: 'assets/images/profile.jpg',
    fields: [
      { label: 'Full Name', value: data.full_name },
      { label: 'Email', value: 'Community engagement' },
      { label: 'Mobile Number', value: '2024-01-02T03:05:00' },
      { label: 'Username', value: 'Eugene S. Marquez, Elena G. Harley' },
      { label: 'Status', value: 'Gender' },
      { label: 'Role', value: '2024-01-02' },
      { label: 'Created', value: 'Seeder' },
    ],
  };
}