import { inject, Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { Observable } from "rxjs";
import { TokenStorageService } from "../../../core/services/token-storage.service";
import {
  ApiResponse,
  ParentChild,
  ParentChildSchedule,
  ParentChildGrade,
} from "../../../models/gps/parent/parent.model";

export enum ParentStudentEndPoints {
  getMyChildren = 'get/my-children',
  getChildSchedules = 'get/child-schedules',
  getChildGrades = 'get/child-grades',
}

export type GetMyChildrenResponse = ApiResponse<ParentChild[]>;
export type GetChildSchedulesResponse = ApiResponse<ParentChildSchedule[]>;
export type GetChildGradesResponse = ApiResponse<ParentChildGrade[]>;

@Injectable({
  providedIn: 'root',
})
export class ParentStudentService {
  private http = inject(HttpClient);
  private storage = inject(TokenStorageService);

  private baseAPIUrl = `${environment.apiUrl}`;
  fileAPIUrl = `${environment.fileUrl}`;
  token = `${environment.temp_token}`;

  private readonly getMyChildrenUrl = `${this.baseAPIUrl}${ParentStudentEndPoints.getMyChildren}`;
  private readonly getChildSchedulesUrl = `${this.baseAPIUrl}${ParentStudentEndPoints.getChildSchedules}`;
  private readonly getChildGradesUrl = `${this.baseAPIUrl}${ParentStudentEndPoints.getChildGrades}`;

  private authHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: this.storage.getToken() ? `Bearer ${this.storage.getToken()}` : '',
      Accept: 'application/json',
    });
  }

  getMyChildren(): Observable<GetMyChildrenResponse> {
    return this.http.get<GetMyChildrenResponse>(this.getMyChildrenUrl, {
      headers: this.authHeaders(),
    });
  }

  getChildSchedules(studentId: number, academicYearId?: number): Observable<GetChildSchedulesResponse> {
    let params = new HttpParams().set('student_id', studentId);

    if (academicYearId) {
      params = params.set('academic_year_id', academicYearId);
    }

    return this.http.get<GetChildSchedulesResponse>(this.getChildSchedulesUrl, {
      headers: this.authHeaders(),
      params,
    });
  }

  getChildGrades(studentId: number, academicYearId?: number, subjectId?: number): Observable<GetChildGradesResponse> {
    let params = new HttpParams().set('student_id', studentId);

    if (academicYearId) {
      params = params.set('academic_year_id', academicYearId);
    }

    if (subjectId) {
      params = params.set('subject_id', subjectId);
    }

    return this.http.get<GetChildGradesResponse>(this.getChildGradesUrl, {
      headers: this.authHeaders(),
      params,
    });
  }
}