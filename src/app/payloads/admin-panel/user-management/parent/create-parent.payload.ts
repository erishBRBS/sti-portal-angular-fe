export interface CreateParentPayload {               
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  email?: string;
  username?: string;
  password?: string;
}
export interface DeleteAParentPayload {
  id: number[];
}