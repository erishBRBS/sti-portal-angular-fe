import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { TokenStorageService } from '../../../core/services/token-storage.service';
import { ApiResponse } from '../../../models/pagination.model';

export type AttendanceResponse = ApiResponse<any>;

export enum GateAttendanceEndpoints {
  recordRFID = 'ats/attendance/rfid',
  getMyAttendance = 'get/attendance/my-attendance',
  getGateMonitoring = 'get/gate-monitoring',
  getAttendanceAnalytics = 'get/attendance/analytics',
}

@Injectable({
  providedIn: 'root',
})
export class GateAttendanceService {
  private http = inject(HttpClient);
  private storage = inject(TokenStorageService);

  private baseAPIUrl = `${environment.apiUrl}`;

  private endpoints = {
    recordRFID: `${this.baseAPIUrl}${GateAttendanceEndpoints.recordRFID}`,
    myAttendance: `${this.baseAPIUrl}${GateAttendanceEndpoints.getMyAttendance}`,
    gateMonitoring: `${this.baseAPIUrl}${GateAttendanceEndpoints.getGateMonitoring}`,
    analytics: `${this.baseAPIUrl}${GateAttendanceEndpoints.getAttendanceAnalytics}`,
  };

  private authHeaders(): HttpHeaders {
    const token = this.storage.getToken();

    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
      Accept: 'application/json',
    });
  }

  // 🔹 RFID Tap (Time In/Out)
  recordRFIDAttendance(rfidCode: string): Observable<AttendanceResponse> {
    const params = new HttpParams().set('rfid_code', rfidCode);

    return this.http.post<AttendanceResponse>(
      this.endpoints.recordRFID,
      {},
      {
        headers: this.authHeaders(),
        params,
      }
    );
  }

  // 🔹 Student View (own attendance)
  getMyAttendance(page = 1, perPage = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page)
      .set('per_page', perPage);

    return this.http.get<any>(this.endpoints.myAttendance, {
      headers: this.authHeaders(),
      params,
    });
  }

  // 🔹 ADMIN: Gate Monitoring (MAIN TABLE)
  getGateMonitoring(params?: any): Observable<any> {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach((key) => {
        const value = params[key];
        if (value !== null && value !== undefined && value !== '') {
          httpParams = httpParams.set(key, value);
        }
      });
    }

    return this.http.get<any>(this.endpoints.gateMonitoring, {
      headers: this.authHeaders(),
      params: httpParams,
    });
  }

  // 🔹 Analytics / Dashboard
  getAttendanceAnalytics(): Observable<any> {
    return this.http.get<any>(this.endpoints.analytics, {
      headers: this.authHeaders(),
    });
  }
}