import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { Observable } from "rxjs";
import { AdminData, AdminDetailResponse, AdminModel } from "../../../../models/admin-panel/user-management/admin/admin.model";
import { CreateAdminPayload, DeleteAdminPayload } from "../../../../payloads/admin-panel/user-management/admin/create-admin.payload";
import { ApiResponse, ApiResponseNoData } from "../../../../models/pagination.model";
import { StudentModel } from "../../../../models/admin-panel/user-management/student/student.model";
import { ProfessorData, ProfessorModel } from "../../../../models/admin-panel/user-management/professor/professor.model";

export enum ProfessorEndPoints {
  getProfessor = '/get/professor',
  createProfessor = '/create/admin',
  getProfessorById = '/get/admin/{id}',
  deleteProfessor = '/delete/admin',
}

export type ProfessorResponse = ApiResponse<ProfessorData>;
export type DeleteProfessorResponse = ApiResponseNoData;

@Injectable({
  providedIn: 'root',
})

export class ProfesssorService {
  private http = inject(HttpClient);
  private baseAPIUrl = `${environment.apiUrl}`;
  fileAPIUrl = `${environment.fileUrl}`;
  token = `${environment.temp_token}`;

  private readonly getProfessorUrl = `${this.baseAPIUrl}${ProfessorEndPoints.getProfessor}`;
  private readonly createProfessorUrl = `${this.baseAPIUrl}${ProfessorEndPoints.createProfessor}`;
  private readonly getProfessorByIdUrl = `${this.baseAPIUrl}${ProfessorEndPoints.getProfessorById}`;
  private readonly deleteProfessorUrl = `${this.baseAPIUrl}${ProfessorEndPoints.deleteProfessor}`;

  private authHeaders(): HttpHeaders {
  //  const token = localStorage.getItem('access_token'); 
  //  const token = '2|Mh08c6p0j4tzzbdZgAHIPJuEHs4PqhpvhrCaS8Ztd5840140';
    return new HttpHeaders({
      Authorization: this.token ? `Bearer ${this.token}` : '',
      Accept: 'application/json',
    });
  }

 getProfessorById(id: number) {
    const url = this.getProfessorByIdUrl.replace('{id}', String(id));
    return this.http.get<ProfessorResponse>(url, {
      headers: this.authHeaders(),
    });
  }

  getProfessor(page = 1, perPage = 10): Observable<ProfessorModel> {
    const params = new HttpParams()
      .set('page', page)
      .set('per_page', perPage);

    return this.http.get<ProfessorModel>(this.getProfessorUrl, {
      headers: this.authHeaders(),
      params,
    });
  }

  createProfessor(payload: CreateAdminPayload, imageFile?: File | null): Observable<ProfessorResponse> {
    const fd = new FormData();
    fd.append('full_name', payload.full_name ?? '');
    fd.append('email', payload.email ?? '');
    fd.append('mobile_number', payload.mobile_number ?? '');
    fd.append('username', payload.username ?? '');
    fd.append('password', payload.password ?? '');

    if (imageFile) {
      fd.append('image_path', imageFile); 
    }

    return this.http.post<ProfessorResponse>(this.createProfessorUrl, fd, {
      headers: this.authHeaders(),
    });
  }

  deleteProfessor(payload: DeleteAdminPayload): Observable<DeleteProfessorResponse> {
    return this.http.post<DeleteProfessorResponse>(this.deleteProfessorUrl, payload, {
      headers: this.authHeaders().set('Content-Type', 'application/json'),
    });
  }
}