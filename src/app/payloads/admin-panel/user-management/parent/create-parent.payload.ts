export interface CreateParentPayload {               
  full_name?: string;
  email?: string;
  mobile_number?: string;
  username?: string;
  password?: string;
}
export interface DeleteAParentPayload {
  id: number[];
}