import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, tap, of, catchError } from 'rxjs';
import { ApiClientService } from './api-client.service';
import { TokenStorageService } from './token-storage.service';
import { loginEndPoint, logoutEndPoint } from '../api/auth-endpoint';
import { LoginRequest, LoginResponse, SessionUser, RoleName } from '../model/auth.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly userSubject: BehaviorSubject<SessionUser | null>;
  readonly $user: Observable<SessionUser | null>;
  readonly $fileAPIUrl = `${environment.fileUrl}`;

  constructor(
    private readonly api: ApiClientService,
    private readonly storage: TokenStorageService
  ) {
    this.userSubject = new BehaviorSubject<SessionUser | null>(this.storage.getUser());
    this.$user = this.userSubject.asObservable();
  }

  get isLoggedIn(): boolean {
    return !!this.storage.getToken();
  }

  get currentUser(): SessionUser | null {
    return this.userSubject.value;
  }

  login(role: string, payload: LoginRequest): Observable<SessionUser> {
    return this.api.post<LoginResponse>(loginEndPoint.login(role), payload).pipe(
      map((res) => {
        const u = res.user;

        const sessionUser: SessionUser = {
          id: u.id,
          full_name: u.full_name ?? null,
          first_name: u.first_name ?? null,
          last_name: u.last_name ?? null,
          email: u.email ?? null,
          username: u.username ?? null,
          image_path: u.image_path ?? null,
          role_name: u.role?.role_name ?? 'Unknown',
          user_role_id: u.user_role_id,

          course_id: u.course_id ?? null,
          section_id: u.section_id ?? null,
          year_level: u.year_level ?? null,

          course: u.course ?? null,
          section: u.section ?? null,
        };

        return { sessionUser, token: res.token };
      }),
      tap(({ sessionUser, token }) => {
        this.storage.setToken(token);
        this.storage.setUser(sessionUser);
        this.userSubject.next(sessionUser);
      }),
      map(({ sessionUser }) => sessionUser)
    );
  }

  updateCurrentUser(patch: Partial<SessionUser>): void {
    const current = this.userSubject.value;
    if (!current) return;

    const updatedUser: SessionUser = {
      ...current,
      ...patch,
    };

    this.storage.setUser(updatedUser);
    this.userSubject.next(updatedUser);
  }

  logout(): Observable<void> {
    return this.api.post<any>(logoutEndPoint.logout, {}).pipe(
      tap(() => {
        this.storage.clearAll();
        this.userSubject.next(null);
      }),
      map(() => void 0),
      catchError(() => {
        this.storage.clearAll();
        this.userSubject.next(null);
        return of(void 0);
      })
    );
  }

  hasRole(allowed: RoleName[]): boolean {
    const u = this.currentUser;
    return !!u && allowed.includes(u.role_name);
  }
}