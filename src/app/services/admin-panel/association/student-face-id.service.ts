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
import {
  DeleteFaceIDPayload,
  EnrollFaceIDPayload,
} from '../../../payloads/admin-panel/association/student-face-id/student-face-id.payload';
import { DeleteStudentPayload } from '../../../payloads/admin-panel/user-management/student/create-student.payload';
import { StudentData } from '../../../models/admin-panel/user-management/student/student.model';
import { FaceRecognitionModel } from '../../../models/admin-panel/association/student-face-id.model';

export enum StudentFaceIDEndPoint {
  // Python API
  recognizedFaceID = 'recognize-face',
  createStudentFaceID = 'enroll-face',
  deleteStudentFaceID = 'delete-face/{id}',

  // laravel API
  getStudentNo = 'get/student/search/by-student-no',
  createStudentFaceIDLaravel = 'create/face-recognation',
  getStudentFaceIDLaravel = 'get/face-recognation',
}

export type StudenFaceIDResponse = ApiResponseNoData;

export type StudentDataResponse = ApiResponse<StudentData>;

@Injectable({
  providedIn: 'root',
})
export class StudentFaceIDService {
  private http = inject(HttpClient);
  private storage = inject(TokenStorageService);

  private pythonUrl = `${environment.pythonUrl}`;
  private baseAPIUrl = `${environment.apiUrl}`;
  fileAPIUrl = `${environment.fileUrl}`;
  token = `${environment.temp_token}`;
  // Python URL
  private readonly recognizedFaceIDUrl = `${this.pythonUrl}${StudentFaceIDEndPoint.recognizedFaceID}`;
  private readonly createStudentFaceIDUrl = `${this.pythonUrl}${StudentFaceIDEndPoint.createStudentFaceID}`;
  private readonly deleteStudentFaceIDUrl = `${this.pythonUrl}${StudentFaceIDEndPoint.deleteStudentFaceID}`;
  // Laravel URL
  private readonly getStudentNoUrl = `${this.baseAPIUrl}${StudentFaceIDEndPoint.getStudentNo}`;
  private readonly createStudentFaceIDLaravelUrl = `${this.baseAPIUrl}${StudentFaceIDEndPoint.createStudentFaceIDLaravel}`;
  private readonly getStudentFaceIDLaravelUrl = `${this.baseAPIUrl}${StudentFaceIDEndPoint.getStudentFaceIDLaravel}`

  private authHeaders(): HttpHeaders {
    return new HttpHeaders({
      // Authorization: this.storage.getToken() ? `Bearer ${this.storage.getToken()}` : '',
      Accept: 'application/json',
      'Content-Type': 'application/json'
    });
  }

  private authHeaderToken(): HttpHeaders {
    return new HttpHeaders({
      Authorization: this.storage.getToken() ? `Bearer ${this.storage.getToken()}` : '',
      Accept: 'application/json',
    });
  }
  // LARAVEL API
  getFaceRecognition(page = 1, perPage = 10): Observable<FaceRecognitionModel> {
    const params = new HttpParams()
      .set('page', page)
      .set('per_page', perPage);

    return this.http.get<FaceRecognitionModel>(this.getStudentFaceIDLaravelUrl, {
      headers: this.authHeaderToken(),
      params,
    });
  }

  getStudentNo(student_no: string): Observable<StudentDataResponse> {
    const params = new HttpParams().set('student_no', student_no);

    return this.http.get<StudentDataResponse>(this.getStudentNoUrl, {
      headers: this.authHeaderToken(),
      params,
    });
  }

  enrollFaceIDLaravel(payload: EnrollFaceIDPayload): Observable<StudenFaceIDResponse> {
    const fd = new FormData();

    fd.append('student_no', payload.student_no?.trim() ?? '');
    fd.append('full_name', payload.full_name?.trim() ?? '');

    payload.images.forEach((file) => {
      fd.append('image_path[]', file, file.name);
    });

    console.log('fd student_no =>', fd.get('student_no'));
    console.log('fd images =>', fd.getAll('images'));

    return this.http.post<StudenFaceIDResponse>(
      this.createStudentFaceIDLaravelUrl,
      fd,
      {
        headers: new HttpHeaders({
          Accept: 'application/json',
          Authorization: `Bearer ${this.storage.getToken()}`,
        }),
      }
    );
  }
  // PYTHO API
  recognizeFaceID(payload: EnrollFaceIDPayload): Observable<StudenFaceIDResponse> {
    const fd = new FormData();

    if (payload.images?.length) {
      payload.images.forEach((file) => {
        fd.append('image_path', file, file.name);
      });
    }

    return this.http.post<StudenFaceIDResponse>(this.recognizedFaceIDUrl, fd, {
      headers: this.authHeaders(),
    });
  }

  enrollFaceID(payload: EnrollFaceIDPayload): Observable<StudenFaceIDResponse> {
    const fd = new FormData();

    fd.append('student_no', payload.student_no?.trim() ?? '');

    payload.images.forEach((file) => {
      fd.append('images', file, file.name);
    });

    console.log('fd student_no =>', fd.get('student_no'));
    console.log('fd images =>', fd.getAll('images'));

    return this.http.post<StudenFaceIDResponse>(
      this.createStudentFaceIDUrl,
      fd,
      {
        headers: new HttpHeaders({
          Accept: 'application/json',
          // Authorization: `Bearer ${token}`, // optional lang kung kailangan
        }),
      }
    );
  }

  deleteStudentFaceID(payload: DeleteFaceIDPayload): Observable<StudenFaceIDResponse> {
    return this.http.post<StudenFaceIDResponse>(this.deleteStudentFaceIDUrl, payload, {
      headers: this.authHeaders(),
    });
  }
}
