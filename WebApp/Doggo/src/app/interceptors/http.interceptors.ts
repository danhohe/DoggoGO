import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap, finalize, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { HttpApiService } from '../services/http-api.service';
import { AuthResponse } from '../interfaces/api.interfaces';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private router: Router,
    private httpApiService: HttpApiService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Füge automatisch den Auth-Token hinzu
    const authToken = this.getAuthToken();
    if (authToken && !this.isAuthRequest(request)) {
      request = this.addTokenToRequest(request, authToken);
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle 401 Unauthorized
        if (error.status === 401 && !this.isAuthRequest(request)) {
          return this.handle401Error(request, next);
        }

        // Handle andere Fehler
        return throwError(() => error);
      })
    );
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('doggo_auth_token');
    }
    return null;
  }

  private isAuthRequest(request: HttpRequest<any>): boolean {
    return request.url.includes('/auth/');
  }

  private addTokenToRequest(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = localStorage.getItem('doggo_refresh_token');
      
      if (refreshToken) {
        return this.httpApiService.refreshToken().pipe(
          switchMap((response: AuthResponse) => {
            this.isRefreshing = false;
            if (response.success && response.data?.token) {
              this.refreshTokenSubject.next(response.data.token);
              return next.handle(this.addTokenToRequest(request, response.data.token));
            } else {
              this.logout();
              return throwError(() => new Error('Token refresh failed'));
            }
          }),
          catchError((error) => {
            this.isRefreshing = false;
            this.logout();
            return throwError(() => error);
          })
        );
      } else {
        this.logout();
        return throwError(() => new Error('No refresh token available'));
      }
    } else {
      // Warte auf Token-Refresh
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap((token) => next.handle(this.addTokenToRequest(request, token)))
      );
    }
  }

  private logout(): void {
    // Token entfernen
    localStorage.removeItem('doggo_auth_token');
    localStorage.removeItem('doggo_refresh_token');
    
    // Zur Login-Seite weiterleiten
    this.router.navigate(['/login']);
  }
}

// Weitere nützliche Interceptors

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private activeRequests = 0;
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Ignore loading für bestimmte URLs
    if (this.shouldIgnoreLoading(request)) {
      return next.handle(request);
    }

    this.activeRequests++;
    this.updateLoadingState();

    return next.handle(request).pipe(
      catchError((error) => {
        this.activeRequests--;
        this.updateLoadingState();
        return throwError(() => error);
      }),
      // Auch bei erfolgreichen Requests
      finalize(() => {
        this.activeRequests--;
        this.updateLoadingState();
      })
    );
  }

  private shouldIgnoreLoading(request: HttpRequest<any>): boolean {
    // Ignore loading für schnelle Requests wie health checks
    return request.url.includes('/health') || 
           request.url.includes('/notifications');
  }

  private updateLoadingState(): void {
    this.loadingSubject.next(this.activeRequests > 0);
  }
}

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Ein unbekannter Fehler ist aufgetreten';

        if (error.error instanceof ErrorEvent) {
          // Client-seitiger Fehler
          errorMessage = `Client Error: ${error.error.message}`;
        } else {
          // Server-seitiger Fehler
          switch (error.status) {
            case 0:
              errorMessage = 'Keine Verbindung zum Server möglich';
              break;
            case 400:
              errorMessage = error.error?.message || 'Ungültige Anfrage';
              break;
            case 401:
              errorMessage = 'Nicht autorisiert - bitte melden Sie sich an';
              break;
            case 403:
              errorMessage = 'Zugriff verweigert';
              break;
            case 404:
              errorMessage = 'Ressource nicht gefunden';
              break;
            case 422:
              errorMessage = error.error?.message || 'Validierungsfehler';
              break;
            case 429:
              errorMessage = 'Zu viele Anfragen - bitte versuchen Sie es später erneut';
              break;
            case 500:
              errorMessage = 'Serverfehler - bitte versuchen Sie es später erneut';
              break;
            case 503:
              errorMessage = 'Service nicht verfügbar';
              break;
            default:
              errorMessage = error.error?.message || `HTTP Error ${error.status}`;
          }
        }

        // Logging für Entwicklung
        console.error('HTTP Error:', {
          status: error.status,
          message: errorMessage,
          url: request.url,
          error: error
        });

        // Erstelle erweiterten Error
        const enhancedError = new Error(errorMessage);
        (enhancedError as any).status = error.status;
        (enhancedError as any).originalError = error;

        return throwError(() => enhancedError);
      })
    );
  }
}

// Cache Interceptor für Performance
@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  private cache = new Map<string, { response: HttpEvent<any>; timestamp: number }>();
  private readonly cacheTime = 5 * 60 * 1000; // 5 Minuten

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Nur GET Requests cachen
    if (request.method !== 'GET' || !this.shouldCache(request)) {
      return next.handle(request);
    }

    const cachedResponse = this.getFromCache(request.url);
    if (cachedResponse) {
      return new Observable(observer => {
        observer.next(cachedResponse);
        observer.complete();
      });
    }

    return next.handle(request).pipe(
      tap(response => {
        if (response instanceof HttpResponse) {
          this.addToCache(request.url, response);
        }
      })
    );
  }

  private shouldCache(request: HttpRequest<any>): boolean {
    // Cache nur bestimmte Endpoints
    return request.url.includes('/statistics') ||
           request.url.includes('/dog-parks') ||
           request.url.includes('/waste-dispensers');
  }

  private getFromCache(url: string): HttpEvent<any> | null {
    const cached = this.cache.get(url);
    if (cached && Date.now() - cached.timestamp < this.cacheTime) {
      return cached.response;
    }
    return null;
  }

  private addToCache(url: string, response: HttpEvent<any>): void {
    this.cache.set(url, {
      response,
      timestamp: Date.now()
    });
  }

  clearCache(): void {
    this.cache.clear();
  }
}
