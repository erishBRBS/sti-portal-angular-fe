import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { Observable } from "rxjs";
import { AdminData, AdminDetailResponse, AdminModel } from "../../../../models/admin-panel/user-management/admin/admin.model";
import { CreateProfessorPayload } from "../../../../payloads/admin-panel/user-management/professor/create-professor.payload";
import { ApiResponse, ApiResponseNoData } from "../../../../models/pagination.model";
import { DeletePayload } from "../../../../payloads/common.payload";
import { StudentModel } from "../../../../models/admin-panel/user-management/student/student.model";
import { ProfessorData} from "../../../../models/admin-panel/user-management/professor/professor.model";
import { ProfessorModel } from "../../../../models/admin-panel/user-management/professor/professor.model";
import { TokenStorageService } from "../../../../core/services/token-storage.service";

export enum ProfessorEndPoints {
  getProfessor = 'get/professor',
  createProfessor = 'create/professor',
  updateProfessor = 'update/p/{id}', 
  getProfessorById = 'get/professor/{id}',
  deleteProfessor = 'delete/professor',
  importSection = 'import/section'
}

export type ProfessorResponse = ApiResponse<ProfessorData>;
export type DeleteProfessorResponse = ApiResponseNoData;

@Injectable({
  providedIn: 'root',
})

export class ProfessorService {
  private http = inject(HttpClient);
  private storage = inject(TokenStorageService);

  private baseAPIUrl = `${environment.apiUrl}`;
  fileAPIUrl = `${environment.fileUrl}`;
  token = `${environment.temp_token}`;

  private readonly getProfessorUrl = `${this.baseAPIUrl}${ProfessorEndPoints.getProfessor}`;
  private readonly createProfessorUrl = `${this.baseAPIUrl}${ProfessorEndPoints.createProfessor}`;
  private readonly getProfessorByIdUrl = `${this.baseAPIUrl}${ProfessorEndPoints.getProfessorById}`;
   private readonly updateProfessorUrl = `${this.baseAPIUrl}${ProfessorEndPoints.updateProfessor}`;
  private readonly deleteProfessorUrl = `${this.baseAPIUrl}${ProfessorEndPoints.deleteProfessor}`;

  private authHeaders(): HttpHeaders {
  //  const token = localStorage.getItem('access_token'); 
  //  const token = '2|Mh08c6p0j4tzzbdZgAHIPJuEHs4PqhpvhrCaS8Ztd5840140';
    return new HttpHeaders({
      Authorization: this.storage.getToken() ? `Bearer ${this.storage.getToken()}` : '',
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

  createProfessor(payload: CreateProfessorPayload, imageFile?: File | null): Observable<ProfessorResponse> {
    const fd = new FormData();
    fd.append('professor_name', payload.professor_name ?? '');
    fd.append('email', payload.email ?? '');
    fd.append('username', payload.username ?? '');
    fd.append('password', payload.password ?? '');
    fd.append('mobile_number', payload.mobile_number);
    fd.append('department_id', payload.department_id.toString());
    fd.append('user_role_id', payload.user_role_id.toString());
    if (imageFile) {
      fd.append('image_path', imageFile); 
    }

    return this.http.post<ProfessorResponse>(this.createProfessorUrl, fd, {
      headers: this.authHeaders(),
    });
  }
    updateProfessor(id: number, payload: CreateProfessorPayload, imageFile?: File | null): Observable<ProfessorResponse> {
  
    const url = this.updateProfessorUrl.replace('{id}', String(id));
  
    const fd = new FormData();
    fd.append('professor_name', payload.professor_name ?? ''); 
    fd.append('email', payload.email ?? '');
    fd.append('username', payload.username ?? '');
  
    if (payload.password) {
      fd.append('password', payload.password);
    }
  
    if (imageFile) {
      fd.append('image_path', imageFile);
    }
  
  return this.http.patch<ProfessorResponse>(url, fd, {
    headers: this.authHeaders(),
  });
  }

  deleteProfessor(payload: DeletePayload): Observable<DeleteProfessorResponse> {
    return this.http.post<DeleteProfessorResponse>(this.deleteProfessorUrl, payload, {
      headers: this.authHeaders().set('Content-Type', 'application/json'),
    });
  }

    importProfessor(file: File) {
    const fd = new FormData();
    fd.append('file', file);
  
    return this.http.post<ApiResponseNoData>(
      `${this.baseAPIUrl}${ProfessorEndPoints.importSection}`,
      fd,
      { headers: this.authHeaders() }
    );
  }
}