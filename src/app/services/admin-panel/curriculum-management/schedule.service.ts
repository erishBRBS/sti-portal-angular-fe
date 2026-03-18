import { inject, Injectable } from "@angular/core";
import { ApiResponse, ApiResponseNoData } from "../../../models/pagination.model";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { CourseData, CourseModel } from "../../../models/admin-panel/curriculum-management/course.model";
import { Observable } from "rxjs";
import { CreateSchedulePayload } from "../../../payloads/admin-panel/curriculum/schedule/create-schedule.payload";
import { DeletePayload } from "../../../payloads/common.payload";
import { SubjectData, SubjectModel } from "../../../models/admin-panel/curriculum-management/subject.model";
import { ScheduleData, ScheduleModel } from "../../../models/admin-panel/curriculum-management/schedule.model";
import { TokenStorageService } from "../../../core/services/token-storage.service";

export enum ScheduleEndPoints {
  getSchedule = 'get/schedule',
  creatSchedule = 'create/course',
  getScheduleById = 'get/course/{id}',
  updateSchedule = 'update/course/{id}',
  deleteSchedule = 'delete/course',
}

export type ScheduleResponse = ApiResponse<ScheduleData>;
export type DeleteScheduleResponse = ApiResponseNoData;

@Injectable({
  providedIn: 'root',
})

export class ScheduleService {
  private http = inject(HttpClient);
  private storage = inject(TokenStorageService);

  private baseAPIUrl = `${environment.apiUrl}`;
  fileAPIUrl = `${environment.fileUrl}`;
  token = `${environment.temp_token}`;

  private readonly getScheduleUrl = `${this.baseAPIUrl}${ScheduleEndPoints.getSchedule}`;
  private readonly createScheduleUrl = `${this.baseAPIUrl}${ScheduleEndPoints.creatSchedule}`;
  private readonly getScheduleByIdUrl = `${this.baseAPIUrl}${ScheduleEndPoints.getScheduleById}`;
  private readonly updateScheduleUrl = `${this.baseAPIUrl}${ScheduleEndPoints.updateSchedule}`;
  private readonly deleteScheduleUrl = `${this.baseAPIUrl}${ScheduleEndPoints.deleteSchedule}`;

  private authHeaders(): HttpHeaders {
  //  const token = localStorage.getItem('access_token'); 
  //   const token = '2|Mh08c6p0j4tzzbdZgAHIPJuEHs4PqhpvhrCaS8Ztd5840140';
    return new HttpHeaders({
      Authorization: this.storage.getToken() ? `Bearer ${this.storage.getToken()}` : '',
      Accept: 'application/json',
    });
  }

 getScheduleById(id: number) {
    const url = this.getScheduleByIdUrl.replace('{id}', String(id));
    return this.http.get<ScheduleResponse>(url, {
      headers: this.authHeaders(),
    });
  }

  getSchedule(page = 1, perPage = 10): Observable<ScheduleModel> {
    const params = new HttpParams()
      .set('page', page)
      .set('per_page', perPage);

    return this.http.get<ScheduleModel>(this.getScheduleUrl, {
      headers: this.authHeaders(),
      params,
    });
  }

createSchedule(payload: CreateSchedulePayload): Observable<ScheduleResponse> {

  return this.http.post<ScheduleResponse>(
    this.createScheduleUrl,
    payload,
    {
      headers: this.authHeaders().set('Content-Type', 'application/json'),
    }
  );

}
updateSchedule(id: number, payload: CreateSchedulePayload): Observable<ScheduleResponse> {
  const url = this.updateScheduleUrl.replace('{id}', String(id));
  return this.http.post<ScheduleResponse>(
    url,
    payload,
    {
      headers: this.authHeaders().set('Content-Type', 'application/json'),
    }
  );
}

  deleteSchedule(payload: DeletePayload): Observable<DeleteScheduleResponse> {
    return this.http.post<DeleteScheduleResponse>(this.deleteScheduleUrl, payload, {
      headers: this.authHeaders().set('Content-Type', 'application/json'),
    });
  }
}