import {
  AnnouncementPriority,
  AnnouncementStatus,
} from '../../../models/admin-panel/announcement/announcement.model';

export interface CreateAnnouncementPayload {
  title: string;
  description: string;
  priority: AnnouncementPriority;
  status: AnnouncementStatus;
  attachment?: File | null;
}