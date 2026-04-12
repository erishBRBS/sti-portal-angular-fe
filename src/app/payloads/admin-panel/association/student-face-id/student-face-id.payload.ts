export interface EnrollFaceIDPayload {
    student_no?: string;
    full_name?: string;
    images: File[];
}

export interface DeleteFaceIDPayload {
  ids: number[];
}