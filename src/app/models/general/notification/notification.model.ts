export interface NotificationData {
  id: number;
  announcement_id: number;
  headline: string;
  description: string;
}

export interface NotificationListResponse {
  success: boolean;
  message: string;
  data: NotificationData[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}