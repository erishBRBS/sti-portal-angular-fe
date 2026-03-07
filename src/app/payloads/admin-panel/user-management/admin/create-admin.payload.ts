export interface CreateAdminPayload {               
  full_name?: string;
  email?: string;
  mobile_number?: string;
  username?: string;
  password?: string;
}
export interface DeleteAdminPayload {
  id: number[];
}