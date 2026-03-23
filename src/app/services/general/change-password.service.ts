import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TokenStorageService } from '../../core/services/token-storage.service';
import { ChangePasswordPayload } from '../../payloads/general/settings/change-password.payload';
import { ChangePasswordResponse } from '../../models/general/settings/change-password.model';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private http = inject(HttpClient);
  private storage = inject(TokenStorageService);

  private baseAPIUrl = `${environment.apiUrl}`;
  private readonly changePasswordUrl = `${this.baseAPIUrl}current-user/change-password`;

  private authHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: this.storage.getToken()
        ? `Bearer ${this.storage.getToken()}`
        : '',
      Accept: 'application/json',
    });
  }

  changePassword(payload: ChangePasswordPayload): Observable<ChangePasswordResponse> {
    return this.http.patch<ChangePasswordResponse>(this.changePasswordUrl, payload, {
      headers: this.authHeaders().set('Content-Type', 'application/json'),
    });
  }
}