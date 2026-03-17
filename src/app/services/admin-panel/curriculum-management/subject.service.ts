import { inject, Injectable } from "@angular/core";
import { ApiResponse, ApiResponseNoData } from "../../../models/pagination.model";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { CourseData, CourseModel } from "../../../models/admin-panel/curriculum-management/course.model";
import { Observable } from "rxjs";
import { CreateSubjectPayload } from "../../../payloads/admin-panel/curriculum/subject/create-subject.payload";
import { DeletePayload } from "../../../payloads/common.payload";
import { SubjectData, SubjectModel } from "../../../models/admin-panel/curriculum-management/subject.model";
import { TokenStorageService } from "../../../core/services/token-storage.service";

export enum SubjectEndPoints {
  getSubject = 'get/subject',
  createSubject = 'create/course',
  getSubjectById = 'get/course/{id}',
  updateSubject = 'update/subject/{id}',
  deleteSubject = 'delete/course',
}

export type SubjectResponse = ApiResponse<SubjectData>;
export type DeleteSubjectResponse = ApiResponseNoData;

@Injectable({
  providedIn: 'root',
})

export class SubjectService {
  private http = inject(HttpClient);
  private storage = inject(TokenStorageService);

  private baseAPIUrl = `${environment.apiUrl}`;
  fileAPIUrl = `${environment.fileUrl}`;
  token = `${environment.temp_token}`;

  private readonly getSubjectUrl = `${this.baseAPIUrl}${SubjectEndPoints.getSubject}`;
  private readonly createSubjectUrl = `${this.baseAPIUrl}${SubjectEndPoints.createSubject}`;
  private readonly getSubjectByIdUrl = `${this.baseAPIUrl}${SubjectEndPoints.getSubjectById}`;
  private readonly deleteSubjectUrl = `${this.baseAPIUrl}${SubjectEndPoints.deleteSubject}`;

  private authHeaders(): HttpHeaders {
  //  const token = localStorage.getItem('access_token'); 
  //   const token = '2|Mh08c6p0j4tzzbdZgAHIPJuEHs4PqhpvhrCaS8Ztd5840140';
    return new HttpHeaders({
       Authorization: this.storage.getToken() ?? '',
      Accept: 'application/json',
    });
  }

 getSubjectById(id: number) {
    const url = this.getSubjectByIdUrl.replace('{id}', String(id));
    return this.http.get<SubjectResponse>(url, {
      headers: this.authHeaders(),
    });
  }

  getSubject(page = 1, perPage = 10): Observable<SubjectModel> {
    const params = new HttpParams()
      .set('page', page)
      .set('per_page', perPage);

    return this.http.get<SubjectModel>(this.getSubjectUrl, {
      headers: this.authHeaders(),
      params,
    });
  }

createSubject(payload: CreateSubjectPayload): Observable<SubjectResponse> {
  const fd = new FormData();
  fd.append('subject_code', payload.subject_code);
  fd.append('subject_name', payload.subject_name);

  return this.http.post<SubjectResponse>(this.createSubjectUrl, fd, {
    headers: this.authHeaders(),
  });
}
updateSubject(id: number, payload: CreateSubjectPayload): Observable<SubjectResponse> {
  const url = `${this.baseAPIUrl}/update/subject/${id}`;

  const fd = new FormData();
  fd.append('subject_code', payload.subject_code);
  fd.append('subject_name', payload.subject_name);

  return this.http.post<SubjectResponse>(url, fd, {
    headers: this.authHeaders(),
  });
}
  deleteSubject(payload: DeletePayload): Observable<DeleteSubjectResponse> {
    return this.http.post<DeleteSubjectResponse>(this.deleteSubjectUrl, payload, {
      headers: this.authHeaders().set('Content-Type', 'application/json'),
    });
  }
}