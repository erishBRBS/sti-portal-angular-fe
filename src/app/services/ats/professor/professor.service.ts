import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenStorageService } from '../../../core/services/token-storage.service';
import {
  ApiResponse,
  ProfessorSchedule,
  ProfessorStudent,
  ProfessorSubject,
} from '../../../models/ats/professor/professor.model';

export enum ProfessorScheduleEndPoints {
  getMySchedules = 'get/schedule/prof/my-schedules',
  getMySubjects = 'get/schedule/prof/my-subjects',
  getMyStudents = 'get/schedule/prof/my-students',
}

export type GetMySchedulesResponse = ApiResponse<ProfessorSchedule[]>;
export type GetMySubjectsResponse = ApiResponse<ProfessorSubject[]>;
export type GetMyStudentsResponse = ApiResponse<ProfessorStudent[]>;

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

  getMyStudents(): Observable<GetMyStudentsResponse> {
    return this.http.get<GetMyStudentsResponse>(this.getMyStudentsUrl, {
      headers: this.authHeaders(),
    });
  }
}