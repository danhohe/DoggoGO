import { Routes } from '@angular/router';
import { ProfileManagementComponent } from './components/profile-management.component';
import { LoginComponent } from './components/login.component';
import { AppComponent } from './app.component';
import { AuthGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/map', pathMatch: 'full' },
  { path: 'map', component: AppComponent },
  { path: 'login', component: LoginComponent },
  { path: 'profile', component: ProfileManagementComponent, canActivate: [AuthGuard] }, // AuthGuard wieder aktiviert
  { path: 'dogs', redirectTo: '/profile', pathMatch: 'full' }, // Backward compatibility
  { path: '**', redirectTo: '/map' }
];
