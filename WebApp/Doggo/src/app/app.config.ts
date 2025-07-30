import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { 
  AuthInterceptor, 
  LoadingInterceptor, 
  ErrorInterceptor, 
  CacheInterceptor 
} from './interceptors/http.interceptors';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        // AuthInterceptor für automatische Token-Behandlung
        // LoadingInterceptor für globale Loading-States
        // ErrorInterceptor für einheitliche Error-Behandlung
        // CacheInterceptor für Performance-Optimierung
      ])
    )
  ]
};
