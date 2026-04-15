import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenStorageService } from '../../../core/services/token-storage.service';
import { ApiResponseNoData } from '../../../models/pagination.model';
import { ChangeUserPasswordPayload } from '../../../payloads/admin-panel/change-user-password/change-user-password.payload';

export enum ChangeUserPasswordEndpoints {
  changeUserPassword = 'admin/change-user-password',
}

@Injectable({
  providedIn: 'root',
})
export class ChangeUserPasswordService {
  private http = inject(HttpClient);
  private storage = inject(TokenStorageService);

  private baseAPIUrl = `${environment.apiUrl}`;
  private readonly changeUserPasswordUrl = `${this.baseAPIUrl}${ChangeUserPasswordEndpoints.changeUserPassword}`;

  private authHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: this.storage.getToken() ? `Bearer ${this.storage.getToken()}` : '',
      Accept: 'application/json',
    });
  }

  resetUserPassword(payload: ChangeUserPasswordPayload): Observable<ApiResponseNoData> {
    let params = new HttpParams()
      .set('new_password', payload.new_password)
      .set('new_password_confirmation', payload.new_password_confirmation);

    if (payload.username) {
      params = params.set('username', payload.username);
    }

    if (payload.email) {
      params = params.set('email', payload.email);
    }

    return this.http.patch<ApiResponseNoData>(
      this.changeUserPasswordUrl,
      {},
      {
        headers: this.authHeaders(),
        params,
      }
    );
  }
}