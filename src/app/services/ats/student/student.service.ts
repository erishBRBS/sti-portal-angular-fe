import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenStorageService } from '../../../core/services/token-storage.service';
import {
  ApiResponse,
  PaginatedApiResponse,
  StudentAttendanceItem,
  StudentScheduleItem,
} from '../../../models/ats/student/student.model';

export enum StudentScheduleEndPoints {
  getMySchedules = 'get/schedule/student/my-schedules',
  getMyAttendance = 'get/attendance/my-attendance',
}

export type GetMySchedulesResponse = ApiResponse<StudentScheduleItem[]>;
export type GetMyAttendanceResponse = PaginatedApiResponse<StudentAttendanceItem[]>;

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private http = inject(HttpClient);
  private storage = inject(TokenStorageService);

  private baseAPIUrl = `${environment.apiUrl}`;
  private readonly getMySchedulesUrl = `${this.baseAPIUrl}${StudentScheduleEndPoints.getMySchedules}`;
  private readonly getMyAttendanceUrl = `${this.baseAPIUrl}${StudentScheduleEndPoints.getMyAttendance}`;

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

  getMyAttendance(): Observable<GetMyAttendanceResponse> {
    return this.http.get<GetMyAttendanceResponse>(this.getMyAttendanceUrl, {
      headers: this.authHeaders(),
    });
  }
}