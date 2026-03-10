import { inject, Injectable } from "@angular/core";
import { ApiResponse, ApiResponseNoData } from "../../../models/pagination.model";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { CourseData, CourseModel } from "../../../models/admin-panel/curriculum-management/course.model";
import { Observable } from "rxjs";
import { CreateAdminPayload } from "../../../payloads/admin-panel/user-management/admin/create-admin.payload";
import { DeletePayload } from "../../../payloads/common.payload";
import { SubjectData, SubjectModel } from "../../../models/admin-panel/curriculum-management/subject.model";

export enum SubjectEndPoints {
  getSubject = '/get/subject',
  createSubject = '/create/course',
  getSubjectById = '/get/course/{id}',
  deleteSubject = '/delete/course',
}

export type SubjectResponse = ApiResponse<SubjectData>;
export type DeleteSubjectResponse = ApiResponseNoData;

@Injectable({
  providedIn: 'root',
})

export class SubjectService {
  private http = inject(HttpClient);
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
      Authorization: this.token ? `Bearer ${this.token}` : '',
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

  createSubject(payload: CreateAdminPayload, imageFile?: File | null): Observable<SubjectResponse> {
    const fd = new FormData();
    fd.append('full_name', payload.full_name ?? '');
    fd.append('email', payload.email ?? '');
    fd.append('mobile_number', payload.mobile_number ?? '');
    fd.append('username', payload.username ?? '');
    fd.append('password', payload.password ?? '');

    if (imageFile) {
      fd.append('image_path', imageFile); 
    }

    return this.http.post<SubjectResponse>(this.createSubjectUrl, fd, {
      headers: this.authHeaders(),
    });
  }

  deleteSubject(payload: DeletePayload): Observable<DeleteSubjectResponse> {
    return this.http.post<DeleteSubjectResponse>(this.deleteSubjectUrl, payload, {
      headers: this.authHeaders().set('Content-Type', 'application/json'),
    });
  }
}