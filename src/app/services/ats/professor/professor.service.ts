import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenStorageService } from '../../../core/services/token-storage.service';
import { PaginatedResponse } from '../../../models/pagination.model';
import {
  ApiResponse,
  ProfessorAttendanceAnalytics,
  ProfessorAttendanceRecord,
  ProfessorSchedule,
  ProfessorStudent,
  ProfessorSubject,
} from '../../../models/ats/professor/professor.model';

export enum ProfessorScheduleEndPoints {
  getMySchedules = 'get/schedule/prof/my-schedules',
  getMySubjects = 'get/schedule/prof/my-subjects',
  getMyStudents = 'get/schedule/prof/my-students',
  getAttendanceAnalytics = 'get/attendance/analytics',
  getAttendanceRecords = 'get/attendance/records',
  updateAttendanceStatus = 'update/attendance/rfid',
}

export type GetMySchedulesResponse = ApiResponse<ProfessorSchedule[]>;
export type GetMySubjectsResponse = ApiResponse<ProfessorSubject[]>;
export type GetMyStudentsResponse = ApiResponse<ProfessorStudent[]>;
export type GetAttendanceAnalyticsResponse = ApiResponse<ProfessorAttendanceAnalytics>;
export type GetAttendanceRecordsResponse = PaginatedResponse<ProfessorAttendanceRecord>;
export type UpdateAttendanceStatusResponse = ApiResponse<null>;

@Injectable({
  providedIn: 'root',
})
export class ProfessorService {
  private http = inject(HttpClient);
  private storage = inject(TokenStorageService);

  private baseAPIUrl = `${environment.apiUrl}`;

  private readonly getMySchedulesUrl = `${this.baseAPIUrl}${ProfessorScheduleEndPoints.getMySchedules}`;
  private readonly getMySubjectsUrl = `${this.baseAPIUrl}${ProfessorScheduleEndPoints.getMySubjects}`;
  private readonly getMyStudentsUrl = `${this.baseAPIUrl}${ProfessorScheduleEndPoints.getMyStudents}`;
  private readonly getAttendanceAnalyticsUrl = `${this.baseAPIUrl}${ProfessorScheduleEndPoints.getAttendanceAnalytics}`;
  private readonly getAttendanceRecordsUrl = `${this.baseAPIUrl}${ProfessorScheduleEndPoints.getAttendanceRecords}`;
  private readonly updateAttendanceStatusUrl = `${this.baseAPIUrl}${ProfessorScheduleEndPoints.updateAttendanceStatus}`;

  private authHeaders(): HttpHeaders {
    const token = this.storage.getToken();

    let headers = new HttpHeaders({
      Accept: 'application/json',
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  getMySchedules(): Observable<GetMySchedulesResponse> {
    return this.http.get<GetMySchedulesResponse>(this.getMySchedulesUrl, {
      headers: this.authHeaders(),
    });
  }

  getMySubjects(): Observable<GetMySubjectsResponse> {
    return this.http.get<GetMySubjectsResponse>(this.getMySubjectsUrl, {
      headers: this.authHeaders(),
    });
  }

  getMyStudents(
    subjectId?: number | null,
    sectionId?: number | null
  ): Observable<GetMyStudentsResponse> {
    let params = new HttpParams();

    if (subjectId) {
      params = params.set('subject_id', subjectId);
    }

    if (sectionId) {
      params = params.set('section_id', sectionId);
    }

    return this.http.get<GetMyStudentsResponse>(this.getMyStudentsUrl, {
      headers: this.authHeaders(),
      params,
    });
  }

  getAttendanceAnalytics(
    subjectId?: number | null,
    sectionId?: number | null
  ): Observable<GetAttendanceAnalyticsResponse> {
    let params = new HttpParams();

    if (subjectId) {
      params = params.set('subject_id', subjectId);
    }

    if (sectionId) {
      params = params.set('section_id', sectionId);
    }

    return this.http.get<GetAttendanceAnalyticsResponse>(this.getAttendanceAnalyticsUrl, {
      headers: this.authHeaders(),
      params,
    });
  }

  getAttendanceRecords(
    page: number = 1,
    perPage: number = 10,
    subjectId?: number | null,
    sectionId?: number | null,
    scheduleId?: number | null,
    date?: string | null
  ): Observable<GetAttendanceRecordsResponse> {
    let params = new HttpParams()
      .set('page', page)
      .set('per_page', perPage);

    if (subjectId) {
      params = params.set('subject_id', subjectId);
    }

    if (sectionId) {
      params = params.set('section_id', sectionId);
    }

    if (scheduleId) {
      params = params.set('schedule_id', scheduleId);
    }

    if (date) {
      params = params.set('date', date);
    }

    return this.http.get<GetAttendanceRecordsResponse>(this.getAttendanceRecordsUrl, {
      headers: this.authHeaders(),
      params,
    });
  }

  updateAttendanceStatus(
    attendanceId: number,
    status: 'Present' | 'Late' | 'Absent'
  ): Observable<UpdateAttendanceStatusResponse> {
    const params = new HttpParams().set('status', status);

    return this.http.patch<UpdateAttendanceStatusResponse>(
      `${this.updateAttendanceStatusUrl}/${attendanceId}`,
      {},
      {
        headers: this.authHeaders(),
        params,
      }
    );
  }
}