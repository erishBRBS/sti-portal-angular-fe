import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { ApiClientService } from './api-client.service';
import { TokenStorageService } from './token-storage.service';
import { loginEndPoint } from '../api/auth-endpoint';
import { LoginRequest, LoginResponse, SessionUser, RoleName } from '../model/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly userSubject: BehaviorSubject<SessionUser | null>;
  readonly $user: Observable<SessionUser | null>;

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
          full_name: u.full_name,
          email: u.email,
          role_name: u.role?.role_name ?? 'Unknown',
          user_role_id: u.user_role_id,
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

  logout(): void {
    this.storage.clearAll();
    this.userSubject.next(null);
  }

  hasRole(allowed: RoleName[]): boolean {
    const u = this.currentUser;
    return !!u && allowed.includes(u.role_name);
  }
}