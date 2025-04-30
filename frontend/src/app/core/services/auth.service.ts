import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap, throwError, switchMap, catchError } from 'rxjs';

interface JwtTokens {
  access: string;
  refresh: string;
}

interface CurrentUser {
  username: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';

  private currentUserSubject = new BehaviorSubject<CurrentUser | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const token = this.getAccessToken();
    if (token) {
      this.currentUserSubject.next(this.decodeUser(token));
    }
  }

  register(data: { username: string; email?: string; password: string }): Observable<any> {
    return this.http.post('/api/auth/register/', data);
  }

  login(credentials: { username: string; password: string }): Observable<void> {
    return this.http.post<JwtTokens>('/api/auth/login/', credentials).pipe(
      tap(tokens => this.storeTokens(tokens)),
      map(() => void 0)
    );
  }

  refresh(): Observable<void> {
    const refresh = this.getRefreshToken();
    if (!refresh) {
      return throwError(() => new Error('No refresh token'));
    }
    return this.http.post<{ access: string }>('/api/auth/refresh/', { refresh }).pipe(
      tap(res => this.storeTokens({ access: res.access, refresh })),
      map(() => void 0)
    );
  }

  logout(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  // ---------------- private helpers ----------------
  private storeTokens(tokens: JwtTokens) {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.access);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refresh);
    this.currentUserSubject.next(this.decodeUser(tokens.access));
  }

  private decodeUser(token: string): CurrentUser | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return { username: payload.username || payload.user_id || payload.sub } as CurrentUser;
    } catch (e) {
      return null;
    }
  }
}
