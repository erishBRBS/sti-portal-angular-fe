import { PaginatedResponse } from '../../pagination.model';

// MARK: - This model is for Admin Model

export interface PersonNameModel {
  id: number;
  first_name: string;
  last_name: string;
}

export interface AssignStudentParentModelData {
  id: number;
  student_id: number;
  student: PersonNameModel;
  parent_id: number;
  parent: PersonNameModel;
}

export type AssignStudentParentModel = PaginatedResponse<AssignStudentParentModelData>;
