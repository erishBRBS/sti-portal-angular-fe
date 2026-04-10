import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { CreateParentPayload } from '../../../../payloads/admin-panel/user-management/parent/create-parent.payload';
import { ApiResponse, ApiResponseNoData } from '../../../../models/pagination.model';
import { DeletePayload } from '../../../../payloads/common.payload';
import { ParentData, ParentModel } from '../../../../models/admin-panel/user-management/parent/parent.model';
import { TokenStorageService } from '../../../../core/services/token-storage.service';

export enum ParentEndPoints {
  getParent = 'get/parent',
  listAllParent = 'list-all/parent',
  createParent = 'create/parent',
  updateParent = 'update/parent/{id}',
  getParentById = 'get/parent/{id}',
  deleteParent = 'delete/parent',
  bulkUploadParent = 'bulk-upload/parents',
}

export type ParentResponse = ApiResponse<ParentData>;
export type ParentListAllResponse = ApiResponse<ParentData[]>;
export type DeleteParentResponse = ApiResponseNoData;
export type bulkUploadParentResponse = ApiResponseNoData;

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
  private readonly listAllParentUrl = `${this.baseAPIUrl}${ParentEndPoints.listAllParent}`;
  private readonly createParentUrl = `${this.baseAPIUrl}${ParentEndPoints.createParent}`;
  private readonly getParentByIdUrl = `${this.baseAPIUrl}${ParentEndPoints.getParentById}`;
  private readonly updateParentUrl = `${this.baseAPIUrl}${ParentEndPoints.updateParent}`;
  private readonly deleteParentUrl = `${this.baseAPIUrl}${ParentEndPoints.deleteParent}`;
  private readonly bulkUploadParentUrl = `${this.baseAPIUrl}${ParentEndPoints.bulkUploadParent}`;

  private authHeaders(): HttpHeaders {
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

  listAllParents(): Observable<ParentListAllResponse> {
    return this.http.get<ParentListAllResponse>(this.listAllParentUrl, {
      headers: this.authHeaders(),
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

  bulkUploadParent(file: File): Observable<bulkUploadParentResponse> {
    const fd = new FormData();
    fd.append('file', file);

    return this.http.post<bulkUploadParentResponse>(
      this.bulkUploadParentUrl,
      fd,
      { headers: this.authHeaders() }
    );
  }
}