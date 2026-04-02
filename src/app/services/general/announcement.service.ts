import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TokenStorageService } from '../../core/services/token-storage.service';
import { ApiResponse, ApiResponseNoData } from '../../models/pagination.model';
import {
  AnnouncementData,
  AnnouncementModel,
} from '../../models/admin-panel/announcement/announcement.model';
import { CreateAnnouncementPayload } from '../../payloads/admin-panel/announcement/announcement.payload';
import { DeletePayload } from '../../payloads/common.payload';

export enum AnnouncementEndPoints {
  getAnnouncement = 'get/announcement',
  createAnnouncement = 'create/announcement',
  getAnnouncementById = 'get/announcement/{id}',
  updateAnnouncement = 'update/announcement/{id}',
  deleteAnnouncement = 'delete/announcement',
}

export type AnnouncementResponse = ApiResponse<AnnouncementData>;
export type DeleteAnnouncementResponse = ApiResponseNoData;

@Injectable({
  providedIn: 'root',
})
export class AnnouncementService {
  private http = inject(HttpClient);
  private storage = inject(TokenStorageService);

  private baseAPIUrl = `${environment.apiUrl}`;
  fileAPIUrl = `${environment.fileUrl}`;

  private readonly getAnnouncementUrl = `${this.baseAPIUrl}${AnnouncementEndPoints.getAnnouncement}`;
  private readonly createAnnouncementUrl = `${this.baseAPIUrl}${AnnouncementEndPoints.createAnnouncement}`;
  private readonly getAnnouncementByIdUrl = `${this.baseAPIUrl}${AnnouncementEndPoints.getAnnouncementById}`;
  private readonly updateAnnouncementUrl = `${this.baseAPIUrl}${AnnouncementEndPoints.updateAnnouncement}`;
  private readonly deleteAnnouncementUrl = `${this.baseAPIUrl}${AnnouncementEndPoints.deleteAnnouncement}`;

  private authHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: this.storage.getToken() ? `Bearer ${this.storage.getToken()}` : '',
      Accept: 'application/json',
    });
  }

  getAnnouncement(page = 1, perPage = 10): Observable<AnnouncementModel> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('per_page', String(perPage));

    return this.http.get<AnnouncementModel>(this.getAnnouncementUrl, {
      headers: this.authHeaders(),
      params,
    });
  }

  getAnnouncementById(id: number): Observable<AnnouncementResponse> {
    const url = this.getAnnouncementByIdUrl.replace('{id}', String(id));

    return this.http.get<AnnouncementResponse>(url, {
      headers: this.authHeaders(),
    });
  }

  createAnnouncement(
    payload: CreateAnnouncementPayload,
    attachment?: File | null,
  ): Observable<AnnouncementResponse> {
    const fd = new FormData();
    fd.append('title', payload.title ?? '');
    fd.append('description', payload.description ?? '');
    fd.append('priority', payload.priority ?? 'Normal');
    fd.append('status', payload.status ?? 'Active');

    if (attachment) {
      fd.append('attachment', attachment);
    }

    return this.http.post<AnnouncementResponse>(this.createAnnouncementUrl, fd, {
      headers: this.authHeaders(),
    });
  }

  updateAnnouncement(
    id: number,
    payload: CreateAnnouncementPayload,
    attachment?: File | null,
  ): Observable<AnnouncementResponse> {
    const url = this.updateAnnouncementUrl.replace('{id}', String(id));
    const fd = new FormData();

    fd.append('_method', 'PATCH');
    fd.append('title', payload.title ?? '');
    fd.append('description', payload.description ?? '');
    fd.append('priority', payload.priority ?? 'Normal');
    fd.append('status', payload.status ?? 'Active');

    if (attachment) {
      fd.append('attachment', attachment);
    }

    return this.http.post<AnnouncementResponse>(url, fd, {
      headers: this.authHeaders(),
    });
  }

  deleteAnnouncement(payload: DeletePayload): Observable<DeleteAnnouncementResponse> {
    return this.http.post<DeleteAnnouncementResponse>(this.deleteAnnouncementUrl, payload, {
      headers: this.authHeaders().set('Content-Type', 'application/json'),
    });
  }
}