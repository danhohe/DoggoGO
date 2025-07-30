import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { User } from '../services/data.service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navigation">
      <div class="nav-container">
        <div class="nav-brand">
          <img src="assets/DoggoLoggo.png" alt="DoggoGO" class="logo">
          <span class="brand-text">DoggoGO</span>
        </div>
        
        <div class="nav-links">
          <a routerLink="/map" routerLinkActive="active" class="nav-link">
            🗺️ Karte
          </a>
          <a routerLink="/profile" routerLinkActive="active" class="nav-link" *ngIf="currentUser$ | async">
            ⚙️ Profilverwaltung
          </a>
        </div>

        <div class="nav-auth">
          <div *ngIf="currentUser$ | async as user" class="user-info">
            <span class="welcome-text">Hallo, {{user.name}}!</span>
            <button (click)="logout()" class="logout-btn">
              Abmelden
            </button>
          </div>
          <div *ngIf="!(currentUser$ | async)" class="auth-links">
            <a routerLink="/login" routerLinkActive="active" class="nav-link login-link">
              Anmelden
            </a>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navigation {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .nav-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .nav-brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo {
      width: 40px;
      height: 40px;
      border-radius: 50%;
    }

    .brand-text {
      font-size: 1.5rem;
      font-weight: bold;
      color: white;
      text-shadow: 0 1px 2px rgba(0,0,0,0.2);
    }

    .nav-links {
      display: flex;
      gap: 20px;
    }

    .nav-auth {
      display: flex;
      align-items: center;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .welcome-text {
      color: white;
      font-weight: 500;
    }

    .logout-btn {
      background: rgba(255,255,255,0.2);
      color: white;
      border: 1px solid rgba(255,255,255,0.3);
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .logout-btn:hover {
      background: rgba(255,255,255,0.3);
    }

    .auth-links {
      display: flex;
      gap: 10px;
    }

    .login-link {
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.3);
    }

    .login-link:hover {
      background: rgba(255,255,255,0.2);
    }

    @media (max-width: 768px) {
      .nav-container {
        padding: 0 15px;
        height: 50px;
      }

      .brand-text {
        font-size: 1.3rem;
      }

      .nav-links {
        gap: 10px;
      }

      .nav-link {
        padding: 6px 12px;
        font-size: 0.9rem;
      }

      .logo {
        height: 35px;
        width: 35px;
      }
    }
  `]
})
export class NavigationComponent {
  currentUser$: Observable<User | null>;

  constructor(private authService: AuthService) {
    this.currentUser$ = this.authService.currentUser$;
  }

  logout(): void {
    this.authService.logout();
  }
}
