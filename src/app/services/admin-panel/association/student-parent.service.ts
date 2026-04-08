import { inject, Injectable } from '@angular/core';
import { ApiResponse, ApiResponseNoData } from '../../../models/pagination.model';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { AssignStudentParentPayload } from '../../../payloads/admin-panel/association/student-parent/student-parent.payload';
import {
  AssignStudentParentModelData,
  AssignStudentParentModel,
} from '../../../models/admin-panel/association/student-parent.model';
import { DeletePayload } from '../../../payloads/common.payload';
import { TokenStorageService } from '../../../core/services/token-storage.service';

export enum AttachStudentParentEndPoints {
  getStudentParents = 'get/attach/student-to-parent',
  createStudentParent = 'create/attach/student-to-parent',
  getStudentParentById = 'get/attach/student-to-parent/{id}',
  updateStudentParent = 'update/attach/student-to-parent/{id}',
  deleteStudentParent = 'delete/attach/student-to-parent',
}

export type AssignStudentParentResponse = ApiResponse<AssignStudentParentModelData>;
export type DeleteAssignStudentParentResponse = ApiResponseNoData;

@Injectable({
  providedIn: 'root',
})
export class StudentParentService {
  private http = inject(HttpClient);
  private storage = inject(TokenStorageService);

  private baseAPIUrl = `${environment.apiUrl}`;
  //   fileAPIUrl = `${environment.fileUrl}`;
  token = `${environment.temp_token}`;

  private readonly getStudentParentUrl = `${this.baseAPIUrl}${AttachStudentParentEndPoints.getStudentParents}`;
  private readonly createStudentParentUrl = `${this.baseAPIUrl}${AttachStudentParentEndPoints.createStudentParent}`;
  private readonly getStudentParentByIdUrl = `${this.baseAPIUrl}${AttachStudentParentEndPoints.getStudentParentById}`;
  private readonly updateStudentParentUrl = `${this.baseAPIUrl}${AttachStudentParentEndPoints.updateStudentParent}`;
  private readonly deleteStudentParentUrl = `${this.baseAPIUrl}${AttachStudentParentEndPoints.deleteStudentParent}`;

  private authHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: this.storage.getToken() ? `Bearer ${this.storage.getToken()}` : '',
      Accept: 'application/json',
    });
  }

  getStudentParentById(id: number) {
    const url = this.getStudentParentByIdUrl.replace('{id}', String(id));
    return this.http.get<AssignStudentParentResponse>(url, {
      headers: this.authHeaders(),
    });
  }

  getStudentParent(page = 1, perPage = 10): Observable<AssignStudentParentModel> {
    const params = new HttpParams().set('page', page).set('per_page', perPage);

    return this.http.get<AssignStudentParentModel>(this.getStudentParentUrl, {
      headers: this.authHeaders(),
      params,
    });
  }

  createStudentParent(
    payload: AssignStudentParentPayload,
  ): Observable<AssignStudentParentResponse> {
    return this.http.post<AssignStudentParentResponse>(this.createStudentParentUrl, payload, {
      headers: this.authHeaders().set('Content-Type', 'application/json'),
    });
  }
  updateStudentParent(
    id: number,
    payload: AssignStudentParentPayload,
  ): Observable<AssignStudentParentResponse> {
    const url = this.updateStudentParentUrl.replace('{id}', String(id));
    return this.http.post<AssignStudentParentResponse>(url, payload, {
      headers: this.authHeaders().set('Content-Type', 'application/json'),
    });
  }

  deleteStudentParent(payload: DeletePayload): Observable<DeleteAssignStudentParentResponse> {
    return this.http.post<DeleteAssignStudentParentResponse>(this.deleteStudentParentUrl, payload, {
      headers: this.authHeaders().set('Content-Type', 'application/json'),
    });
  }

  //   importStudentParent(file: File) {
  //     const fd = new FormData();
  //     fd.append('file', file);

  //     return this.http.post<ApiResponseNoData>(
  //       `${this.baseAPIUrl}${StudentParentEndPoints.importStudentParent}`,
  //       fd,
  //       { headers: this.authHeaders() },
  //     );
  //   }
}
