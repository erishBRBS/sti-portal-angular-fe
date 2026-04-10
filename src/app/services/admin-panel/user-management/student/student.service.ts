import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import {
  AdminData,
  AdminDetailResponse,
  AdminModel,
} from '../../../../models/admin-panel/user-management/admin/admin.model';
import { CreateStudentPayload } from '../../../../payloads/admin-panel/user-management/student/create-student.payload';
import { DeleteStudentPayload } from '../../../../payloads/admin-panel/user-management/student/create-student.payload';
import { ApiResponse, ApiResponseNoData } from '../../../../models/pagination.model';
import {
  StudentData,
  StudentModel,
} from '../../../../models/admin-panel/user-management/student/student.model';
import { TokenStorageService } from '../../../../core/services/token-storage.service';

export enum StudentEndPoints {
  getStudent = 'get/student',
  listAllStudent = 'list-all/student',
  createStudent = 'create/student',
  updateStudent = 'update/student/{id}',
  getStudentById = 'get/student/{id}',
  deleteStudent = 'delete/student',
  bulkUploadStudent = 'bulk-upload/students',
}

export type StudentResponse = ApiResponse<StudentData>;
export type DeleteStudentResponse = ApiResponseNoData;
export type bulkUploadStudentResponse = ApiResponseNoData;

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private http = inject(HttpClient);
  private storage = inject(TokenStorageService);

  private baseAPIUrl = `${environment.apiUrl}`;
  fileAPIUrl = `${environment.fileUrl}`;
  token = `${environment.temp_token}`;

  private readonly getStudentUrl = `${this.baseAPIUrl}${StudentEndPoints.getStudent}`;
  private readonly listAllStudentUrl = `${this.baseAPIUrl}${StudentEndPoints.listAllStudent}`;
  private readonly createStudentUrl = `${this.baseAPIUrl}${StudentEndPoints.createStudent}`;
  private readonly getStudentByIdUrl = `${this.baseAPIUrl}${StudentEndPoints.getStudentById}`;
  private readonly updateStudentUrl = `${this.baseAPIUrl}${StudentEndPoints.updateStudent}`;
  private readonly deleteStudentUrl = `${this.baseAPIUrl}${StudentEndPoints.deleteStudent}`;
  private readonly bulkUploadStudentUrl = `${this.baseAPIUrl}${StudentEndPoints.bulkUploadStudent}`;

  private authHeaders(): HttpHeaders {
    //  const token = localStorage.getItem('access_token');
    //  const token = '2|Mh08c6p0j4tzzbdZgAHIPJuEHs4PqhpvhrCaS8Ztd5840140';
    return new HttpHeaders({
      Authorization: this.storage.getToken() ? `Bearer ${this.storage.getToken()}` : '',
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
    const params = new HttpParams().set('page', page).set('per_page', perPage);

    return this.http.get<StudentModel>(this.getStudentUrl, {
      headers: this.authHeaders(),
      params,
    });
  }

  listAllStudents(): Observable<ApiResponse<StudentData[]>> {
    return this.http.get<ApiResponse<StudentData[]>>(this.listAllStudentUrl, {
      headers: this.authHeaders(),
    });
  }

  createStudent(
    payload: CreateStudentPayload,
    imageFile?: File | null,
  ): Observable<StudentResponse> {
    const fd = new FormData();
    fd.append('first_name', payload.first_name);
    fd.append('middle_name', payload.middle_name ?? '');
    fd.append('last_name', payload.last_name);
    fd.append('email', payload.email);
    fd.append('mobile_number', payload.mobile_number ?? '');
    fd.append('course_id', payload.course_id.toString());
    fd.append('section_id', payload.section_id.toString());
    fd.append('year_level', payload.year_level ?? '');
    fd.append('username', payload.username ?? '');
    fd.append('rfid_code', payload.rfid_code ?? '');

    if (imageFile) {
      fd.append('image_path', imageFile);
    }

    return this.http.post<StudentResponse>(this.createStudentUrl, fd, {
      headers: this.authHeaders(),
    });
  }

  updateStudent(
    id: number,
    payload: CreateStudentPayload,
    selectedFile: File | null,
  ): Observable<StudentResponse> {
    const url = this.updateStudentUrl.replace('{id}', String(id));

    const fd = new FormData();

    fd.append('first_name', payload.first_name);
    fd.append('middle_name', payload.middle_name ?? '');
    fd.append('last_name', payload.last_name);
    fd.append('email', payload.email);
    fd.append('mobile_number', payload.mobile_number ?? '');
    fd.append('course_id', String(payload.course_id));
    fd.append('section_id', String(payload.section_id));
    fd.append('year_level', payload.year_level ?? '');
    fd.append('username', payload.username ?? '');
    fd.append('rfid_code', payload.rfid_code ?? '');

    fd.append('_method', 'PATCH');

    if (selectedFile) {
      fd.append('image_path', selectedFile);
    }

    return this.http.post<StudentResponse>(url, fd, {
      headers: this.authHeaders(),
    });
  }

  deleteStudent(payload: DeleteStudentPayload): Observable<DeleteStudentResponse> {
    return this.http.post<DeleteStudentResponse>(this.deleteStudentUrl, payload, {
      headers: this.authHeaders().set('Content-Type', 'application/json'),
    });
  }

  bulkUploadStudent(file: File): Observable<bulkUploadStudentResponse> {
    const fd = new FormData();
    fd.append('file', file);

    return this.http.post<bulkUploadStudentResponse>(this.bulkUploadStudentUrl, fd, {
      headers: this.authHeaders(),
    });
  }
}
