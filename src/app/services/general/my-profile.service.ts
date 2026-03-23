import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TokenStorageService } from '../../core/services/token-storage.service';
import {
  ApiResponse,
  AdminProfile,
  ProfessorProfile,
  StudentProfile,
  ParentProfile,
} from '../../models/general/my-profile/my-profile.model';

export enum MyProfileEndPoints {
  updateAdminProfile = 'update/admin/{id}',
  updateProfessorProfile = 'update/professor/{id}',
  updateStudentProfile = 'update/student/{id}',
  updateParentProfile = 'update/parent/{id}',
}

export type UpdateAdminProfileResponse = AdminProfile;
export type UpdateProfessorProfileResponse = ProfessorProfile;
export type UpdateStudentProfileResponse = StudentProfile;
export type UpdateParentProfileResponse = ParentProfile;

@Injectable({
  providedIn: 'root',
})
export class ParentStudentService {
  private http = inject(HttpClient);
  private storage = inject(TokenStorageService);

  private baseAPIUrl = `${environment.apiUrl}`;
  fileAPIUrl = `${environment.fileUrl}`;

  private readonly updateAdminUrl = `${this.baseAPIUrl}${MyProfileEndPoints.updateAdminProfile}`;
  private readonly updateProfessorUrl = `${this.baseAPIUrl}${MyProfileEndPoints.updateProfessorProfile}`;
  private readonly updateStudentUrl = `${this.baseAPIUrl}${MyProfileEndPoints.updateStudentProfile}`;
  private readonly updateParentUrl = `${this.baseAPIUrl}${MyProfileEndPoints.updateParentProfile}`;

  private authHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: this.storage.getToken() ? `Bearer ${this.storage.getToken()}` : '',
      Accept: 'application/json',
    });
  }

  updateAdmin(
    id: number,
    payload: UpdateAdminProfileResponse,
    imageFile?: File | null,
  ): Observable<UpdateAdminProfileResponse> {
    const url = this.updateAdminUrl.replace('{id}', String(id));
    const fd = new FormData();
    fd.append('_method', 'PATCH');
    fd.append('full_name', payload.full_name ?? '');

    if (imageFile) {
      fd.append('image_path', imageFile);
    }
    return this.http.post<UpdateAdminProfileResponse>(url, fd, {
      headers: this.authHeaders(),
    });
  }
  updateProfessor(
    id: number,
    payload: UpdateProfessorProfileResponse,
    imageFile?: File | null,
  ): Observable<UpdateProfessorProfileResponse> {
    const url = this.updateProfessorUrl.replace('{id}', String(id));
    const fd = new FormData();
    fd.append('_method', 'PATCH');
    fd.append('full_name', payload.full_name ?? '');

    if (imageFile) {
      fd.append('image_path', imageFile);
    }
    return this.http.post<UpdateProfessorProfileResponse>(url, fd, {
      headers: this.authHeaders(),
    });
  }

  updateStudent(
    id: number,
    payload: UpdateStudentProfileResponse,
    imageFile?: File | null,
  ): Observable<UpdateStudentProfileResponse> {
    const url = this.updateStudentUrl.replace('{id}', String(id));
    const fd = new FormData();
    fd.append('_method', 'PATCH');
    fd.append('first_name', payload.first_name ?? '');
    fd.append('last_name', payload.last_name ?? '');

    if (imageFile) {
      fd.append('image_path', imageFile);
    }
    return this.http.post<UpdateStudentProfileResponse>(url, fd, {
      headers: this.authHeaders(),
    });
  }

  updateParent(
    id: number,
    payload: UpdateParentProfileResponse,
    imageFile?: File | null,
  ): Observable<UpdateParentProfileResponse> {
    const url = this.updateParentUrl.replace('{id}', String(id));
    const fd = new FormData();
    fd.append('_method', 'PATCH');
    fd.append('first_name', payload.first_name ?? '');
    fd.append('last_name', payload.last_name ?? '');

    if (imageFile) {
      fd.append('image_path', imageFile);
    }
    return this.http.post<UpdateParentProfileResponse>(url, fd, {
      headers: this.authHeaders(),
    });
  }
}
