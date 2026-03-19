import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { Observable } from "rxjs";
import { AdminData, AdminDetailResponse, AdminModel } from "../../../../models/admin-panel/user-management/admin/admin.model";
import { CreateAdminPayload, DeleteAdminPayload } from "../../../../payloads/admin-panel/user-management/admin/create-admin.payload";
import { ApiResponse, ApiResponseNoData } from "../../../../models/pagination.model";
import { TokenStorageService } from "../../../../core/services/token-storage.service";

export enum AdminEndPoints {
  getAdmin = 'get/admin',
  createAdmin = 'create/admin',
  updateAdmin = 'update/admin/{id}',
  getAdminById = 'get/admin/{id}',
  deleteAdmin = 'delete/admin',
  importSection = 'import/admin'
}

export type CreateAdminResponse = ApiResponse<AdminData>;
export type DeleteAdminResponse = ApiResponseNoData;

@Injectable({
  providedIn: 'root',
})

export class AdminService {
  private http = inject(HttpClient);
  private storage = inject(TokenStorageService);

  private baseAPIUrl = `${environment.apiUrl}`;
  fileAPIUrl = `${environment.fileUrl}`;
  token = `${environment.temp_token}`;

  private readonly getAdminUrl = `${this.baseAPIUrl}${AdminEndPoints.getAdmin}`;
  private readonly createAdminUrl = `${this.baseAPIUrl}${AdminEndPoints.createAdmin}`;
  private readonly updateAdminUrl = `${this.baseAPIUrl}${AdminEndPoints.updateAdmin}`;
  private readonly getAdminByIdUrl = `${this.baseAPIUrl}${AdminEndPoints.getAdminById}`;
  private readonly deleteAdminUrl = `${this.baseAPIUrl}${AdminEndPoints.deleteAdmin}`;

  private authHeaders(): HttpHeaders {
  //  const token = localStorage.getItem('access_token'); 
  //  const token = '2|Mh08c6p0j4tzzbdZgAHIPJuEHs4PqhpvhrCaS8Ztd5840140';
    return new HttpHeaders({
      Authorization: this.storage.getToken() ? `Bearer ${this.storage.getToken()}` : '',
      Accept: 'application/json',
    });
  }

 getAdminById(id: number) {
    const url = this.getAdminByIdUrl.replace('{id}', String(id));
    return this.http.get<AdminDetailResponse>(url, {
      headers: this.authHeaders(),
    });
  }

  getAdmins(page = 1, perPage = 10): Observable<AdminModel> {
    const params = new HttpParams()
      .set('page', page)
      .set('per_page', perPage);

    return this.http.get<AdminModel>(this.getAdminUrl, {
      headers: this.authHeaders(),
      params,
    });
  }

  createAdmin(payload: CreateAdminPayload, imageFile?: File | null): Observable<CreateAdminResponse> {
    const fd = new FormData();
    fd.append('full_name', payload.full_name ?? '');
    fd.append('email', payload.email ?? '');
    fd.append('mobile_number', payload.mobile_number ?? '');
    fd.append('username', payload.username ?? '');
    fd.append('password', payload.password ?? '');

    if (imageFile) {
      fd.append('image_path', imageFile); 
    }

    return this.http.post<CreateAdminResponse>(this.createAdminUrl, fd, {
      headers: this.authHeaders(),
    });
  }

  updateAdmin(id: number, payload: CreateAdminPayload, imageFile?: File | null): Observable<CreateAdminResponse> {
    const url = this.updateAdminUrl.replace('{id}', String(id));
    const fd = new FormData();
    fd.append('_method', 'PATCH');
    fd.append('full_name', payload.full_name ?? '');
    fd.append('email', payload.email ?? '');
    fd.append('mobile_number', payload.mobile_number ?? '');
    fd.append('username', payload.username ?? '');
    fd.append('password', payload.password ?? '');

    if (imageFile) {
      fd.append('image_path', imageFile); 
    }

    return this.http.post<CreateAdminResponse>(url, fd, {
      headers: this.authHeaders(),
    });
  }

  deleteAdmins(payload: DeleteAdminPayload): Observable<DeleteAdminResponse> {
    return this.http.post<DeleteAdminResponse>(this.deleteAdminUrl, payload, {
      headers: this.authHeaders().set('Content-Type', 'application/json'),
    });
  }

        importAdmin(file: File) {
        const fd = new FormData();
        fd.append('file', file);
      
        return this.http.post<ApiResponseNoData>(
          `${this.baseAPIUrl}${AdminEndPoints.importSection}`,
          fd,
          { headers: this.authHeaders() }
        );
      }
}