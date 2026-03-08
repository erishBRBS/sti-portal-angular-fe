import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { Observable } from "rxjs";
import { AdminData, AdminDetailResponse, AdminModel } from "../../../../models/admin-panel/user-management/admin/admin.model";
import { CreateAdminPayload, DeleteAdminPayload } from "../../../../payloads/admin-panel/user-management/admin/create-admin.payload";
import { ApiResponse, ApiResponseNoData } from "../../../../models/pagination.model";
import { StudentModel } from "../../../../models/admin-panel/user-management/student/student.model";
import { ProfessorData, ProfessorModel } from "../../../../models/admin-panel/user-management/professor/professor.model";
import { DeletePayload } from "../../../../payloads/common.payload";
import { ParentModel } from "../../../../models/admin-panel/user-management/parent/parent.model";

export enum ParentEndPoints {
  getParent = '/get/parent',
  createParent = '/create/admin',
  getParentById = '/get/admin/{id}',
  deleteParent = '/delete/admin',
}

export type ParentResponse = ApiResponse<ProfessorData>;
export type DeleteParentResponse = ApiResponseNoData;

@Injectable({
  providedIn: 'root',
})

export class ParentService {
  private http = inject(HttpClient);
  private baseAPIUrl = `${environment.apiUrl}`;
  fileAPIUrl = `${environment.fileUrl}`;
  token = `${environment.temp_token}`;

  private readonly getParentUrl = `${this.baseAPIUrl}${ParentEndPoints.getParent}`;
  private readonly createParentUrl = `${this.baseAPIUrl}${ParentEndPoints.createParent}`;
  private readonly getParentByIdUrl = `${this.baseAPIUrl}${ParentEndPoints.getParentById}`;
  private readonly deleteParentUrl = `${this.baseAPIUrl}${ParentEndPoints.deleteParent}`;

  private authHeaders(): HttpHeaders {
  //  const token = localStorage.getItem('access_token'); 
  //  const token = '2|Mh08c6p0j4tzzbdZgAHIPJuEHs4PqhpvhrCaS8Ztd5840140';
    return new HttpHeaders({
      Authorization: this.token ? `Bearer ${this.token}` : '',
      Accept: 'application/json',
    });
  }

 getParentById(id: number) {
    const url = this.getParentByIdUrl.replace('{id}', String(id));
    return this.http.get<ParentResponse>(url, {
      headers: this.authHeaders(),
    });
  }

  getParent(page = 1, perPage = 10): Observable<ParentModel> {
    const params = new HttpParams()
      .set('page', page)
      .set('per_page', perPage);

    return this.http.get<ParentModel>(this.getParentUrl, {
      headers: this.authHeaders(),
      params,
    });
  }

  createParent(payload: CreateAdminPayload, imageFile?: File | null): Observable<ParentResponse> {
    const fd = new FormData();
    fd.append('full_name', payload.full_name ?? '');
    fd.append('email', payload.email ?? '');
    fd.append('mobile_number', payload.mobile_number ?? '');
    fd.append('username', payload.username ?? '');
    fd.append('password', payload.password ?? '');

    if (imageFile) {
      fd.append('image_path', imageFile); 
    }

    return this.http.post<ParentResponse>(this.createParentUrl, fd, {
      headers: this.authHeaders(),
    });
  }

  deleteParent(payload: DeletePayload): Observable<DeleteParentResponse> {
    return this.http.post<DeleteParentResponse>(this.deleteParentUrl, payload, {
      headers: this.authHeaders().set('Content-Type', 'application/json'),
    });
  }
}