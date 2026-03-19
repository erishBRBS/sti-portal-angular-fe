import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { Observable } from "rxjs";
import { AdminData, AdminDetailResponse, AdminModel } from "../../../../models/admin-panel/user-management/admin/admin.model";
import { CreateParentPayload } from "../../../../payloads/admin-panel/user-management/parent/create-parent.payload";
import { ApiResponse, ApiResponseNoData } from "../../../../models/pagination.model";
import { StudentModel } from "../../../../models/admin-panel/user-management/student/student.model";
import { ProfessorData, ProfessorModel } from "../../../../models/admin-panel/user-management/professor/professor.model";
import { DeletePayload } from "../../../../payloads/common.payload";
import { ParentModel } from "../../../../models/admin-panel/user-management/parent/parent.model";
import { TokenStorageService } from "../../../../core/services/token-storage.service";

export enum ParentEndPoints {
  getParent = 'get/parent',
  createParent = 'create/parent',
  updateParent = 'update/parent/{id}',   
  getParentById = 'get/parent/{id}',
  deleteParent = 'delete/parent',
  importSection = 'import/section'
}

export type ParentResponse = ApiResponse<ProfessorData>;
export type DeleteParentResponse = ApiResponseNoData;

@Injectable({
  providedIn: 'root',
})

export class ParentService {
  private http = inject(HttpClient);
  private storage = inject(TokenStorageService);

  private baseAPIUrl = `${environment.apiUrl}`;
  fileAPIUrl = `${environment.fileUrl}`;
  token = `${environment.temp_token}`;

  private readonly getParentUrl = `${this.baseAPIUrl}${ParentEndPoints.getParent}`;
  private readonly createParentUrl = `${this.baseAPIUrl}${ParentEndPoints.createParent}`;
  private readonly getParentByIdUrl = `${this.baseAPIUrl}${ParentEndPoints.getParentById}`;
  private readonly updateParentUrl = `${this.baseAPIUrl}${ParentEndPoints.updateParent}`;
  private readonly deleteParentUrl = `${this.baseAPIUrl}${ParentEndPoints.deleteParent}`;

  private authHeaders(): HttpHeaders {
  //  const token = localStorage.getItem('access_token'); 
  //  const token = '2|Mh08c6p0j4tzzbdZgAHIPJuEHs4PqhpvhrCaS8Ztd5840140';
    return new HttpHeaders({
      Authorization: this.storage.getToken() ? `Bearer ${this.storage.getToken()}` : '',
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

  createParent(payload: CreateParentPayload, imageFile?: File | null): Observable<ParentResponse> {
    const fd = new FormData();
    fd.append('first_name', payload.first_name ?? '');
    fd.append('middle_name', payload.middle_name ?? '');
    fd.append('last_name', payload.last_name ?? '');
    fd.append('email', payload.email ?? '');
    fd.append('username', payload.username ?? '');
    fd.append('password', payload.password ?? '');

     if (payload.password) {
    fd.append('password', payload.password);
  }

  if (imageFile) {
    fd.append('image_path', imageFile);
  }

    return this.http.post<ParentResponse>(this.createParentUrl, fd, {
      headers: this.authHeaders(),
    });
  }
  updateParent(id: number, payload: CreateParentPayload, imageFile?: File | null): Observable<ParentResponse> {

  const url = this.updateParentUrl.replace('{id}', String(id));

  const fd = new FormData();
  fd.append('first_name', payload.first_name ?? '');
  fd.append('middle_name', payload.middle_name ?? '');
  fd.append('last_name', payload.last_name ?? ''); 
  fd.append('email', payload.email ?? '');
  fd.append('username', payload.username ?? '');

  if (payload.password) {
    fd.append('password', payload.password);
  }

  if (imageFile) {
    fd.append('image_path', imageFile);
  }

return this.http.patch<ParentResponse>(url, fd, {
  headers: this.authHeaders(),
});
}
  deleteParent(payload: DeletePayload): Observable<DeleteParentResponse> {
    return this.http.post<DeleteParentResponse>(this.deleteParentUrl, payload, {
      headers: this.authHeaders().set('Content-Type', 'application/json'),
    });
  }

      importParent(file: File) {
      const fd = new FormData();
      fd.append('file', file);
    
      return this.http.post<ApiResponseNoData>(
        `${this.baseAPIUrl}${ParentEndPoints.importSection}`,
        fd,
        { headers: this.authHeaders() }
      );
    }
}