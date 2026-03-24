// schedule.helper.ts

import { ScheduleData } from "../models/admin-panel/curriculum-management/schedule.model";
import { DetailModalConfig } from "../shared/components/view-details/view-details.component";
import { TimeHelper } from "./time-helper";

export function createAScheduleDetailConfig(
  data: ScheduleData,
  imageURL: string
): DetailModalConfig {
  return {
    title: 'Schedule Details',
    showProfile: false,
    profileImage: imageURL,
    fields: [
      { label: 'Course Code', value: data.course_code },

      { label: 'Section', value: data.section?.section_name },
      { label: 'Professor', value: data.professor?.professor_name },

      {
        label: 'Subject',
        value: `${data.subject?.subject_code} - ${data.subject?.subject_name}`
      },

      { label: 'Year Level', value: data.subject?.year_level },

      { label: 'Day', value: data.day },

      {
        label: 'Time',
         value: `${TimeHelper.formatTo12Hour(data.start_time)} - ${TimeHelper.formatTo12Hour(data.end_time)}`
      },

      { label: 'Duration', value: data.duration },
      { label: 'Room', value: data.room },
    ],
  };
}