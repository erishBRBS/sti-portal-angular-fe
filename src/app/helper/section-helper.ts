// section.helper.ts

import { SectionData } from "../models/admin-panel/curriculum-management/section.model";
import { DetailModalConfig } from "../shared/components/view-details/view-details.component";

export function createASectionDetailConfig(
  data: SectionData,
  imageURL: string
): DetailModalConfig {
  return {
    title: 'Section Details',
    showProfile: false,
    profileImage: imageURL,
    fields: [
      { label: 'Section Name', value: data.section_name },
    ],
  };
}