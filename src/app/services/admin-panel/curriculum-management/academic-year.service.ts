import { inject, Injectable } from '@angular/core';
import { ApiResponse, ApiResponseNoData } from '../../../models/pagination.model';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  AcademicYearData,
  AcademicYearModel,
} from '../../../models/admin-panel/curriculum-management/academic-year.model';
import { Observable } from 'rxjs';
import { CreateAcademicYearPayload } from '../../../payloads/admin-panel/curriculum/academic-year/academic-year.payload';
import { DeletePayload } from '../../../payloads/common.payload';
import { TokenStorageService } from '../../../core/services/token-storage.service';

export enum AcademicYearEndPoints {
  getAcademicYear = 'get/academic-year',
  createAcademicYear = 'create/academic-year',
  getAcademicYearById = 'get/academic-year/{id}',
  updateAcademicYear = 'update/academic-year/{id}',
  deleteAcademicYear = 'delete/academic-year',
  listAllAcademicYear = 'list-all/academic-year',
}

export type AcademicYearResponse = ApiResponse<AcademicYearData>;
export type AcademicYearListAllResponse = ApiResponse<AcademicYearData[]>;
export type DeleteAcademicYearResponse = ApiResponseNoData;

@Injectable({
  providedIn: 'root',
})
export class AcademicYearService {
  private http = inject(HttpClient);
  private storage = inject(TokenStorageService);

  private baseAPIUrl = `${environment.apiUrl}`;
  fileAPIUrl = `${environment.fileUrl}`;
  token = `${environment.temp_token}`;

  private readonly getAcademicYearUrl = `${this.baseAPIUrl}${AcademicYearEndPoints.getAcademicYear}`;
  private readonly createAcademicYeartUrl = `${this.baseAPIUrl}${AcademicYearEndPoints.createAcademicYear}`;
  private readonly getAcademicYearByIdUrl = `${this.baseAPIUrl}${AcademicYearEndPoints.getAcademicYearById}`;
  private readonly updateAcademicYearUrl = `${this.baseAPIUrl}${AcademicYearEndPoints.updateAcademicYear}`;
  private readonly deleteAcademicYeartUrl = `${this.baseAPIUrl}${AcademicYearEndPoints.deleteAcademicYear}`;
  private readonly listAllAcademicYeartUrl = `${this.baseAPIUrl}${AcademicYearEndPoints.listAllAcademicYear}`;

  private authHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: this.storage.getToken() ? `Bearer ${this.storage.getToken()}` : '',
      Accept: 'application/json',
    });
  }

  getAcademicYearById(id: number) {
    const url = this.getAcademicYearByIdUrl.replace('{id}', String(id));
    return this.http.get<AcademicYearResponse>(url, {
      headers: this.authHeaders(),
    });
  }

  getAcademicYear(page = 1, perPage = 10): Observable<AcademicYearModel> {
    const params = new HttpParams().set('page', page).set('per_page', perPage);

    return this.http.get<AcademicYearModel>(this.getAcademicYearUrl, {
      headers: this.authHeaders(),
      params,
    });
  }

  createAcademicYear(payload: CreateAcademicYearPayload): Observable<AcademicYearResponse> {
    return this.http.post<AcademicYearResponse>(this.createAcademicYeartUrl, payload, {
      headers: this.authHeaders().set('Content-Type', 'application/json'),
    });
  }
  updateAcademicYear(
    id: number,
    payload: CreateAcademicYearPayload,
  ): Observable<AcademicYearResponse> {
    const url = this.updateAcademicYearUrl.replace('{id}', String(id));
    return this.http.post<AcademicYearResponse>(url, payload, {
      headers: this.authHeaders().set('Content-Type', 'application/json'),
    });
  }

  deleteAcademicYear(payload: DeletePayload): Observable<DeleteAcademicYearResponse> {
    return this.http.post<DeleteAcademicYearResponse>(this.deleteAcademicYeartUrl, payload, {
      headers: this.authHeaders().set('Content-Type', 'application/json'),
    });
  }

  getListAllAcademicYear(): Observable<AcademicYearListAllResponse> {
    return this.http.get<AcademicYearListAllResponse>(this.listAllAcademicYeartUrl, {
      headers: this.authHeaders(),
    });
  }
}
