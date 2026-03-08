import { inject, Injectable } from "@angular/core";
import { ApiResponse, ApiResponseNoData } from "../../../models/pagination.model";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { CourseData, CourseModel } from "../../../models/admin-panel/curriculum-management/course.model";
import { Observable } from "rxjs";
import { CreateAdminPayload } from "../../../payloads/admin-panel/user-management/admin/create-admin.payload";
import { DeletePayload } from "../../../payloads/common.payload";
import { SectionData, SectionModel } from "../../../models/admin-panel/curriculum-management/section.model";

export enum SectionEndPoints {
  getSection = '/get/section',
  createSection = '/create/section',
  getSectionById = '/get/section/{id}',
  deleteSection = '/delete/section',
}

export type SectionResponse = ApiResponse<SectionData>;
export type DeleteSectionResponse = ApiResponseNoData;

@Injectable({
  providedIn: 'root',
})

export class SectionService {
  private http = inject(HttpClient);
  private baseAPIUrl = `${environment.apiUrl}`;
  fileAPIUrl = `${environment.fileUrl}`;
  token = `${environment.temp_token}`;

  private readonly getSectionUrl = `${this.baseAPIUrl}${SectionEndPoints.getSection}`;
  private readonly createSectiontUrl = `${this.baseAPIUrl}${SectionEndPoints.createSection}`;
  private readonly getSectionByIdUrl = `${this.baseAPIUrl}${SectionEndPoints.getSectionById}`;
  private readonly deleteSectionUrl = `${this.baseAPIUrl}${SectionEndPoints.deleteSection}`;

  private authHeaders(): HttpHeaders {
  //  const token = localStorage.getItem('access_token'); 
  //   const token = '2|Mh08c6p0j4tzzbdZgAHIPJuEHs4PqhpvhrCaS8Ztd5840140';
    return new HttpHeaders({
      Authorization: this.token ? `Bearer ${this.token}` : '',
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
    const params = new HttpParams()
      .set('page', page)
      .set('per_page', perPage);

    return this.http.get<SectionModel>(this.getSectionUrl, {
      headers: this.authHeaders(),
      params,
    });
  }

  createSection(payload: CreateAdminPayload, imageFile?: File | null): Observable<SectionResponse> {
    const fd = new FormData();
    fd.append('full_name', payload.full_name ?? '');
    fd.append('email', payload.email ?? '');
    fd.append('mobile_number', payload.mobile_number ?? '');
    fd.append('username', payload.username ?? '');
    fd.append('password', payload.password ?? '');

    if (imageFile) {
      fd.append('image_path', imageFile); 
    }

    return this.http.post<SectionResponse>(this.createSectiontUrl, fd, {
      headers: this.authHeaders(),
    });
  }

  deleteSection(payload: DeletePayload): Observable<DeleteSectionResponse> {
    return this.http.post<DeleteSectionResponse>(this.deleteSectionUrl, payload, {
      headers: this.authHeaders().set('Content-Type', 'application/json'),
    });
  }
}