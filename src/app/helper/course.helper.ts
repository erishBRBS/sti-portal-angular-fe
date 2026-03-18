import { CourseData } from "../models/admin-panel/curriculum-management/course.model";
import { DetailModalConfig } from "../shared/components/view-details/view-details.component";
import { DateHelper } from "./date.helper";

export function createACourseDetailConfig(
  data: CourseData,
  imageURL: string  
): DetailModalConfig {
  return {
    title: 'Course Details',
    showProfile: false,
    profileImage: imageURL,
    fields: [
      { label: 'Course', value: data.course_name },
    ],
  };
}