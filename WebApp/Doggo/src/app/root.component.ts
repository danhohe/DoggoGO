import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavigationComponent } from './components/navigation.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavigationComponent],
  template: `
    <div class="app-container">
      <app-navigation></app-navigation>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    .main-content {
      min-height: calc(100vh - 60px);
      padding: 20px 0;
    }

    @media (max-width: 768px) {
      .main-content {
        min-height: calc(100vh - 50px);
        padding: 15px 0;
      }
    }
  `]
})
export class RootComponent {}
