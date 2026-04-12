import { PaginatedResponse } from '../../pagination.model';

export type AnnouncementPriority = 'Urgent' | 'High' | 'Normal' | 'Low';
export type AnnouncementStatus = 'Active' | 'Inactive';

export interface AnnouncementData {
  id: number;
  title: string;
  description: string;
  priority: AnnouncementPriority;
  status: AnnouncementStatus;
  attachment?: string;
  is_deleted: number | boolean;

  notification_headline: string;
  notification_description?: string;
}

export type AnnouncementModel = PaginatedResponse<AnnouncementData>;