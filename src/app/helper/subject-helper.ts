// subject.helper.ts

import { SubjectData } from "../models/admin-panel/curriculum-management/subject.model";
import { DetailModalConfig } from "../shared/components/view-details/view-details.component";
import { DateHelper } from "./date.helper";

export function createASubjectDetailConfig(
  data: SubjectData,
  imageURL: string
): DetailModalConfig {
  return {
    title: 'Subject Details',
    showProfile: false,
    profileImage: imageURL,
    fields: [
      { label: 'Subject Code', value: data.subject_code },
      { label: 'Subject Name', value: data.subject_name },

      // optional but recommended

    ],
  };
}