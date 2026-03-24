import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenStorageService } from '../../../core/services/token-storage.service';
import {
  ApiResponse,
  StudentScheduleItem,
} from '../../../models/ats/student/student.model';

export enum StudentScheduleEndPoints {
  getMySchedules = 'get/schedule/student/my-schedules',
}

export type GetMySchedulesResponse = ApiResponse<StudentScheduleItem[]>;

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private http = inject(HttpClient);
  private storage = inject(TokenStorageService);

  private baseAPIUrl = `${environment.apiUrl}`;
  private readonly getMySchedulesUrl = `${this.baseAPIUrl}${StudentScheduleEndPoints.getMySchedules}`;

  private authHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: this.storage.getToken()
        ? `Bearer ${this.storage.getToken()}`
        : '',
      Accept: 'application/json',
    });
  }

  getMySchedules(): Observable<GetMySchedulesResponse> {
    return this.http.get<GetMySchedulesResponse>(this.getMySchedulesUrl, {
      headers: this.authHeaders(),
    });
  }
}