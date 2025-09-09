import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { DataService } from '../services/data.service';
import { Dog, DogPark, WasteDispenser, User } from '../services/data.service';

@Component({
  selector: 'app-profile-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-management">
      <div class="header">
        <div class="header-content">
          <img src="assets/DoggoLoggo.png" alt="DoggoGO" class="header-logo">
          <div class="header-text">
            <h2>⚙️ Profilverwaltung</h2>
            <div *ngIf="currentUser" class="user-welcome">
              Willkommen, <strong>{{ getUsernameDisplay() }}</strong>! Hier können Sie Ihre Einträge verwalten.
            </div>
          </div>
        </div>
      </div>
      
      <!-- Tabs für verschiedene Bereiche -->
      <div class="tabs">
        <button 
          *ngFor="let tab of tabs" 
          [class.active]="activeTab === tab.id"
          (click)="setActiveTab(tab.id)"
          class="tab-button">
          {{ tab.icon }} {{ tab.label }}
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        
        <!-- Hunde Tab -->
        <div *ngIf="activeTab === 'dogs'" class="section">
          <div class="section-header">
            <h3>🐕 Meine Hunde</h3>
            <button (click)="showAddDogForm = !showAddDogForm" class="btn-add">
              {{ showAddDogForm ? 'Abbrechen' : '+ Hund hinzufügen' }}
            </button>
          </div>
          
          <div *ngIf="dogs.length === 0 && !loading" class="no-items">
            <p>Sie haben noch keine Hunde registriert.</p>
            <p>Nutzen Sie den Button oben, um Ihren ersten Hund hinzuzufügen.</p>
          </div>
          
          <div class="items-grid">
            <div *ngFor="let dog of dogs" class="item-card dog-card">
              <div class="item-info">
                <h4>🐕 {{ dog.name }}</h4>
                <p><strong>Rasse:</strong> {{ dog.breed }}</p>
                <p><strong>Alter:</strong> {{ dog.age }} Jahre</p>
                <p><strong>Spezialrasse:</strong> 
                  <span [class]="dog.isSpecialBreed ? 'special-breed' : 'normal-breed'">
                    {{ dog.isSpecialBreed ? 'Ja' : 'Nein' }}
                  </span>
                </p>
              </div>
              <div class="item-actions">
                <button (click)="editDog(dog)" class="btn-edit">✏️ Bearbeiten</button>
                <button (click)="deleteDogConfirm(dog.id)" class="btn-delete">🗑️ Löschen</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Parks Tab -->
        <div *ngIf="activeTab === 'parks'" class="section">
          <div class="section-header">
            <h3>🏞️ Meine Hundeparks</h3>
            <div class="info-badge">
              <span>💡 Neue Parks werden über die Karte hinzugefügt</span>
            </div>
          </div>
          
          <div *ngIf="userParks.length === 0 && !loading" class="no-items">
            <p>Sie haben noch keine Parks hinzugefügt.</p>
            <p>🗺️ Gehen Sie zur Karte und klicken Sie auf eine Stelle, um einen neuen Park hinzuzufügen.</p>
          </div>
          
          <div class="items-grid">
            <div *ngFor="let park of userParks" class="item-card park-card">
              <div class="item-info">
                <h4>🏞️ {{ park.name }}</h4>
                <p><strong>📍 Adresse:</strong> {{ park.address }}</p>
                <p><strong>⭐ Bewertung:</strong> {{ park.rating }}/5</p>
                <p><strong>🏠 Ausstattung:</strong> {{ park.facilities.join(', ') || 'Keine Angaben' }}</p>
                <p><strong>🕐 Status:</strong> 
                  <span [class]="park.isOpen ? 'status-open' : 'status-closed'">
                    {{ park.isOpen ? '✅ Geöffnet' : '❌ Geschlossen' }}
                  </span>
                </p>
              </div>
              <div class="item-actions">
                <button (click)="editPark(park)" class="btn-edit">✏️ Bearbeiten</button>
                <button (click)="deleteParkConfirm(park.id)" class="btn-delete">🗑️ Löschen</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Spender Tab -->
        <div *ngIf="activeTab === 'dispensers'" class="section">
          <div class="section-header">
            <h3>🗑️ Meine Hundesackerlspender</h3>
            <div class="info-badge">
              <span>💡 Neue Spender werden über die Karte hinzugefügt</span>
            </div>
          </div>
          
          <div *ngIf="userDispensers.length === 0 && !loading" class="no-items">
            <p>Sie haben noch keine Spender hinzugefügt.</p>
            <p>🗺️ Gehen Sie zur Karte und klicken Sie auf eine Stelle, um einen neuen Spender hinzuzufügen.</p>
          </div>
          
          <div class="items-grid">
            <div *ngFor="let dispenser of userDispensers" class="item-card dispenser-card">
              <div class="item-info">
                <h4>🗑️ {{ dispenser.name }}</h4>
                <p><strong>📍 Adresse:</strong> {{ dispenser.address }}</p>
                <p><strong>🏷️ Typ:</strong> {{ getDispenserTypeText(dispenser.type) }}</p>
                <p><strong>⚙️ Status:</strong> 
                  <span [class]="dispenser.isWorking ? 'status-working' : 'status-broken'">
                    {{ dispenser.isWorking ? '✅ Funktionsfähig' : '❌ Defekt' }}
                  </span>
                </p>
                <div *ngIf="dispenser.reportedIssues && dispenser.reportedIssues.length > 0">
                  <strong>⚠️ Gemeldete Probleme:</strong>
                  <ul class="issues-list">
                    <li *ngFor="let issue of dispenser.reportedIssues">{{ issue }}</li>
                  </ul>
                </div>
              </div>
              <div class="item-actions">
                <button (click)="editDispenser(dispenser)" class="btn-edit">✏️ Bearbeiten</button>
                <button (click)="deleteDispenserConfirm(dispenser.id)" class="btn-delete">🗑️ Löschen</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Hund hinzufügen/bearbeiten Formular -->
      <div *ngIf="activeTab === 'dogs' && showAddDogForm" class="section">
        <h3>{{ editingDog ? 'Hund bearbeiten' : 'Neuen Hund hinzufügen' }}</h3>
        <form (ngSubmit)="saveDog()" class="item-form">
          <div class="form-group">
            <label for="dogName">Name:</label>
            <input type="text" id="dogName" [(ngModel)]="currentDog.name" name="dogName" required>
          </div>
          
          <div class="form-group">
            <label for="breed">Rasse:</label>
            <select id="breed" [(ngModel)]="currentDog.breed" name="breed" required>
              <option value="">Rasse wählen...</option>
              <option value="Golden Retriever">Golden Retriever</option>
              <option value="Labrador">Labrador</option>
              <option value="German Shepherd">German Shepherd</option>
              <option value="Bullterrier">Bullterrier (Spezialrasse)</option>
              <option value="American Staffordshire Terrier">American Staffordshire Terrier (Spezialrasse)</option>
              <option value="Staffordshire Bullterrier">Staffordshire Bullterrier (Spezialrasse)</option>
              <option value="Other">Andere</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="age">Alter:</label>
            <input type="number" id="age" [(ngModel)]="currentDog.age" name="age" min="0" max="20" required>
          </div>
          
          <div class="form-group">
            <label>
              <input type="checkbox" [(ngModel)]="currentDog.isSpecialBreed" name="isSpecialBreed">
              Spezialrasse (unterliegt besonderen Vorschriften)
            </label>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn-save">{{ editingDog ? 'Aktualisieren' : 'Hinzufügen' }}</button>
            <button type="button" (click)="cancelDogEdit()" class="btn-cancel">Abbrechen</button>
          </div>
        </form>
      </div>

      <!-- Park bearbeiten Modal -->
      <div *ngIf="editingPark && showAddParkForm" class="modal-overlay" (click)="cancelParkEdit()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <button class="close-modal" (click)="cancelParkEdit()">&times;</button>
          <h3>🏞️ Park bearbeiten</h3>
          <form (ngSubmit)="savePark()" class="item-form">
            <div class="form-group">
              <label for="parkName">Name:</label>
              <input type="text" id="parkName" [(ngModel)]="newPark.name" name="parkName" required>
            </div>
            
            <div class="form-group">
              <label for="parkAddress">Adresse:</label>
              <input type="text" id="parkAddress" [(ngModel)]="newPark.address" name="parkAddress" required>
            </div>
            
            <div class="form-group">
              <label for="rating">Bewertung:</label>
              <select id="rating" [(ngModel)]="newPark.rating" name="rating">
                <option value="1">1 Stern</option>
                <option value="2">2 Sterne</option>
                <option value="3">3 Sterne</option>
                <option value="4">4 Sterne</option>
                <option value="5">5 Sterne</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="facilities">Ausstattung (kommagetrennt):</label>
              <input type="text" id="facilities" [(ngModel)]="newPark.facilitiesString" name="facilities" 
                     placeholder="z.B. Zaun, Wasserspender, Sitzgelegenheiten">
            </div>
            
            <div class="form-group">
              <label>
                <input type="checkbox" [(ngModel)]="newPark.isOpen" name="isOpen">
                Geöffnet
              </label>
            </div>
            
            <div class="form-actions">
              <button type="submit" class="btn-save">Aktualisieren</button>
              <button type="button" (click)="cancelParkEdit()" class="btn-cancel">Abbrechen</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Spender bearbeiten Modal -->
      <div *ngIf="editingDispenser && showAddDispenserForm" class="modal-overlay" (click)="cancelDispenserEdit()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <button class="close-modal" (click)="cancelDispenserEdit()">&times;</button>
          <h3>🗑️ Spender bearbeiten</h3>
          <form (ngSubmit)="saveDispenser()" class="item-form">
            <div class="form-group">
              <label for="dispenserName">Name:</label>
              <input type="text" id="dispenserName" [(ngModel)]="newDispenser.name" name="dispenserName" required>
            </div>
            
            <div class="form-group">
              <label for="dispenserAddress">Adresse:</label>
              <input type="text" id="dispenserAddress" [(ngModel)]="newDispenser.address" name="dispenserAddress" required>
            </div>
            
            <div class="form-group">
              <label for="dispenserType">Typ:</label>
              <select id="dispenserType" [(ngModel)]="newDispenser.type" name="dispenserType" required>
                <option value="">Typ wählen...</option>
                <option value="bags">Hundesackerl</option>
                <option value="bins">Mülleimer</option>
                <option value="both">Sackerl + Mülleimer</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>
                <input type="checkbox" [(ngModel)]="newDispenser.isWorking" name="isWorking">
                Funktionsfähig
              </label>
            </div>
            
            <div class="form-actions">
              <button type="submit" class="btn-save">Aktualisieren</button>
              <button type="button" (click)="cancelDispenserEdit()" class="btn-cancel">Abbrechen</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Loading Indicator -->
      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
        <p>Lade Daten...</p>
      </div>

      <!-- Error Messages -->
      <div *ngIf="error" class="error">
        <strong>⚠️ Fehler:</strong> {{ error }}
        <button (click)="error = ''" class="error-close">&times;</button>
      </div>
    </div>
  `,
  styles: [`
    .profile-management {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
      background: #f8f9fa;
      border-radius: 12px;
    }

    .header {
      margin-bottom: 30px;
      text-align: center;
    }

    .header-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 20px;
      flex-wrap: wrap;
    }

    .header-logo {
      height: 60px;
      width: auto;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .header-text {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .header h2 {
      color: #2c3e50;
      margin-bottom: 10px;
      font-size: 2rem;
    }

    .user-welcome {
      color: #6c757d;
      font-size: 1.1rem;
    }

    /* Tab Navigation */
    .tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 30px;
      background: #fff;
      padding: 8px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .tab-button {
      flex: 1;
      padding: 12px 20px;
      border: none;
      background: transparent;
      color: #6c757d;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 1rem;
      transition: all 0.3s ease;
    }

    .tab-button:hover {
      background: #e9ecef;
      color: #495057;
    }

    .tab-button.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    /* Section Headers */
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .section-header h3 {
      color: #2c3e50;
      margin: 0;
      font-size: 1.5rem;
    }

    .btn-add {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: white;
      border: none;
      border-radius: 8px;
      padding: 10px 20px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
    }

    .btn-add:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4);
    }

    /* Info Badge */
    .info-badge {
      background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 600;
      box-shadow: 0 2px 8px rgba(23, 162, 184, 0.3);
    }

    .info-badge span {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Modal Overlay */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      backdrop-filter: blur(4px);
    }

    .modal-content {
      background: white;
      padding: 30px;
      border-radius: 20px;
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      position: relative;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      transform: scale(1);
      transition: transform 0.3s ease;
    }

    .modal-content h3 {
      margin-top: 0;
      color: #333;
      font-size: 1.4rem;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e9ecef;
    }

    .close-modal {
      position: absolute;
      top: 15px;
      right: 20px;
      background: none;
      border: none;
      font-size: 24px;
      color: #999;
      cursor: pointer;
      padding: 5px;
      border-radius: 50%;
      width: 35px;
      height: 35px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }

    .close-modal:hover {
      background: #f8f9fa;
      color: #333;
    }

    /* No Items Message */
    .no-items {
      text-align: center;
      padding: 40px 20px;
      background: #fff;
      border-radius: 12px;
      color: #6c757d;
      border: 2px dashed #dee2e6;
    }

    /* Items Grid */
    .items-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
    }

    .item-card {
      background: #fff;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08);
      border: 1px solid #e9ecef;
      transition: all 0.3s ease;
    }

    .item-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    }

    .dog-card {
      border-left: 4px solid #28a745;
    }

    .park-card {
      border-left: 4px solid #007bff;
    }

    .dispenser-card {
      border-left: 4px solid #ffc107;
    }

    .item-info h4 {
      color: #2c3e50;
      margin: 0 0 15px 0;
      font-size: 1.3rem;
    }

    .item-info p {
      margin: 8px 0;
      color: #495057;
      font-size: 0.95rem;
    }

    .item-info strong {
      color: #2c3e50;
    }

    /* Status Indicators */
    .special-breed {
      color: #dc3545;
      font-weight: bold;
    }

    .normal-breed {
      color: #28a745;
      font-weight: bold;
    }

    .status-open, .status-working {
      color: #28a745;
      font-weight: bold;
    }

    .status-closed, .status-broken {
      color: #dc3545;
      font-weight: bold;
    }

    .issues-list {
      margin: 5px 0 0 20px;
      padding: 0;
    }

    .issues-list li {
      color: #dc3545;
      font-size: 0.9rem;
      margin: 2px 0;
    }

    /* Item Actions */
    .item-actions {
      display: flex;
      gap: 10px;
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #e9ecef;
    }

    .btn-edit, .btn-delete {
      flex: 1;
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.9rem;
      transition: all 0.3s ease;
    }

    .btn-edit {
      background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
      color: white;
      box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
    }

    .btn-edit:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 123, 255, 0.4);
    }

    .btn-delete {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      color: white;
      box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
    }

    .btn-delete:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
    }

    /* Forms */
    .item-form {
      background: #fff;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08);
      margin-bottom: 20px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      color: #2c3e50;
      font-weight: 600;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 12px;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s ease;
      box-sizing: border-box;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-group input[type="checkbox"] {
      width: auto;
      margin-right: 8px;
      transform: scale(1.2);
    }

    .form-actions {
      display: flex;
      gap: 15px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e9ecef;
    }

    .btn-save, .btn-cancel {
      flex: 1;
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 1rem;
      transition: all 0.3s ease;
    }

    .btn-save {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: white;
      box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
    }

    .btn-save:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4);
    }

    .btn-cancel {
      background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
      color: white;
      box-shadow: 0 2px 8px rgba(108, 117, 125, 0.3);
    }

    .btn-cancel:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(108, 117, 125, 0.4);
    }

    /* Loading and Error */
    .loading {
      text-align: center;
      padding: 40px;
      color: #6c757d;
      font-size: 1.1rem;
    }

    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error {
      background: #f8d7da;
      color: #721c24;
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
      border: 1px solid #f5c6cb;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .error-close {
      background: none;
      border: none;
      color: #721c24;
      font-size: 18px;
      cursor: pointer;
      padding: 5px;
      margin-left: 10px;
    }

    .error-close:hover {
      background: rgba(114, 28, 36, 0.1);
      border-radius: 50%;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .profile-management {
        padding: 15px;
      }

      .header-content {
        flex-direction: column;
        gap: 15px;
      }

      .header-logo {
        height: 50px;
      }

      .tabs {
        flex-direction: column;
      }

      .section-header {
        flex-direction: column;
        gap: 15px;
        text-align: center;
      }

      .items-grid {
        grid-template-columns: 1fr;
      }

      .item-actions {
        flex-direction: column;
      }

      .form-actions {
        flex-direction: column;
      }

      .modal-content {
        width: 95%;
        padding: 20px;
      }
    }
  `]
})
export class ProfileManagementComponent implements OnInit, OnDestroy {
  dogs: Dog[] = [];
  dogParks: DogPark[] = [];
  wasteDispensers: WasteDispenser[] = [];
  
  currentDog: Partial<Dog> = this.getEmptyDog();
  editingDog: Dog | null = null;
  editingPark: DogPark | null = null;
  editingDispenser: WasteDispenser | null = null;
  currentUser: User | null = null;
  
  // Tab Management
  activeTab: 'dogs' | 'parks' | 'dispensers' = 'dogs';
  tabs = [
    { id: 'dogs' as const, label: 'Meine Hunde', icon: '🐕' },
    { id: 'parks' as const, label: 'Meine Parks', icon: '🏞️' },
    { id: 'dispensers' as const, label: 'Meine Spender', icon: '🗑️' }
  ];
  
  // Form toggles
  showAddDogForm = false;
  showAddParkForm = false;
  showAddDispenserForm = false;
  
  // New item forms
  newPark: any = { 
    name: '', 
    address: '', 
    rating: 5, 
    isOpen: true, 
    facilitiesString: ''
  };
  newDispenser: any = { 
    name: '', 
    address: '', 
    type: '', 
    isWorking: true
  };
  
  loading = false;
  error = '';
  
  private destroy$ = new Subject<void>();

  // Computed properties for user's items
  get userParks(): DogPark[] {
    return this.dogParks.filter(park => park.userId === this.currentUser?.id);
  }
  
  get userDispensers(): WasteDispenser[] {
    return this.wasteDispensers.filter(dispenser => dispenser.userId === this.currentUser?.id);
  }

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private dataService: DataService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.error = 'Kein Benutzer angemeldet';
      return;
    }
    this.loadAllData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAllData() {
    this.loading = true;
    this.error = '';

    this.apiService.getAllDogs()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (dogs) => {
          this.dogs = dogs.filter(dog => dog.userId === this.currentUser?.id);
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Fehler beim Laden der Hunde: ' + err.message;
          this.loading = false;
        }
      });

    this.apiService.getAllDogParks()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (parks) => this.dogParks = parks,
        error: (err) => this.error = 'Fehler beim Laden der Hundeparks: ' + err.message
      });

    this.apiService.getAllWasteDispensers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (dispensers) => this.wasteDispensers = dispensers,
        error: (err) => this.error = 'Fehler beim Laden der Spender: ' + err.message
      });
  }

  // Tab Management
  setActiveTab(tabId: 'dogs' | 'parks' | 'dispensers'): void {
    this.activeTab = tabId;
    this.resetForms();
  }

  private resetForms(): void {
    this.showAddDogForm = false;
    this.showAddParkForm = false;
    this.showAddDispenserForm = false;
    this.editingDog = null;
    this.editingPark = null;
    this.editingDispenser = null;
    this.currentDog = this.getEmptyDog();
    this.newPark = { name: '', address: '', rating: 5, isOpen: true, facilitiesString: '' };
    this.newDispenser = { name: '', address: '', type: '', isWorking: true };
    this.error = '';
  }

  // Dog Management
  editDog(dog: Dog): void {
    this.editingDog = { ...dog };
    this.currentDog = {
      id: dog.id,
      name: dog.name,
      breed: dog.breed,
      age: dog.age,
      isSpecialBreed: dog.isSpecialBreed,
      userId: dog.userId
    };
    this.showAddDogForm = true;
  }

  deleteDogConfirm(dogId: number): void {
    if (confirm('Möchten Sie diesen Hund wirklich löschen?')) {
      this.apiService.deleteDog(dogId).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.dogs = this.dogs.filter(dog => dog.id !== dogId);
        },
        error: (err) => this.error = 'Fehler beim Löschen: ' + err.message
      });
    }
  }

  saveDog(): void {
    if (!this.currentDog.name || !this.currentDog.breed) {
      this.error = 'Bitte füllen Sie alle Pflichtfelder aus.';
      return;
    }

    const dogData = {
      ...this.currentDog,
      userId: this.currentUser!.id,
      isSpecialBreed: this.currentDog.isSpecialBreed || false
    };

    if (this.editingDog) {
      const fullDogData = {
        ...this.editingDog,
        ...dogData
      } as Dog;
      
      this.apiService.updateDog(this.editingDog.id, fullDogData).pipe(takeUntil(this.destroy$)).subscribe({
        next: (updatedDog: Dog | null) => {
          if (updatedDog) {
            const index = this.dogs.findIndex(d => d.id === this.editingDog!.id);
            if (index !== -1) {
              this.dogs[index] = updatedDog;
            }
          } else {
            // Fallback: Update lokal wenn Server kein updatedDog zurückgibt
            const index = this.dogs.findIndex(d => d.id === this.editingDog!.id);
            if (index !== -1) {
              this.dogs[index] = fullDogData;
            }
          }
          this.cancelDogEdit();
        },
        error: (err: any) => this.error = 'Fehler beim Aktualisieren: ' + err.message
      });
    } else {
      this.dataService.addDog(dogData as Omit<Dog, 'id'>).pipe(takeUntil(this.destroy$)).subscribe({
        next: (newDog: Dog) => {
          this.dogs.push(newDog);
          this.cancelDogEdit();
        },
        error: (err: any) => this.error = 'Fehler beim Hinzufügen: ' + err.message
      });
    }
  }

  cancelDogEdit(): void {
    this.editingDog = null;
    this.currentDog = this.getEmptyDog();
    this.showAddDogForm = false;
    this.error = '';
  }

  // Park Management
  editPark(park: DogPark): void {
    this.editingPark = { ...park };
    this.newPark = {
      name: park.name,
      address: park.address,
      rating: park.rating,
      isOpen: park.isOpen,
      facilitiesString: park.facilities.join(', ')
    };
    this.showAddParkForm = true;
  }

  deleteParkConfirm(parkId: number): void {
    if (confirm('Möchten Sie diesen Park wirklich löschen?')) {
      this.dataService.deleteDogPark(parkId).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.dogParks = this.dogParks.filter(park => park.id !== parkId);
        },
        error: (err) => this.error = 'Fehler beim Löschen: ' + err.message
      });
    }
  }

  savePark(): void {
    if (!this.newPark.name || !this.newPark.address) {
      this.error = 'Bitte füllen Sie alle Pflichtfelder aus.';
      return;
    }

    const facilities = this.newPark.facilitiesString 
      ? this.newPark.facilitiesString.split(',').map((f: string) => f.trim()).filter((f: string) => f.length > 0)
      : [];

    const parkData = {
      name: this.newPark.name,
      address: this.newPark.address,
      rating: this.newPark.rating,
      isOpen: this.newPark.isOpen,
      facilities: facilities,
      location: { lat: 48.2082, lng: 16.3738 },
      userId: this.currentUser!.id,
      isPublic: true
    };

    if (this.editingPark) {
      this.dataService.updateDogPark(this.editingPark.id, { ...this.editingPark, ...parkData });
      const index = this.dogParks.findIndex(p => p.id === this.editingPark!.id);
      if (index !== -1) {
        this.dogParks[index] = { ...this.editingPark, ...parkData };
      }
      this.cancelParkEdit();
    }
  }

  cancelParkEdit(): void {
    this.editingPark = null;
    this.newPark = { name: '', address: '', rating: 5, isOpen: true, facilitiesString: '' };
    this.showAddParkForm = false;
    this.error = '';
  }

  // Dispenser Management
  editDispenser(dispenser: WasteDispenser): void {
    this.editingDispenser = { ...dispenser };
    this.newDispenser = {
      name: dispenser.name,
      address: dispenser.address,
      type: dispenser.type,
      isWorking: dispenser.isWorking
    };
    this.showAddDispenserForm = true;
  }

  deleteDispenserConfirm(dispenserId: number): void {
    if (confirm('Möchten Sie diesen Spender wirklich löschen?')) {
      this.dataService.deleteWasteDispenser(dispenserId).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.wasteDispensers = this.wasteDispensers.filter(dispenser => dispenser.id !== dispenserId);
        },
        error: (err) => this.error = 'Fehler beim Löschen: ' + err.message
      });
    }
  }

  saveDispenser(): void {
    if (!this.newDispenser.name || !this.newDispenser.address || !this.newDispenser.type) {
      this.error = 'Bitte füllen Sie alle Pflichtfelder aus.';
      return;
    }

    const dispenserData = {
      name: this.newDispenser.name,
      address: this.newDispenser.address,
      type: this.newDispenser.type,
      isWorking: this.newDispenser.isWorking,
      location: { lat: 48.2082, lng: 16.3738 },
      userId: this.currentUser!.id,
      isPublic: true,
      reportedIssues: []
    };

    if (this.editingDispenser) {
      this.dataService.updateWasteDispenser(this.editingDispenser.id, { ...this.editingDispenser, ...dispenserData });
      const index = this.wasteDispensers.findIndex(d => d.id === this.editingDispenser!.id);
      if (index !== -1) {
        this.wasteDispensers[index] = { ...this.editingDispenser, ...dispenserData };
      }
      this.cancelDispenserEdit();
    }
  }

  cancelDispenserEdit(): void {
    this.editingDispenser = null;
    this.newDispenser = { name: '', address: '', type: '', isWorking: true };
    this.showAddDispenserForm = false;
    this.error = '';
  }

  // Helper Methods
  getDispenserTypeText(type: string): string {
    switch(type) {
      case 'bags': return 'Hundesackerl';
      case 'bins': return 'Mülleimer';
      case 'both': return 'Sackerl + Mülleimer';
      default: return type;
    }
  }

  getUsernameDisplay(): string {
    if (!this.currentUser) return 'Unbekannt';
    return this.currentUser.username || this.currentUser.name.toLowerCase().replace(/\s+/g, '');
  }

  private getEmptyDog(): Partial<Dog> {
    return {
      name: '',
      breed: '',
      age: 1,
      isSpecialBreed: false,
      userId: this.currentUser?.id
    };
  }
}
