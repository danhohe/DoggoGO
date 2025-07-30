import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { map, catchError, retry, timeout } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { 
  ApiResponse, 
  PaginatedResponse, 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest,
  ApiUser,
  ApiDog,
  CreateDogRequest,
  UpdateDogRequest,
  ApiDogPark,
  CreateDogParkRequest,
  UpdateDogParkRequest,
  ApiWasteDispenser,
  CreateWasteDispenserRequest,
  UpdateWasteDispenserRequest,
  ReportIssueRequest,
  SearchParams,
  SearchResponse,
  ApiStats,
  ApiNotification,
  FileUploadResponse
} from '../interfaces/api.interfaces';

@Injectable({
  providedIn: 'root'
})
export class HttpApiService {
  private readonly baseUrl = environment.apiUrl;
  private readonly timeout = 30000; // 30 Sekunden Timeout
  
  // Token Management
  private tokenSubject = new BehaviorSubject<string | null>(this.getStoredToken());
  public token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ===== TOKEN MANAGEMENT =====
  
  private getStoredToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('doggo_auth_token');
    }
    return null;
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('doggo_auth_token', token);
    }
    this.tokenSubject.next(token);
  }

  private removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('doggo_auth_token');
    }
    this.tokenSubject.next(null);
  }

  // ===== HTTP HEADERS =====
  
  private getHeaders(includeAuth: boolean = true): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    if (includeAuth) {
      const token = this.getStoredToken();
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }

    return headers;
  }

  // ===== ERROR HANDLING =====
  
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ein unbekannter Fehler ist aufgetreten';
    
    if (error.error instanceof ErrorEvent) {
      // Client-seitiger Fehler
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-seitiger Fehler
      switch (error.status) {
        case 400:
          errorMessage = 'Ungültige Anfrage';
          break;
        case 401:
          errorMessage = 'Nicht autorisiert - bitte melden Sie sich an';
          this.removeToken(); // Token entfernen bei 401
          break;
        case 403:
          errorMessage = 'Zugriff verweigert';
          break;
        case 404:
          errorMessage = 'Ressource nicht gefunden';
          break;
        case 422:
          errorMessage = 'Ungültige Daten';
          break;
        case 500:
          errorMessage = 'Serverfehler - bitte versuchen Sie es später erneut';
          break;
        case 503:
          errorMessage = 'Service nicht verfügbar';
          break;
        default:
          errorMessage = `Server Error: ${error.status} - ${error.message}`;
      }
      
      // Wenn der Server eine spezifische Fehlermeldung sendet
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }
    }

    console.error('HTTP Error:', error);
    return throwError(() => new Error(errorMessage));
  }

  // ===== AUTHENTICATION =====
  
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, credentials, {
      headers: this.getHeaders(false)
    }).pipe(
      timeout(this.timeout),
      map(response => {
        if (response.success && response.data?.token) {
          this.setToken(response.data.token);
        }
        return response;
      }),
      catchError(this.handleError.bind(this))
    );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, userData, {
      headers: this.getHeaders(false)
    }).pipe(
      timeout(this.timeout),
      map(response => {
        if (response.success && response.data?.token) {
          this.setToken(response.data.token);
        }
        return response;
      }),
      catchError(this.handleError.bind(this))
    );
  }

  logout(): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/auth/logout`, {}, {
      headers: this.getHeaders()
    }).pipe(
      timeout(this.timeout),
      map(response => {
        this.removeToken();
        return response;
      }),
      catchError(error => {
        this.removeToken(); // Token auch bei Fehlern entfernen
        return this.handleError(error);
      })
    );
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem('doggo_refresh_token');
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/refresh`, {
      refreshToken
    }, {
      headers: this.getHeaders(false)
    }).pipe(
      timeout(this.timeout),
      map(response => {
        if (response.success && response.data?.token) {
          this.setToken(response.data.token);
        }
        return response;
      }),
      catchError(this.handleError.bind(this))
    );
  }

  // ===== USER MANAGEMENT =====
  
  getCurrentUser(): Observable<ApiResponse<ApiUser>> {
    return this.http.get<ApiResponse<ApiUser>>(`${this.baseUrl}/user/profile`, {
      headers: this.getHeaders()
    }).pipe(
      timeout(this.timeout),
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }

  updateUser(updates: Partial<ApiUser>): Observable<ApiResponse<ApiUser>> {
    return this.http.put<ApiResponse<ApiUser>>(`${this.baseUrl}/user/profile`, updates, {
      headers: this.getHeaders()
    }).pipe(
      timeout(this.timeout),
      catchError(this.handleError.bind(this))
    );
  }

  // ===== DOGS =====
  
  getDogs(params?: SearchParams): Observable<PaginatedResponse<ApiDog>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        const value = (params as any)[key];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<PaginatedResponse<ApiDog>>(`${this.baseUrl}/dogs`, {
      headers: this.getHeaders(),
      params: httpParams
    }).pipe(
      timeout(this.timeout),
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }

  getDog(id: number): Observable<ApiResponse<ApiDog>> {
    return this.http.get<ApiResponse<ApiDog>>(`${this.baseUrl}/dogs/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      timeout(this.timeout),
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }

  createDog(dogData: CreateDogRequest): Observable<ApiResponse<ApiDog>> {
    return this.http.post<ApiResponse<ApiDog>>(`${this.baseUrl}/dogs`, dogData, {
      headers: this.getHeaders()
    }).pipe(
      timeout(this.timeout),
      catchError(this.handleError.bind(this))
    );
  }

  updateDog(id: number, updates: UpdateDogRequest): Observable<ApiResponse<ApiDog>> {
    return this.http.put<ApiResponse<ApiDog>>(`${this.baseUrl}/dogs/${id}`, updates, {
      headers: this.getHeaders()
    }).pipe(
      timeout(this.timeout),
      catchError(this.handleError.bind(this))
    );
  }

  deleteDog(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.baseUrl}/dogs/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      timeout(this.timeout),
      catchError(this.handleError.bind(this))
    );
  }

  // ===== DOG PARKS =====
  
  getDogParks(params?: SearchParams): Observable<SearchResponse<ApiDogPark>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        const value = (params as any)[key];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<SearchResponse<ApiDogPark>>(`${this.baseUrl}/dog-parks`, {
      headers: this.getHeaders(),
      params: httpParams
    }).pipe(
      timeout(this.timeout),
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }

  getDogPark(id: number): Observable<ApiResponse<ApiDogPark>> {
    return this.http.get<ApiResponse<ApiDogPark>>(`${this.baseUrl}/dog-parks/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      timeout(this.timeout),
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }

  createDogPark(parkData: CreateDogParkRequest): Observable<ApiResponse<ApiDogPark>> {
    return this.http.post<ApiResponse<ApiDogPark>>(`${this.baseUrl}/dog-parks`, parkData, {
      headers: this.getHeaders()
    }).pipe(
      timeout(this.timeout),
      catchError(this.handleError.bind(this))
    );
  }

  updateDogPark(id: number, updates: UpdateDogParkRequest): Observable<ApiResponse<ApiDogPark>> {
    return this.http.put<ApiResponse<ApiDogPark>>(`${this.baseUrl}/dog-parks/${id}`, updates, {
      headers: this.getHeaders()
    }).pipe(
      timeout(this.timeout),
      catchError(this.handleError.bind(this))
    );
  }

  deleteDogPark(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.baseUrl}/dog-parks/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      timeout(this.timeout),
      catchError(this.handleError.bind(this))
    );
  }

  // ===== WASTE DISPENSERS =====
  
  getWasteDispensers(params?: SearchParams): Observable<SearchResponse<ApiWasteDispenser>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        const value = (params as any)[key];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<SearchResponse<ApiWasteDispenser>>(`${this.baseUrl}/waste-dispensers`, {
      headers: this.getHeaders(),
      params: httpParams
    }).pipe(
      timeout(this.timeout),
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }

  getWasteDispenser(id: number): Observable<ApiResponse<ApiWasteDispenser>> {
    return this.http.get<ApiResponse<ApiWasteDispenser>>(`${this.baseUrl}/waste-dispensers/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      timeout(this.timeout),
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }

  createWasteDispenser(dispenserData: CreateWasteDispenserRequest): Observable<ApiResponse<ApiWasteDispenser>> {
    return this.http.post<ApiResponse<ApiWasteDispenser>>(`${this.baseUrl}/waste-dispensers`, dispenserData, {
      headers: this.getHeaders()
    }).pipe(
      timeout(this.timeout),
      catchError(this.handleError.bind(this))
    );
  }

  updateWasteDispenser(id: number, updates: UpdateWasteDispenserRequest): Observable<ApiResponse<ApiWasteDispenser>> {
    return this.http.put<ApiResponse<ApiWasteDispenser>>(`${this.baseUrl}/waste-dispensers/${id}`, updates, {
      headers: this.getHeaders()
    }).pipe(
      timeout(this.timeout),
      catchError(this.handleError.bind(this))
    );
  }

  deleteWasteDispenser(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.baseUrl}/waste-dispensers/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      timeout(this.timeout),
      catchError(this.handleError.bind(this))
    );
  }

  reportWasteDispenserIssue(id: number, issueData: ReportIssueRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/waste-dispensers/${id}/report`, issueData, {
      headers: this.getHeaders()
    }).pipe(
      timeout(this.timeout),
      catchError(this.handleError.bind(this))
    );
  }

  // ===== SEARCH =====
  
  searchAll(params: SearchParams): Observable<SearchResponse<any>> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      const value = (params as any)[key];
      if (value !== undefined && value !== null) {
        httpParams = httpParams.set(key, value.toString());
      }
    });

    return this.http.get<SearchResponse<any>>(`${this.baseUrl}/search`, {
      headers: this.getHeaders(),
      params: httpParams
    }).pipe(
      timeout(this.timeout),
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }

  // ===== STATISTICS =====
  
  getStatistics(): Observable<ApiResponse<ApiStats>> {
    return this.http.get<ApiResponse<ApiStats>>(`${this.baseUrl}/statistics`, {
      headers: this.getHeaders()
    }).pipe(
      timeout(this.timeout),
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }

  // ===== NOTIFICATIONS =====
  
  getNotifications(): Observable<PaginatedResponse<ApiNotification>> {
    return this.http.get<PaginatedResponse<ApiNotification>>(`${this.baseUrl}/notifications`, {
      headers: this.getHeaders()
    }).pipe(
      timeout(this.timeout),
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }

  markNotificationAsRead(id: number): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.baseUrl}/notifications/${id}/read`, {}, {
      headers: this.getHeaders()
    }).pipe(
      timeout(this.timeout),
      catchError(this.handleError.bind(this))
    );
  }

  // ===== FILE UPLOAD =====
  
  uploadFile(file: File, category: 'dog' | 'park' | 'dispenser' = 'dog'): Observable<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    // Für File Upload kein Content-Type Header setzen (Browser macht das automatisch)
    const headers = new HttpHeaders({
      'Accept': 'application/json'
    });

    const token = this.getStoredToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.post<FileUploadResponse>(`${this.baseUrl}/upload`, formData, {
      headers
    }).pipe(
      timeout(60000), // 60 Sekunden für File Upload
      catchError(this.handleError.bind(this))
    );
  }

  // ===== HEALTH CHECK =====
  
  healthCheck(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.baseUrl}/health`, {
      headers: this.getHeaders(false)
    }).pipe(
      timeout(5000),
      catchError(this.handleError.bind(this))
    );
  }

  // ===== UTILITY METHODS =====
  
  isTokenValid(): boolean {
    const token = this.getStoredToken();
    if (!token) return false;

    try {
      // JWT Token Payload dekodieren (vereinfacht)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch {
      return false;
    }
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
}
