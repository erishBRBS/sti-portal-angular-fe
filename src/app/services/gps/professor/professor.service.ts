import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenStorageService } from '../../../core/services/token-storage.service';
import {
  CreateStudentGradeResponse,
  GetStudentGradesResponse,
} from '../../../models/gps/professor/professor.model';
import { CreateStudentGradePayload } from '../../../payloads/gps/professor/professor.payload';

export enum GradePortalEndPoints {
  createStudentGrade = 'create/student',
  getStudentGrades = 'get/student-grade', 
  updateStudentGrade = 'update/student-grade',
}

@Injectable({
  providedIn: 'root',
})
export class GradePortalService {
  private http = inject(HttpClient);
  private storage = inject(TokenStorageService);

  private baseAPIUrl = `${environment.apiUrl}`;

  private readonly createStudentGradeUrl = `${this.baseAPIUrl}${GradePortalEndPoints.createStudentGrade}`;
  private readonly getStudentGradesUrl = `${this.baseAPIUrl}${GradePortalEndPoints.getStudentGrades}`;
  private readonly updateStudentGradeUrl = `${this.baseAPIUrl}${GradePortalEndPoints.updateStudentGrade}`;

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

  getStudentGrades(): Observable<GetStudentGradesResponse> {
    return this.http.get<GetStudentGradesResponse>(this.getStudentGradesUrl, {
      headers: this.authHeaders(),
    });
  }

  createStudentGrade(
    payload: CreateStudentGradePayload
  ): Observable<CreateStudentGradeResponse> {
    return this.http.post<CreateStudentGradeResponse>(
      this.createStudentGradeUrl,
      payload,
      {
        headers: this.authHeaders(),
      }
    );
  }

  updateStudentGrade(
    id: number,
    payload: CreateStudentGradePayload
  ): Observable<CreateStudentGradeResponse> {
    return this.http.patch<CreateStudentGradeResponse>(
      `${this.updateStudentGradeUrl}/${id}`,
      payload,
      {
        headers: this.authHeaders(),
      }
    );
  }
}