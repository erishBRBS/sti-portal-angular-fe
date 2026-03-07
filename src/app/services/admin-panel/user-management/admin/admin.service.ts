import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { Observable } from "rxjs";
import { AdminData, AdminDetailResponse, AdminModel } from "../../../../models/admin-panel/user-management/admin/admin.model";
import { CreateAdminPayload, DeleteAdminPayload } from "../../../../payloads/admin-panel/user-management/admin/create-admin.payload";
import { ApiResponse, ApiResponseNoData } from "../../../../models/pagination.model";

export enum AdminEndPoints {
  getAdmin = '/get/admin',
  createAdmin = '/create/admin',
  getAdminById = '/get/admin/{id}',
  deleteAdmin = '/delete/admin',
}

export type CreateAdminResponse = ApiResponse<AdminData>;
export type DeleteAdminResponse = ApiResponseNoData;

@Injectable({
  providedIn: 'root',
})

export class AdminService {
  private http = inject(HttpClient);
  private baseAPIUrl = `${environment.apiUrl}`;
  fileAPIUrl = `${environment.fileUrl}`;

  private readonly getAdminUrl = `${this.baseAPIUrl}${AdminEndPoints.getAdmin}`;
  private readonly createAdminUrl = `${this.baseAPIUrl}${AdminEndPoints.createAdmin}`;
  private readonly getAdminByIdUrl = `${this.baseAPIUrl}${AdminEndPoints.getAdminById}`;
  private readonly deleteAdminUrl = `${this.baseAPIUrl}${AdminEndPoints.deleteAdmin}`;

  private authHeaders(): HttpHeaders {
  //  const token = localStorage.getItem('access_token'); 
    const token = '123|HJt9hEXjJqqBht4v82vNsjD7o6cEWtSbWn7DmfHJ449c0c5c';
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
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

  deleteAdmins(payload: DeleteAdminPayload): Observable<DeleteAdminResponse> {
    return this.http.post<DeleteAdminResponse>(this.deleteAdminUrl, payload, {
      headers: this.authHeaders().set('Content-Type', 'application/json'),
    });
  }
}