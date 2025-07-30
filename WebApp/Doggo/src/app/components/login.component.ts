import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <img src="assets/DoggoLoggo.png" alt="DoggoGO" class="logo">
          <h1>DoggoGO Login</h1>
          <p class="subtitle">Melden Sie sich an, um Ihre Hunde zu verwalten</p>
        </div>

        <div class="login-tabs">
          <button 
            class="tab-button" 
            [class.active]="activeTab === 'login'"
            (click)="activeTab = 'login'">
            Anmelden
          </button>
          <button 
            class="tab-button" 
            [class.active]="activeTab === 'register'"
            (click)="activeTab = 'register'">
            Registrieren
          </button>
        </div>

        <!-- Login Form -->
        <form *ngIf="activeTab === 'login'" (ngSubmit)="onLogin()" class="login-form">
          <div class="form-group">
            <label for="loginEmail">E-Mail</label>
            <input 
              type="email" 
              id="loginEmail"
              [(ngModel)]="loginData.email" 
              name="loginEmail"
              placeholder="ihre&#64;email.de"
              required>
          </div>
          
          <div class="form-group">
            <label for="loginPassword">Passwort</label>
            <input 
              type="password" 
              id="loginPassword"
              [(ngModel)]="loginData.password" 
              name="loginPassword"
              placeholder="Ihr Passwort"
              required>
          </div>

          <button type="submit" class="login-button" [disabled]="isLoading">
            <span *ngIf="!isLoading">Anmelden</span>
            <span *ngIf="isLoading">Wird angemeldet...</span>
          </button>
        </form>

        <!-- Register Form -->
        <form *ngIf="activeTab === 'register'" (ngSubmit)="onRegister()" class="login-form">
          <div class="form-group">
            <label for="registerName">Name</label>
            <input 
              type="text" 
              id="registerName"
              [(ngModel)]="registerData.name" 
              name="registerName"
              placeholder="Ihr Name"
              required>
          </div>

          <div class="form-group">
            <label for="registerEmail">E-Mail</label>
            <input 
              type="email" 
              id="registerEmail"
              [(ngModel)]="registerData.email" 
              name="registerEmail"
              placeholder="ihre&#64;email.de"
              required>
          </div>
          
          <div class="form-group">
            <label for="registerPassword">Passwort</label>
            <input 
              type="password" 
              id="registerPassword"
              [(ngModel)]="registerData.password" 
              name="registerPassword"
              placeholder="Wählen Sie ein Passwort"
              required>
          </div>

          <button type="submit" class="login-button" [disabled]="isLoading">
            <span *ngIf="!isLoading">Registrieren</span>
            <span *ngIf="isLoading">Wird registriert...</span>
          </button>
        </form>

        <div *ngIf="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div class="demo-info">
          <h3>Demo-Zugangsdaten:</h3>
          <p><strong>E-Mail:</strong> max&#64;example.com</p>
          <p><strong>Passwort:</strong> beliebig (wird nicht geprüft)</p>
        </div>

        <div class="navigation-link">
          <a href="/map">← Zurück zur Karte (ohne Hundeverwaltung)</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .login-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
      padding: 40px;
      width: 100%;
      max-width: 400px;
    }

    .login-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .logo {
      width: 80px;
      height: 80px;
      margin-bottom: 20px;
      border-radius: 50%;
    }

    h1 {
      color: #333;
      margin: 0 0 10px 0;
      font-size: 24px;
    }

    .subtitle {
      color: #666;
      margin: 0;
    }

    .login-tabs {
      display: flex;
      border-bottom: 1px solid #eee;
      margin-bottom: 30px;
    }

    .tab-button {
      flex: 1;
      padding: 12px;
      border: none;
      background: none;
      cursor: pointer;
      color: #666;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .tab-button.active {
      color: #667eea;
      border-bottom: 2px solid #667eea;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    label {
      font-weight: 500;
      color: #333;
    }

    input {
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 16px;
      transition: border-color 0.3s ease;
    }

    input:focus {
      outline: none;
      border-color: #667eea;
    }

    .login-button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      transition: transform 0.2s ease;
      margin-top: 10px;
    }

    .login-button:hover:not(:disabled) {
      transform: translateY(-2px);
    }

    .login-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .error-message {
      background: #fee;
      color: #c33;
      padding: 12px;
      border-radius: 6px;
      margin-top: 20px;
      text-align: center;
    }

    .demo-info {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 6px;
      margin-top: 30px;
      border-left: 4px solid #667eea;
    }

    .demo-info h3 {
      margin: 0 0 10px 0;
      color: #333;
      font-size: 16px;
    }

    .demo-info p {
      margin: 5px 0;
      color: #666;
    }

    .navigation-link {
      text-align: center;
      margin-top: 20px;
    }

    .navigation-link a {
      color: #667eea;
      text-decoration: none;
    }

    .navigation-link a:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent {
  activeTab: 'login' | 'register' = 'login';
  isLoading = false;
  errorMessage = '';

  loginData = {
    email: '',
    password: ''
  };

  registerData = {
    name: '',
    email: '',
    password: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginData.email, this.loginData.password)
      .subscribe({
        next: (success) => {
          this.isLoading = false;
          if (success) {
            this.router.navigate(['/profile']);
          } else {
            this.errorMessage = 'Ungültige Anmeldedaten. Versuchen Sie es mit max&#64;example.com';
          }
        },
        error: () => {
          this.isLoading = false;
          this.errorMessage = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
        }
      });
  }

  onRegister(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register(
      this.registerData.email, 
      this.registerData.name, 
      this.registerData.password
    ).subscribe({
      next: (success) => {
        this.isLoading = false;
        if (success) {
          this.router.navigate(['/profile']);
        } else {
          this.errorMessage = 'Diese E-Mail-Adresse ist bereits registriert.';
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
      }
    });
  }
}
