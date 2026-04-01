import { PaginatedResponse } from '../../pagination.model';

export type AnnouncementPriority = 'High' | 'Normal' | 'Low';
export type AnnouncementStatus = 'Active' | 'Inactive';

export interface AnnouncementData {
  id: number;
  title: string;
  description: string;
  priority: AnnouncementPriority;
  status: AnnouncementStatus;
  attachment?: string;
  is_deleted: number | boolean;
}

export type AnnouncementModel = PaginatedResponse<AnnouncementData>;