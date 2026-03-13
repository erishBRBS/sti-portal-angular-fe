import { inject, Injectable } from "@angular/core";
import { ApiResponse, ApiResponseNoData } from "../../../models/pagination.model";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { CourseData, CourseModel } from "../../../models/admin-panel/curriculum-management/course.model";
import { Observable } from "rxjs";
import { CreateCoursePayload } from "../../../payloads/admin-panel/curriculum/course/create-course.payload";
import { DeletePayload } from "../../../payloads/common.payload";

export enum CourseEndPoints {
  getCourse = '/get/course',
  createCourse = '/create/course',
  getCourseById = '/get/course/{id}',
  updateCourse = '/update/course/{id}',
  deleteCourse = '/delete/course',
}

export type CourseResponse = ApiResponse<CourseData>;
export type DeleteCourseResponse = ApiResponseNoData;

@Injectable({
  providedIn: 'root',
})

export class CourseService {
  private http = inject(HttpClient);
  private baseAPIUrl = `${environment.apiUrl}`;
  fileAPIUrl = `${environment.fileUrl}`;
  token = `${environment.temp_token}`;

  private readonly getCourseUrl = `${this.baseAPIUrl}${CourseEndPoints.getCourse}`;
  private readonly createCoursetUrl = `${this.baseAPIUrl}${CourseEndPoints.createCourse}`;
  private readonly getCourseByIdUrl = `${this.baseAPIUrl}${CourseEndPoints.getCourseById}`;
  private readonly updateCourseUrl = `${this.baseAPIUrl}${CourseEndPoints.updateCourse}`;
  private readonly deleteCoursetUrl = `${this.baseAPIUrl}${CourseEndPoints.deleteCourse}`;

  private authHeaders(): HttpHeaders {
  //  const token = localStorage.getItem('access_token'); 
  //   const token = '2|Mh08c6p0j4tzzbdZgAHIPJuEHs4PqhpvhrCaS8Ztd5840140';
    return new HttpHeaders({
      Authorization: this.token ? `Bearer ${this.token}` : '',
      Accept: 'application/json',
    });
  }

 getCourseById(id: number) {
    const url = this.getCourseByIdUrl.replace('{id}', String(id));
    return this.http.get<CourseResponse>(url, {
      headers: this.authHeaders(),
    });
  }

  getCourse(page = 1, perPage = 10): Observable<CourseModel> {
    const params = new HttpParams()
      .set('page', page)
      .set('per_page', perPage);

    return this.http.get<CourseModel>(this.getCourseUrl, {
      headers: this.authHeaders(),
      params,
    });
  }

createCourse(payload: { course_name: string }): Observable<CourseResponse> {
  return this.http.post<CourseResponse>(
    this.createCoursetUrl,
    payload,
    {
      headers: this.authHeaders().set('Content-Type', 'application/json'),
    }
  );
}
  updateCourse(id: number, payload: CreateCoursePayload): Observable<CourseResponse> {
  const url = this.updateCourseUrl.replace('{id}', String(id));
  return this.http.post<CourseResponse>(url, payload, {
    headers: this.authHeaders().set('Content-Type', 'application/json'),
  });
}

  deleteCourse(payload: DeletePayload): Observable<DeleteCourseResponse> {
    return this.http.post<DeleteCourseResponse>(this.deleteCoursetUrl, payload, {
      headers: this.authHeaders().set('Content-Type', 'application/json'),
    });
  }
}