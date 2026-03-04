import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { Observable } from "rxjs";
import { AdminModel } from "../../../../models/admin-panel/user-management/admin/admin.model";

export enum AdminEndPoints {
  getAdmin = '/get/admin',
}

@Injectable({
  providedIn: 'root',
})

export class AdminService {
  private http = inject(HttpClient);
  private baseAPIUrl = `${environment.apiUrl}`;

  private readonly getAdminUrl = `${this.baseAPIUrl}${AdminEndPoints.getAdmin}`;

    private authHeaders(): HttpHeaders {
  //  const token = localStorage.getItem('access_token'); 
    const token = '123|HJt9hEXjJqqBht4v82vNsjD7o6cEWtSbWn7DmfHJ449c0c5c';
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
      Accept: 'application/json',
    });
  }

  getAdmins(page = 1, perPage = 10): Observable<AdminModel> {
    const params = new HttpParams()
      .set('page', page)
      .set('per_page', perPage);

    return this.http.get<AdminModel>(this.getAdminUrl, {
      headers: this.authHeaders(),
      params,
    });
  }
}