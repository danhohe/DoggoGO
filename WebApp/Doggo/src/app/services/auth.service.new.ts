import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { map, catchError, tap } from 'rxjs/operators';
import { DataService, User } from './data.service';
import { HttpApiService } from './http-api.service';
import { environment } from '../../environments/environment';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  ApiUser 
} from '../interfaces/api.interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  // API-spezifische Properties
  private tokenSubject = new BehaviorSubject<string | null>(this.getStoredToken());
  public token$ = this.tokenSubject.asObservable();

  constructor(
    private dataService: DataService,
    private router: Router,
    private httpApiService: HttpApiService
  ) {
    // Prüfe ob bereits ein Benutzer eingeloggt ist
    const storedUser = this.getStoredUser();
    if (storedUser && this.isTokenValid()) {
      this.currentUserSubject.next(storedUser);
      this.dataService.setCurrentUser(storedUser);
    } else {
      // Token ungültig - logout
      this.clearStoredAuth();
    }
  }

  // ===== PRIVATE HELPER METHODS =====
  
  private getStoredUser(): User | null {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('currentUser');
      return storedUser ? JSON.parse(storedUser) : null;
    }
    return null;
  }

  private getStoredToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('doggo_auth_token');
    }
    return null;
  }

  private setStoredAuth(user: User, token: string, refreshToken?: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('doggo_auth_token', token);
      if (refreshToken) {
        localStorage.setItem('doggo_refresh_token', refreshToken);
      }
    }
    this.currentUserSubject.next(user);
    this.tokenSubject.next(token);
    this.dataService.setCurrentUser(user);
  }

  private clearStoredAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('doggo_auth_token');
      localStorage.removeItem('doggo_refresh_token');
    }
    this.currentUserSubject.next(null);
    this.tokenSubject.next(null);
    this.dataService.setCurrentUser(null);
  }

  private convertApiUserToUser(apiUser: ApiUser): User {
    return {
      id: apiUser.id,
      name: apiUser.name,
      email: apiUser.email,
      registeredAt: new Date(apiUser.createdAt || Date.now())
    };
  }

  private isTokenValid(): boolean {
    const token = this.getStoredToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  // ===== PUBLIC METHODS =====

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null && this.isTokenValid();
  }

  login(email: string, password: string): Observable<boolean> {
    // Prüfe ob Mock-Daten verwendet werden sollen
    if (environment.enableMockData) {
      return this.mockLogin(email, password);
    }

    // Echte API-Integration
    const loginRequest: LoginRequest = { email, password };
    
    return this.httpApiService.login(loginRequest).pipe(
      map((response: AuthResponse) => {
        if (response.success && response.data) {
          const user = this.convertApiUserToUser(response.data.user);
          this.setStoredAuth(
            user, 
            response.data.token, 
            response.data.refreshToken
          );
          return true;
        }
        return false;
      }),
      catchError(error => {
        console.error('Login failed:', error);
        return of(false);
      })
    );
  }

  private mockLogin(email: string, password: string): Observable<boolean> {
    // Simulierte Login-Logik - bestehende Implementierung
    return new Observable(observer => {
      this.dataService.getUsers().subscribe((users: User[]) => {
        const user = users.find((u: User) => u.email === email);
        
        if (user) {
          // Für Mock: Passwort wird nicht geprüft
          this.setStoredAuth(user, 'mock_token_' + Date.now());
          observer.next(true);
        } else {
          observer.next(false);
        }
        observer.complete();
      });
    });
  }

  register(email: string, name: string, password: string): Observable<boolean> {
    // Prüfe ob Mock-Daten verwendet werden sollen
    if (environment.enableMockData) {
      return this.mockRegister(email, name, password);
    }

    // Echte API-Integration
    const registerRequest: RegisterRequest = { email, name, password };
    
    return this.httpApiService.register(registerRequest).pipe(
      map((response: AuthResponse) => {
        if (response.success && response.data) {
          const user = this.convertApiUserToUser(response.data.user);
          this.setStoredAuth(
            user, 
            response.data.token, 
            response.data.refreshToken
          );
          return true;
        }
        return false;
      }),
      catchError(error => {
        console.error('Registration failed:', error);
        return of(false);
      })
    );
  }

  private mockRegister(email: string, name: string, password: string): Observable<boolean> {
    // Simulierte Registrierung - bestehende Implementierung
    return new Observable(observer => {
      this.dataService.getUsers().subscribe((users: User[]) => {
        const existingUser = users.find((u: User) => u.email === email);
        
        if (existingUser) {
          observer.next(false); // E-Mail bereits registriert
        } else {
          const newUserData = {
            email,
            name,
            registeredAt: new Date()
          };
          
          // Speichere neuen User im DataService
          this.dataService.addUser(newUserData).subscribe((newUser) => {
            this.setStoredAuth(newUser, 'mock_token_' + Date.now());
            observer.next(true);
            observer.complete();
          });
        }
      });
    });
  }

  logout(): Observable<boolean> {
    // Prüfe ob echte API verwendet wird
    if (!environment.enableMockData && this.isTokenValid()) {
      return this.httpApiService.logout().pipe(
        map(response => {
          this.clearStoredAuth();
          this.router.navigate(['/login']);
          return response.success;
        }),
        catchError(error => {
          // Auch bei Fehlern ausloggen
          this.clearStoredAuth();
          this.router.navigate(['/login']);
          return of(true);
        })
      );
    } else {
      // Mock-Logout
      this.clearStoredAuth();
      this.router.navigate(['/login']);
      return of(true);
    }
  }

  // ===== TOKEN MANAGEMENT =====

  refreshToken(): Observable<boolean> {
    if (environment.enableMockData) {
      return of(true); // Mock immer erfolgreich
    }

    return this.httpApiService.refreshToken().pipe(
      map((response: AuthResponse) => {
        if (response.success && response.data) {
          const user = this.convertApiUserToUser(response.data.user);
          this.setStoredAuth(
            user, 
            response.data.token, 
            response.data.refreshToken
          );
          return true;
        }
        return false;
      }),
      catchError(error => {
        console.error('Token refresh failed:', error);
        this.clearStoredAuth();
        return of(false);
      })
    );
  }

  getToken(): string | null {
    return this.getStoredToken();
  }

  getTokenExpirationDate(): Date | null {
    const token = this.getStoredToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return new Date(payload.exp * 1000);
    } catch {
      return null;
    }
  }

  // ===== API STATUS =====

  isUsingMockData(): boolean {
    return environment.enableMockData;
  }

  getApiStatus(): Observable<boolean> {
    if (environment.enableMockData) {
      return of(true);
    }

    return this.httpApiService.healthCheck().pipe(
      map(response => response.success),
      catchError(() => of(false))
    );
  }
}
