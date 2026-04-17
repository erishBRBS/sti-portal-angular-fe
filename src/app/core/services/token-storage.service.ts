import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SessionUser } from '../model/auth.model';

@Injectable({
  providedIn: 'root',
})
export class TokenStorageService {
  private readonly TOKEN_KEY = 'token';
  private readonly USER_KEY = 'user';

  constructor(@Inject(PLATFORM_ID) private readonly platformId: Object) {}

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  setToken(token: string): void {
    if (!this.isBrowser) return;
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  removeToken(): void {
    if (!this.isBrowser) return;
    localStorage.removeItem(this.TOKEN_KEY);
  }

  setUser(user: SessionUser): void {
    if (!this.isBrowser) return;
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  getUser(): SessionUser | null {
    if (!this.isBrowser) return null;

    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as SessionUser;
    } catch {
      localStorage.removeItem(this.USER_KEY);
      return null;
    }
  }

  removeUser(): void {
    if (!this.isBrowser) return;
    localStorage.removeItem(this.USER_KEY);
  }

  clearAll(): void {
    if (!this.isBrowser) return;
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }
}