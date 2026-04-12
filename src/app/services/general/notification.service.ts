import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TokenStorageService } from '../../core/services/token-storage.service';
import { NotificationListResponse } from '../../models/general/notification/notification.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private http = inject(HttpClient);
  private storage = inject(TokenStorageService);

  private baseAPIUrl = `${environment.apiUrl}`;
  private readonly getNotificationsUrl = `${this.baseAPIUrl}get/notifications`;

  private authHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: this.storage.getToken() ? `Bearer ${this.storage.getToken()}` : '',
      Accept: 'application/json',
    });
  }

  getNotifications(page = 1, perPage = 20): Observable<NotificationListResponse> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('per_page', String(perPage));

    return this.http.get<NotificationListResponse>(this.getNotificationsUrl, {
      headers: this.authHeaders(),
      params,
    });
  }
}