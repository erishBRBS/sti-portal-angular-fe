import { inject, Injectable } from '@angular/core';
import { ApiResponse, ApiResponseNoData } from '../../../models/pagination.model';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  CourseData,
  CourseModel,
} from '../../../models/admin-panel/curriculum-management/course.model';
import { Observable } from 'rxjs';
import { CreateSectionPayload } from '../../../payloads/admin-panel/curriculum/section/create-section.payload';
import { DeletePayload } from '../../../payloads/common.payload';
import {
  SectionData,
  SectionModel,
} from '../../../models/admin-panel/curriculum-management/section.model';
import { TokenStorageService } from '../../../core/services/token-storage.service';

export enum SectionEndPoints {
  getSection = 'get/section',
  createSection = 'create/section',
  getSectionById = 'get/section/{id}',
  updateSection = 'update/section/{id}',
  deleteSection = 'delete/section',
  bulkUploadSection = 'bulk-upload/sections',
  listAllSection = 'list-all/section',
}

export type SectionResponse = ApiResponse<SectionData>;
export type DeleteSectionResponse = ApiResponseNoData;
export type bulkUploadSectionResponse = ApiResponseNoData;
export type SectionListAllResponse = ApiResponse<SectionData[]>;

@Injectable({
  providedIn: 'root',
})
export class SectionService {
  private http = inject(HttpClient);
  private storage = inject(TokenStorageService);

  private baseAPIUrl = `${environment.apiUrl}`;
  fileAPIUrl = `${environment.fileUrl}`;
  token = `${environment.temp_token}`;

  private readonly getSectionUrl = `${this.baseAPIUrl}${SectionEndPoints.getSection}`;
  private readonly createSectiontUrl = `${this.baseAPIUrl}${SectionEndPoints.createSection}`;
  private readonly getSectionByIdUrl = `${this.baseAPIUrl}${SectionEndPoints.getSectionById}`;
  private readonly updateSectionUrl = `${this.baseAPIUrl}${SectionEndPoints.updateSection}`;
  private readonly deleteSectionUrl = `${this.baseAPIUrl}${SectionEndPoints.deleteSection}`;
  private readonly bulkUploadSectionUrl = `${this.baseAPIUrl}${SectionEndPoints.bulkUploadSection}`;
  private readonly listAllSectionUrl = `${this.baseAPIUrl}${SectionEndPoints.listAllSection}`;

  private authHeaders(): HttpHeaders {
    //  const token = localStorage.getItem('access_token');
    //   const token = '2|Mh08c6p0j4tzzbdZgAHIPJuEHs4PqhpvhrCaS8Ztd5840140';
    return new HttpHeaders({
      Authorization: this.storage.getToken() ? `Bearer ${this.storage.getToken()}` : '',
      Accept: 'application/json',
    });
  }

  getSectionById(id: number) {
    const url = this.getSectionByIdUrl.replace('{id}', String(id));
    return this.http.get<SectionResponse>(url, {
      headers: this.authHeaders(),
    });
  }

  getSection(page = 1, perPage = 10): Observable<SectionModel> {
    const params = new HttpParams().set('page', page).set('per_page', perPage);

    return this.http.get<SectionModel>(this.getSectionUrl, {
      headers: this.authHeaders(),
      params,
    });
  }

  createSection(payload: CreateSectionPayload): Observable<SectionResponse> {
    const fd = new FormData();
    fd.append('section_name', payload.section_name);

    return this.http.post<SectionResponse>(this.createSectiontUrl, fd, {
      headers: this.authHeaders(),
    });
  }
  updateSection(id: number, payload: CreateSectionPayload): Observable<SectionResponse> {
    const url = this.updateSectionUrl.replace('{id}', String(id));

    const fd = new FormData();
    fd.append('section_name', payload.section_name);

    return this.http.post<SectionResponse>(url, fd, {
      headers: this.authHeaders(),
    });
  }

  deleteSection(payload: DeletePayload): Observable<DeleteSectionResponse> {
    return this.http.post<DeleteSectionResponse>(this.deleteSectionUrl, payload, {
      headers: this.authHeaders().set('Content-Type', 'application/json'),
    });
  }

  bulkUploadSection(file: File): Observable<bulkUploadSectionResponse> {
    const fd = new FormData();
    fd.append('file', file);

    return this.http.post<bulkUploadSectionResponse>(this.bulkUploadSectionUrl, fd, {
      headers: this.authHeaders(),
    });
  }

  listAllSection(): Observable<SectionListAllResponse> {
    return this.http.get<SectionListAllResponse>(this.listAllSectionUrl, {
      headers: this.authHeaders(),
    });
  }
}
