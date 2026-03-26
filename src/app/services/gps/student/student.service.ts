import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenStorageService } from '../../../core/services/token-storage.service';
import {
  ApiResponse,
  StudentGradeItem,
} from '../../../models/gps/student/student.model';

export enum StudentGradeEndPoints {
  getMyGrades = 'get/student/my-grades',
}

export type GetMyGradesResponse = ApiResponse<StudentGradeItem[]>;

@Injectable({
  providedIn: 'root',
})
export class StudentGradeService {
  private http = inject(HttpClient);
  private storage = inject(TokenStorageService);

  private baseAPIUrl = `${environment.apiUrl}`;
  private readonly getMyGradesUrl = `${this.baseAPIUrl}${StudentGradeEndPoints.getMyGrades}`;

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

  getMyGrades(): Observable<GetMyGradesResponse> {
    return this.http.get<GetMyGradesResponse>(this.getMyGradesUrl, {
      headers: this.authHeaders(),
    });
  }
}