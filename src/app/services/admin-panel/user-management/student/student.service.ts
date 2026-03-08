import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { Observable } from "rxjs";
import { AdminData, AdminDetailResponse, AdminModel } from "../../../../models/admin-panel/user-management/admin/admin.model";
import { CreateAdminPayload, DeleteAdminPayload } from "../../../../payloads/admin-panel/user-management/admin/create-admin.payload";
import { ApiResponse, ApiResponseNoData } from "../../../../models/pagination.model";
import { StudentModel } from "../../../../models/admin-panel/user-management/student/student.model";

export enum StudentEndPoints {
  getStudent = '/get/student',
  createStudent = '/create/admin',
  getStudentById = '/get/admin/{id}',
  deleteStudent = '/delete/admin',
}

export type StudentResponse = ApiResponse<AdminData>;
export type DeleteStudentResponse = ApiResponseNoData;

@Injectable({
  providedIn: 'root',
})

export class StudentService {
  private http = inject(HttpClient);
  private baseAPIUrl = `${environment.apiUrl}`;
  fileAPIUrl = `${environment.fileUrl}`;
  token = `${environment.temp_token}`;

  private readonly getStudentUrl = `${this.baseAPIUrl}${StudentEndPoints.getStudent}`;
  private readonly createStudentUrl = `${this.baseAPIUrl}${StudentEndPoints.createStudent}`;
  private readonly getStudentByIdUrl = `${this.baseAPIUrl}${StudentEndPoints.getStudentById}`;
  private readonly deleteStudentUrl = `${this.baseAPIUrl}${StudentEndPoints.deleteStudent}`;

  private authHeaders(): HttpHeaders {
  //  const token = localStorage.getItem('access_token'); 
  //  const token = '2|Mh08c6p0j4tzzbdZgAHIPJuEHs4PqhpvhrCaS8Ztd5840140';
    return new HttpHeaders({
      Authorization: this.token ? `Bearer ${this.token}` : '',
      Accept: 'application/json',
    });
  }

 getStudentById(id: number) {
    const url = this.getStudentByIdUrl.replace('{id}', String(id));
    return this.http.get<StudentResponse>(url, {
      headers: this.authHeaders(),
    });
  }

  getStudent(page = 1, perPage = 10): Observable<StudentModel> {
    const params = new HttpParams()
      .set('page', page)
      .set('per_page', perPage);

    return this.http.get<StudentModel>(this.getStudentUrl, {
      headers: this.authHeaders(),
      params,
    });
  }

  createStudent(payload: CreateAdminPayload, imageFile?: File | null): Observable<StudentResponse> {
    const fd = new FormData();
    fd.append('full_name', payload.full_name ?? '');
    fd.append('email', payload.email ?? '');
    fd.append('mobile_number', payload.mobile_number ?? '');
    fd.append('username', payload.username ?? '');
    fd.append('password', payload.password ?? '');

    if (imageFile) {
      fd.append('image_path', imageFile); 
    }

    return this.http.post<StudentResponse>(this.createStudentUrl, fd, {
      headers: this.authHeaders(),
    });
  }

  deleteStudent(payload: DeleteAdminPayload): Observable<DeleteStudentResponse> {
    return this.http.post<DeleteStudentResponse>(this.deleteStudentUrl, payload, {
      headers: this.authHeaders().set('Content-Type', 'application/json'),
    });
  }
}