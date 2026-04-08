import { inject, Injectable } from '@angular/core';
import { ApiResponse, ApiResponseNoData } from '../../../models/pagination.model';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { DeletePayload } from '../../../payloads/common.payload';
import { TokenStorageService } from '../../../core/services/token-storage.service';
import { AssignStudentSchedulePayload } from '../../../payloads/admin-panel/association/student-schedule/student-schedule.payload';
import {
  AssignStudentScheduleModel,
  AssignStudentScheduleModelData,
} from '../../../models/admin-panel/association/student-schedule.model';

export enum AttachStudentScheduleEndPoints {
  getStudentSchedules = 'get/attach/student-to-schedule',
  createStudentSchedule = 'create/attach/student-to-schedule',
  getStudentScheduleById = 'get/attach/student-to-schedule/{id}',
  updateStudentSchedule = 'update/attach/student-to-schedule/{id}',
  deleteStudentSchedule = 'delete/attach/student-to-schedule',
}

export type AssignStudentScheduleResponse = ApiResponse<AssignStudentScheduleModelData>;
export type DeleteAssignStudentScheduleResponse = ApiResponseNoData;

@Injectable({
  providedIn: 'root',
})
export class StudentScheduleService {
  private http = inject(HttpClient);
  private storage = inject(TokenStorageService);

  private baseAPIUrl = `${environment.apiUrl}`;
  token = `${environment.temp_token}`;

  private readonly getStudentScheduleUrl = `${this.baseAPIUrl}${AttachStudentScheduleEndPoints.getStudentSchedules}`;
  private readonly createStudentScheduleUrl = `${this.baseAPIUrl}${AttachStudentScheduleEndPoints.createStudentSchedule}`;
  private readonly getStudentScheduleByIdUrl = `${this.baseAPIUrl}${AttachStudentScheduleEndPoints.getStudentScheduleById}`;
  private readonly updateStudentScheduleUrl = `${this.baseAPIUrl}${AttachStudentScheduleEndPoints.updateStudentSchedule}`;
  private readonly deleteStudentScheduleUrl = `${this.baseAPIUrl}${AttachStudentScheduleEndPoints.deleteStudentSchedule}`;

  private authHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: this.storage.getToken() ? `Bearer ${this.storage.getToken()}` : '',
      Accept: 'application/json',
    });
  }

  getStudentScheduleById(id: number) {
    const url = this.getStudentScheduleByIdUrl.replace('{id}', String(id));
    return this.http.get<AssignStudentScheduleResponse>(url, {
      headers: this.authHeaders(),
    });
  }

  getStudentSchedule(page = 1, perPage = 10): Observable<AssignStudentScheduleModel> {
    const params = new HttpParams().set('page', page).set('per_page', perPage);

    return this.http.get<AssignStudentScheduleModel>(this.getStudentScheduleUrl, {
      headers: this.authHeaders(),
      params,
    });
  }

  createStudentSchedule(
    payload: AssignStudentSchedulePayload,
  ): Observable<AssignStudentScheduleResponse> {
    return this.http.post<AssignStudentScheduleResponse>(this.createStudentScheduleUrl, payload, {
      headers: this.authHeaders().set('Content-Type', 'application/json'),
    });
  }

  updateStudentSchedule(
    id: number,
    payload: AssignStudentSchedulePayload,
  ): Observable<AssignStudentScheduleResponse> {
    const url = this.updateStudentScheduleUrl.replace('{id}', String(id));
    return this.http.post<AssignStudentScheduleResponse>(url, payload, {
      headers: this.authHeaders().set('Content-Type', 'application/json'),
    });
  }

  deleteStudentSchedule(
    payload: DeletePayload,
  ): Observable<DeleteAssignStudentScheduleResponse> {
    return this.http.post<DeleteAssignStudentScheduleResponse>(this.deleteStudentScheduleUrl, payload, {
      headers: this.authHeaders().set('Content-Type', 'application/json'),
    });
  }
}