import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { GoogleMapsModule, MapInfoWindow } from '@angular/google-maps';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DataService, DogPark, WasteDispenser, User, Dog } from './services/data.service';
import { AuthService } from './services/auth.service';

interface DogCategoryInfo {
  criteria: string;
  laws: string;
  guidelines: string;
 
}

interface DogCategory {
  name: string;
  info: DogCategoryInfo;
}

// Wetterdaten-Interface
interface WeatherData {
  temp: number;
  description: string;
  icon: string;
  main: string; // Wettertyp für Emoji
}

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule, FormsModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;
  
  center: google.maps.LatLngLiteral = { lat: 48.3069, lng: 14.2868 }; // HTL-Leonding
  zoom: number = 15;

  // Marker für eigenen Standort
  userLocationMarker: google.maps.MarkerOptions | null = null;
  
  // Marker für verschiedene Standorte
  dogParkMarkers: google.maps.MarkerOptions[] = [];
  wasteDispenserMarkers: google.maps.MarkerOptions[] = [];
  
  // Daten von DataService
  dogParks: DogPark[] = [];
  wasteDispensers: WasteDispenser[] = [];
  
  // Filter für Marker-Anzeige
  showDogParks = true;
  showWasteDispensers = true;
  
  // Bearbeitungsmodus für direktes Bearbeiten durch Klick
  editMode = false;
  
  // Info Window Content und Position
  infoWindowContent = '';
  infoWindowPosition: google.maps.LatLngLiteral | null = null;

  // Current User für Berechtigungen
  currentUser: User | null = null;
  
  // Meine Hunde
  myDogs: Dog[] = [];
  selectedDog: Dog | null = null;
  showMyDogs = false; // Toggle zwischen allgemeinen Infos und meinen Hunden
  
  // Modal für neue Einträge
  showAddLocationModal = false;
  showLocationTypeModal = false;
  newLocationPosition: google.maps.LatLngLiteral | null = null;
  newLocationType: 'park' | 'dispenser' | null = null;
  
  // Form für neue Einträge
  newLocationForm = {
    name: '',
    address: '',
    isPublic: true,
    // Park-spezifisch
    facilities: '',
    rating: 5,
    isOpen: true,
    // Dispenser-spezifisch
    type: 'bags' as 'bags' | 'bins' | 'both',
    isWorking: true
  };

  // Status-Update-Eigenschaften
  showStatusUpdateModal = false;
  selectedStationId: number | null = null;
  selectedStationType: 'park' | 'dispenser' | null = null;
  statusUpdateForm = {
    isOpen: true,
    isWorking: true,
    newIssue: '',
    rating: 3
  };

  dogCategories: DogCategory[] = [
    {
      name: 'Spezielle Hunderassen',
      info: {
        criteria: `Folgende Hunderassen und deren Kreuzungen gelten als speziell:
- Bullterrier
- American Staffordshire Terrier
- Staffordshire Bullterrier
- Dogo Argentino
- American Pit Bull Terrier
- Tosa Inu`,
        laws: `Vorschriften:
- Pflicht zur Alltagstauglichkeitsprüfung (ATP) ab dem 12. Lebensmonat
- Leinen- und Maulkorbpflicht im öffentlichen Raum
- Halter:innen müssen mindestens 16 Jahre alt, sachkundig und verlässlich sein
- Es darf maximal gleichzeitig mit einem weiteren großen, auffälligen oder speziellen Hund spazieren gegangen werden
(Kleine, unauffällige Hunde sind hiervon ausgenommen)`,
        guidelines: `Eigentümer müssen sicherstellen, dass der Hund immer an der Leine geführt wird und einen Maulkorb trägt, wenn sie öffentliche Orte betreten.`,
      }
    },
    {
      name: 'Große Hunde',
      info: {
        criteria: `Definition: Widerristhöhe ≥ 40 cm oder Gewicht ≥ 20 kg`,
        laws: `Vorschriften:
- Sachkunde-Kurs erforderlich
- Alltagstauglichkeitsprüfung (ATP) erforderlich
- Leinen- oder Maulkorbpflicht im Ortsgebiet
- Maximal zwei große Hunde gleichzeitig führen`,
        guidelines: `Besitzer großer Hunde sollten sicherstellen, dass der Hund genug Auslauf bekommt und sich in städtischen Gebieten sicher verhält.`,
      }
    },
    {
      name: 'Auffällige Hunde',
      info: {
        criteria: `Definition: Hunde mit aggressivem Verhalten oder Vorfällen`,
        laws: `Vorschriften:
- Leinen- und Maulkorbpflicht im öffentlichen Raum
- Verhaltensmedizinische Evaluierung + Zusatzausbildung
- Halter:innen müssen mindestens 16 Jahre alt, sachkundig und verlässlich sein
- Nicht gemeinsam mit einem weiteren auffälligen Hund und höchstens mit einem großen Hund führen
(Kleine, unauffällige Hunde sind hiervon ausgenommen)`,
        guidelines: `Wenn ein Hund als auffällig gilt, kann der Besitzer verpflichtet werden, den Hund durch einen Fachmann zu trainieren oder ihn in bestimmten öffentlichen Bereichen zu beschränken.`,
      }
    },
    {
      name: 'Kleine Hunde',
      info: {
        criteria: `Definition: Widerristhöhe < 40 cm und Gewicht < 20 kg`,
        laws: `Vorschriften:
- Sachkunde-Kurs erforderlich
- Leinen- oder Maulkorbpflicht im Ortsgebiet
- Keine Einschränkungen bei Anzahl oder Führung`,
        guidelines: `Kleine Hunde benötigen regelmäßige Bewegung und eine ausgewogene Ernährung, um gesund zu bleiben.`,
      }
    }
  ];

  // Standardmäßig keine Kategorie ausgewählt
  selectedDogCategory: DogCategory | null = null;
  mapHeight = '500px';
  weather: WeatherData | null = null;
  hourlyWeather: Array<{ time: string, temp: number, icon: string, description: string }> = [];
  sunrise: string | null = null;
  sunset: string | null = null;
  wind: number | null = null;
  humidity: number | null = null;
  weatherWarning: string | null = null;
  isNight: boolean = false;
  isRain: boolean = false;
  iconError = false;

  constructor(private dataService: DataService, private authService: AuthService) {}

  ngOnInit() {
    // Sortiere die Kategorien alphabetisch nach Name
    this.dogCategories.sort((a, b) => a.name.localeCompare(b.name));
    
    // Current User überwachen
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadMyDogs();
      } else {
        this.myDogs = [];
        this.selectedDog = null;
        this.showMyDogs = false;
      }
    });
    
    // Lade Standortdaten
    this.loadLocationData();
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.center = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          this.userLocationMarker = {
            position: this.center,
            title: 'Mein Standort',
            icon: {
              url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              scaledSize: new google.maps.Size(40, 40)
            }
          };
          this.fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          this.userLocationMarker = null;
          this.center = { lat: 48.3069, lng: 14.2868 };
          alert('Dein Standort konnte nicht ermittelt werden. Die Karte zeigt den Standardstandort (Linz).');
          // Wetter für Linz abrufen
          this.fetchWeather(48.3069, 14.2868);
        }
      );
    }
    this.setDayNight();

    // Globale Callback-Funktionen für InfoWindow-Buttons
    (window as any).doggoEditPark = () => {
      if (this.currentParkId) {
        this.openParkStatusModal(this.currentParkId);
      }
    };
    
    (window as any).doggoEditDispenser = () => {
      if (this.currentDispenserId) {
        this.openDispenserStatusModal(this.currentDispenserId);
      }
    };
  }

  setDayNight() {
    const hour = new Date().getHours();
    this.isNight = (hour < 7 || hour >= 20);
  }

  // Wetterdaten von OpenWeatherMap holen
  fetchWeather(lat: number, lon: number) {
    const apiKey = '4ab7376893694f75311f2483b3909aa6';
    this.iconError = false;
    // Aktuelles Wetter
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=de&appid=${apiKey}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        this.weather = {
          temp: Math.round(data.main.temp),
          description: data.weather[0].description,
          icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
          main: data.weather[0].main // Wettertyp für Emoji
        };
        // Tageszeit für Wetterbox bestimmen
        const now = new Date();
        const hour = now.getHours();
        this.isNight = (hour < 6 || hour >= 20); // 20-6 Uhr = Nacht
        // Sonnenaufgang/Sonnenuntergang
        this.sunrise = data.sys && data.sys.sunrise ? new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null;
        this.sunset = data.sys && data.sys.sunset ? new Date(data.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null;
        // Wind & Luftfeuchtigkeit
        this.wind = data.wind && data.wind.speed ? Math.round(data.wind.speed) : null;
        this.humidity = data.main && data.main.humidity ? data.main.humidity : null;
        // Wetterwarnung (vereinfachtes Beispiel)
        this.weatherWarning = (data.weather[0].main === 'Thunderstorm' || data.weather[0].main === 'Extreme') ? '⚠️ Unwetterwarnung!' : null;
      })
      .catch(() => {
        this.weather = null;
      });
    // Stundenprognose (nächste 8 Stunden)
    const urlHourly = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=de&appid=${apiKey}`;
    fetch(urlHourly)
      .then(res => res.json())
      .then(data => {
        this.hourlyWeather = data.list.slice(0, 8).map((entry: any) => {
          const date = new Date(entry.dt * 1000);
          const hour = date.getHours().toString().padStart(2, '0');
          const min = date.getMinutes().toString().padStart(2, '0');
          return {
            time: `${hour}:${min}`,
            temp: Math.round(entry.main.temp),
            icon: `https://openweathermap.org/img/wn/${entry.weather[0].icon}@2x.png`,
            description: entry.weather[0].description
          };
        });
      })
      .catch(() => {
        this.hourlyWeather = [];
      });
  }

  getWeatherEmoji(main: string): string {
    if (this.isNight && (main || '').toLowerCase() === 'clear') {
      return '🌙'; // Mond bei klarem Nachthimmel
    }
    switch ((main || '').toLowerCase()) {
      case 'rain':
      case 'drizzle':
      case 'thunderstorm':
        return '🌧️';
      case 'snow':
        return '❄️';
      case 'clear':
        return '☀️';
      case 'clouds':
        return '☁️';
      case 'mist':
      case 'fog':
      case 'haze':
        return '🌫️';
      case 'smoke':
        return '💨';
      case 'tornado':
        return '🌪️';
      case 'squall':
        return '💨';
      case 'dust':
      case 'sand':
        return '🌬️';
      default:
        return '🌡️';
    }
  }

  getWeatherEmojiTitle(main: string): string {
    if (this.isNight && (main || '').toLowerCase() === 'clear') {
      return 'Klarer Nachthimmel';
    }
    switch ((main || '').toLowerCase()) {
      case 'rain':
      case 'drizzle':
      case 'thunderstorm':
        return 'Regen, Nieselregen oder Gewitter';
      case 'snow':
        return 'Schnee';
      case 'clear':
        return 'Sonnig';
      case 'clouds':
        return 'Bewölkt';
      case 'mist':
      case 'fog':
      case 'haze':
        return 'Nebel oder Dunst';
      case 'smoke':
        return 'Rauch';
      case 'tornado':
        return 'Tornado';
      case 'squall':
        return 'Sturmböen';
      case 'dust':
      case 'sand':
        return 'Staub oder Sand';
      default:
        return 'Unbekanntes Wetter';
    }
  }

  getWindTitle(): string {
    return this.wind !== null ? `Windgeschwindigkeit: ${this.wind} km/h` : '';
  }
  getHumidityTitle(): string {
    return this.humidity !== null ? `Luftfeuchtigkeit: ${this.humidity}%` : '';
  }
  getSunriseTitle(): string {
    return this.sunrise ? `Sonnenaufgang: ${this.sunrise}` : '';
  }
  getSunsetTitle(): string {
    return this.sunset ? `Sonnenuntergang: ${this.sunset}` : '';
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Lade alle Standortdaten
  loadLocationData() {
    // Lade sichtbare Daten (öffentliche + eigene private)
    this.dataService.getVisibleDogParks().pipe(takeUntil(this.destroy$)).subscribe(parks => {
      this.dogParks = parks;
      this.createDogParkMarkers();
    });

    this.dataService.getVisibleWasteDispensers().pipe(takeUntil(this.destroy$)).subscribe(dispensers => {
      this.wasteDispensers = dispensers;
      this.createWasteDispenserMarkers();
    });
  }

  // Erstelle Marker für Hundeparks
  createDogParkMarkers() {
    this.dogParkMarkers = this.dogParks.map(park => ({
      position: park.location,
      title: `🏞️ ${park.name}\n📍 ${park.address}\n⭐ ${park.rating}/5\n🏠 ${park.facilities.join(', ')}`,
      icon: {
        url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
        scaledSize: new google.maps.Size(32, 32)
      }
    }));
  }



  // Erstelle Marker für Hundesackerlspender
  createWasteDispenserMarkers() {
    this.wasteDispenserMarkers = this.wasteDispensers.map(dispenser => ({
      position: dispenser.location,
      title: `🗑️ ${dispenser.name}\n📍 ${dispenser.address}\n🏷️ ${this.getDispenserTypeText(dispenser.type)}\n${dispenser.isWorking ? '✅ Funktionsfähig' : '❌ Defekt'}`,
      icon: {
        url: dispenser.isWorking ? 
          'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png' : 
          'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
        scaledSize: new google.maps.Size(32, 32)
      }
    }));
  }

  // Hilfsmethode für Spender-Typ
  getDispenserTypeText(type: string): string {
    switch(type) {
      case 'bags': return 'Hundesackerl';
      case 'bins': return 'Mülleimer';
      case 'both': return 'Sackerl + Mülleimer';
      default: return type;
    }
  }

  // Getter für gefilterte Marker
  get filteredDogParkMarkers() {
    return this.showDogParks ? this.dogParkMarkers : [];
  }

  get filteredWasteDispenserMarkers() {
    return this.showWasteDispensers ? this.wasteDispenserMarkers : [];
  }

  // Temporäre Speicher für aktuell ausgewählte IDs
  private currentParkId: number | null = null;
  private currentDispenserId: number | null = null;

  // Info Window Click Handlers
  openDogParkInfo(index: number, event?: google.maps.MapMouseEvent): void {
    const park = this.dogParks[index];
    if (!park) return;
    
    // Prüfe ob Bearbeitungsmodus aktiv und Nutzer eingeloggt
    if (this.editMode && this.currentUser) {
      this.openParkStatusModal(park.id);
      return;
    }
    
    // Prüfe ob Strg+Klick für Status-Bearbeitung
    if (event && (event as any).domEvent && (event as any).domEvent.ctrlKey && this.currentUser) {
      this.openParkStatusModal(park.id);
      return;
    }
    
    this.currentParkId = park.id;
    this.currentDispenserId = null;
    
    // Hinweis für eingeloggte Nutzer hinzufügen
    const editHint = this.currentUser ? `
      <div style="margin-top: 15px; padding: 10px; background: #e3f2fd; border-radius: 6px; border-left: 4px solid #2196f3;">
        <div style="font-size: 0.9rem; color: #1976d2; font-weight: 600;">
          💡 Status bearbeiten: <strong>Bearbeitungsmodus</strong> aktivieren oder <strong>Strg + Klick</strong>
        </div>
      </div>
    ` : '';
    
    this.infoWindowContent = `
      <div style="max-width: 300px; padding: 10px;">
        <h3 style="margin: 0 0 10px 0; color: #2c3e50; font-size: 1.1rem;">🏞️ ${park.name}</h3>
        <div style="margin-bottom: 8px;">
          <strong>📍 Adresse:</strong><br>
          ${park.address}
        </div>
        <div style="margin-bottom: 8px;">
          <strong>⭐ Bewertung:</strong> ${park.rating}/5
        </div>
        <div style="margin-bottom: 8px;">
          <strong>🏠 Ausstattung:</strong><br>
          ${park.facilities.join(', ')}
        </div>
        <div style="margin-bottom: 8px;">
          <strong>🕐 Status:</strong> 
          <span style="color: ${park.isOpen ? '#28a745' : '#dc3545'}; font-weight: bold;">
            ${park.isOpen ? '✅ Geöffnet' : '❌ Geschlossen'}
          </span>
        </div>
        ${park.userId ? '<div style="font-size: 0.9rem; color: #6c757d; margin-top: 10px;">👤 Eigener Eintrag</div>' : ''}
        ${editHint}
      </div>
    `;
    
    // InfoWindow öffnen an der Position des Parks
    this.infoWindowPosition = park.location;
    if (this.infoWindow) {
      this.infoWindow.open();
    }
  }

  openWasteDispenserInfo(index: number, event?: google.maps.MapMouseEvent): void {
    const dispenser = this.wasteDispensers[index];
    if (!dispenser) return;
    
    // Prüfe ob Bearbeitungsmodus aktiv und Nutzer eingeloggt
    if (this.editMode && this.currentUser) {
      this.openDispenserStatusModal(dispenser.id);
      return;
    }
    
    // Prüfe ob Strg+Klick für Status-Bearbeitung
    if (event && (event as any).domEvent && (event as any).domEvent.ctrlKey && this.currentUser) {
      this.openDispenserStatusModal(dispenser.id);
      return;
    }
    
    this.currentDispenserId = dispenser.id;
    this.currentParkId = null;
    
    // Hinweis für eingeloggte Nutzer hinzufügen
    const editHint = this.currentUser ? `
      <div style="margin-top: 15px; padding: 10px; background: #fff3cd; border-radius: 6px; border-left: 4px solid #ffc107;">
        <div style="font-size: 0.9rem; color: #856404; font-weight: 600;">
          💡 Status bearbeiten: <strong>Bearbeitungsmodus</strong> aktivieren oder <strong>Strg + Klick</strong>
        </div>
      </div>
    ` : '';
    
    this.infoWindowContent = `
      <div style="max-width: 300px; padding: 10px;">
        <h3 style="margin: 0 0 10px 0; color: #2c3e50; font-size: 1.1rem;">🗑️ ${dispenser.name}</h3>
        <div style="margin-bottom: 8px;">
          <strong>📍 Adresse:</strong><br>
          ${dispenser.address}
        </div>
        <div style="margin-bottom: 8px;">
          <strong>🏷️ Typ:</strong> ${this.getDispenserTypeText(dispenser.type)}
        </div>
        <div style="margin-bottom: 8px;">
          <strong>⚙️ Status:</strong> 
          <span style="color: ${dispenser.isWorking ? '#28a745' : '#dc3545'}; font-weight: bold;">
            ${dispenser.isWorking ? '✅ Funktionsfähig' : '❌ Defekt'}
          </span>
        </div>
        ${dispenser.reportedIssues.length > 0 ? `
          <div style="margin-bottom: 8px;">
            <strong>⚠️ Gemeldete Probleme:</strong><br>
            <ul style="margin: 5px 0 0 20px; padding: 0;">
              ${dispenser.reportedIssues.map(issue => `<li style="font-size: 0.9rem; color: #dc3545;">${issue}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        ${dispenser.userId ? '<div style="font-size: 0.9rem; color: #6c757d; margin-top: 10px;">👤 Eigener Eintrag</div>' : ''}
        ${editHint}
      </div>
    `;
    
    // InfoWindow öffnen an der Position des Spenders
    this.infoWindowPosition = dispenser.location;
    if (this.infoWindow) {
      this.infoWindow.open();
    }
  }

  // Kartenklick-Handler für neue Standorte
  onMapClick(event: google.maps.MapMouseEvent): void {
    if (!this.currentUser) {
      alert('Sie müssen angemeldet sein, um neue Standorte hinzuzufügen.');
      return;
    }

    if (event.latLng) {
      this.newLocationPosition = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      };
      this.showLocationTypeModal = true;
    }
  }

  // Standorttyp auswählen
  selectLocationType(type: 'park' | 'dispenser'): void {
    this.newLocationType = type;
    this.showLocationTypeModal = false;
    this.showAddLocationModal = true;
    this.resetForm();
  }

  // Typ-Auswahl abbrechen
  cancelTypeSelection(): void {
    this.showLocationTypeModal = false;
    this.newLocationPosition = null;
  }

  // Form zurücksetzen
  resetForm(): void {
    this.newLocationForm = {
      name: '',
      address: '',
      isPublic: true,
      facilities: '',
      rating: 5,
      isOpen: true,
      type: 'bags',
      isWorking: true
    };
  }

  // Modal schließen
  closeModal(): void {
    this.showAddLocationModal = false;
    this.showLocationTypeModal = false;
    this.newLocationPosition = null;
    this.newLocationType = null;
  }

  // Neuen Standort speichern
  saveNewLocation(): void {
    if (!this.newLocationPosition || !this.newLocationType || !this.currentUser) {
      return;
    }

    if (this.newLocationType === 'park') {
      this.saveNewPark();
    } else {
      this.saveNewDispenser();
    }
  }

  // Neuen Park speichern
  saveNewPark(): void {
    if (!this.newLocationPosition) return;

    const facilities = this.newLocationForm.facilities
      .split(',')
      .map(f => f.trim())
      .filter(f => f.length > 0);

    const newPark: Omit<DogPark, 'id'> = {
      name: this.newLocationForm.name,
      location: this.newLocationPosition,
      address: this.newLocationForm.address,
      facilities: facilities,
      rating: this.newLocationForm.rating,
      isOpen: this.newLocationForm.isOpen,
      isPublic: this.newLocationForm.isPublic,
      userId: this.currentUser!.id
    };

    this.dataService.addDogPark(newPark).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.loadLocationData(); // Daten neu laden
        this.closeModal();
        alert('Hundepark erfolgreich hinzugefügt!');
      },
      error: (error) => {
        console.error('Fehler beim Hinzufügen des Parks:', error);
        alert('Fehler beim Hinzufügen des Parks.');
      }
    });
  }

  // Neuen Spender speichern
  saveNewDispenser(): void {
    if (!this.newLocationPosition) return;

    const newDispenser: Omit<WasteDispenser, 'id'> = {
      name: this.newLocationForm.name,
      location: this.newLocationPosition,
      address: this.newLocationForm.address,
      type: this.newLocationForm.type,
      isWorking: this.newLocationForm.isWorking,
      isPublic: this.newLocationForm.isPublic,
      reportedIssues: [],
      userId: this.currentUser!.id
    };

    this.dataService.addWasteDispenser(newDispenser).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.loadLocationData(); // Daten neu laden
        this.closeModal();
        alert('Hundesackerlspender erfolgreich hinzugefügt!');
      },
      error: (error) => {
        console.error('Fehler beim Hinzufügen des Spenders:', error);
        alert('Fehler beim Hinzufügen des Spenders.');
      }
    });
  }

  // Lade meine Hunde
  loadMyDogs() {
    if (!this.currentUser) {
      this.myDogs = [];
      return;
    }

    this.dataService.dogs$.pipe(takeUntil(this.destroy$)).subscribe(dogs => {
      this.myDogs = dogs.filter(dog => dog.userId === this.currentUser!.id);
      // Wenn kein Hund ausgewählt ist und Hunde vorhanden sind, wähle den ersten
      if (!this.selectedDog && this.myDogs.length > 0) {
        this.selectedDog = this.myDogs[0];
      }
      // Wenn der ausgewählte Hund nicht mehr existiert, wähle den ersten oder null
      if (this.selectedDog && !this.myDogs.find(dog => dog.id === this.selectedDog!.id)) {
        this.selectedDog = this.myDogs.length > 0 ? this.myDogs[0] : null;
      }
    });
  }

  // Toggle zwischen allgemeinen Infos und meinen Hunden
  toggleInfoMode() {
    this.showMyDogs = !this.showMyDogs;
    if (this.showMyDogs && this.myDogs.length > 0 && !this.selectedDog) {
      this.selectedDog = this.myDogs[0];
    }
  }

  // Toggle für Bearbeitungsmodus
  toggleEditMode() {
    if (!this.currentUser) {
      alert('Sie müssen angemeldet sein, um den Bearbeitungsmodus zu nutzen.');
      return;
    }
    this.editMode = !this.editMode;
  }

  // Hilfsmethoden für Hunde-Informationen
  getDogAgeCategory(dog: Dog): string {
    if (dog.age < 1) return 'Welpe';
    if (dog.age < 7) return 'Erwachsen';
    return 'Senior';
  }

  getDogSizeCategory(dog: Dog): string {
    // Einfache Kategorisierung basierend auf bekannten Rassen
    const smallBreeds = ['Chihuahua', 'Yorkshire Terrier', 'Malteser', 'Dackel', 'Jack Russell Terrier'];
    const largeBreeds = ['Golden Retriever', 'Labrador', 'Deutscher Schäferhund', 'Rottweiler', 'Dobermann', 'Bernhardiner'];
    
    if (smallBreeds.some(breed => dog.breed.toLowerCase().includes(breed.toLowerCase()))) {
      return 'Klein (< 40cm / < 20kg)';
    }
    if (largeBreeds.some(breed => dog.breed.toLowerCase().includes(breed.toLowerCase()))) {
      return 'Groß (≥ 40cm / ≥ 20kg)';
    }
    return 'Mittel';
  }

  getDogRequirements(dog: Dog): string[] {
    const requirements = [];
    
    // Spezielle Rassen
    if (dog.isSpecialBreed) {
      requirements.push('🔴 Alltagstauglichkeitsprüfung (ATP) erforderlich');
      requirements.push('🔴 Leinen- und Maulkorbpflicht');
      requirements.push('🔴 Sachkunde-Nachweis erforderlich');
    }
    
    // Große Hunde
    const largeBreeds = ['Golden Retriever', 'Labrador', 'Deutscher Schäferhund', 'Rottweiler', 'Dobermann', 'Bernhardiner'];
    if (largeBreeds.some(breed => dog.breed.toLowerCase().includes(breed.toLowerCase()))) {
      requirements.push('🟡 Sachkunde-Kurs erforderlich');
      requirements.push('🟡 Alltagstauglichkeitsprüfung (ATP) erforderlich');
      requirements.push('🟡 Leinen- oder Maulkorbpflicht im Ortsgebiet');
    }
    
    // Allgemeine Anforderungen
    requirements.push('🔵 Chip- und Registrierungspflicht');
    requirements.push('🔵 Haftpflichtversicherung empfohlen');
    
    return requirements;
  }

  getDogCareInfo(dog: Dog): string[] {
    const info = [];
    const ageCategory = this.getDogAgeCategory(dog);
    
    switch (ageCategory) {
      case 'Welpe':
        info.push('🍼 Spezielle Welpenerziehung wichtig');
        info.push('🏥 Regelmäßige Tierarztbesuche für Impfungen');
        info.push('🎓 Welpenschule empfohlen');
        break;
      case 'Senior':
        info.push('🏥 Häufigere Gesundheitschecks empfohlen');
        info.push('🚶‍♂️ Angepasste, kürzere Spaziergänge');
        info.push('🍽️ Eventuell angepasste Ernährung');
        break;
      default:
        info.push('🚶‍♂️ Regelmäßige Bewegung wichtig');
        info.push('🧠 Geistige Beschäftigung fördern');
        info.push('🏥 Jährliche Gesundheitschecks');
    }
    
    return info;
  }

  formatLastWalk(dog: Dog): string {
    if (!dog.lastWalk) return 'Noch kein Spaziergang eingetragen';
    
    const walkDate = new Date(dog.lastWalk);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - walkDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Gestern';
    } else if (diffDays < 7) {
      return `Vor ${diffDays} Tagen`;
    } else {
      return walkDate.toLocaleDateString('de-DE');
    }
  }

  // Status-Update-Modal-Methoden
  openParkStatusModal(parkId: number): void {
    const park = this.dogParks.find(p => p.id === parkId);
    if (!park) return;
    
    this.selectedStationId = parkId;
    this.selectedStationType = 'park';
    this.statusUpdateForm = {
      isOpen: park.isOpen,
      isWorking: true,
      newIssue: '',
      rating: park.rating
    };
    this.showStatusUpdateModal = true;
    
    // InfoWindow schließen
    if (this.infoWindow) {
      this.infoWindow.close();
    }
  }

  openDispenserStatusModal(dispenserId: number): void {
    const dispenser = this.wasteDispensers.find(d => d.id === dispenserId);
    if (!dispenser) return;
    
    this.selectedStationId = dispenserId;
    this.selectedStationType = 'dispenser';
    this.statusUpdateForm = {
      isOpen: true,
      isWorking: dispenser.isWorking,
      newIssue: '',
      rating: 3
    };
    this.showStatusUpdateModal = true;
    
    // InfoWindow schließen
    if (this.infoWindow) {
      this.infoWindow.close();
    }
  }

  saveStatusUpdate(): void {
    if (!this.selectedStationId || !this.selectedStationType || !this.currentUser) return;

    if (this.selectedStationType === 'park') {
      // Park-Status updaten
      this.dataService.updateDogPark(this.selectedStationId, {
        isOpen: this.statusUpdateForm.isOpen,
        rating: this.statusUpdateForm.rating
      });
      
      this.loadLocationData();
      this.closeStatusUpdateModal();
      alert('Park-Status erfolgreich aktualisiert!');
      
    } else if (this.selectedStationType === 'dispenser') {
      // Spender-Status updaten
      const updates: any = {
        isWorking: this.statusUpdateForm.isWorking
      };
      
      // Neues Problem hinzufügen, falls eingegeben
      if (this.statusUpdateForm.newIssue.trim()) {
        const dispenser = this.wasteDispensers.find(d => d.id === this.selectedStationId);
        if (dispenser) {
          updates.reportedIssues = [...dispenser.reportedIssues, this.statusUpdateForm.newIssue.trim()];
        }
      }
      
      this.dataService.updateWasteDispenser(this.selectedStationId, updates);
      this.loadLocationData();
      this.closeStatusUpdateModal();
      alert('Spender-Status erfolgreich aktualisiert!');
    }
  }

  closeStatusUpdateModal(): void {
    this.showStatusUpdateModal = false;
    this.selectedStationId = null;
    this.selectedStationType = null;
    this.statusUpdateForm = {
      isOpen: true,
      isWorking: true,
      newIssue: '',
      rating: 3
    };
  }

  // Helper methods for status update modal
  getSelectedPark(): DogPark | undefined {
    if (this.selectedStationType === 'park' && this.selectedStationId) {
      return this.dogParks.find(p => p.id === this.selectedStationId);
    }
    return undefined;
  }

  getSelectedDispenser(): WasteDispenser | undefined {
    if (this.selectedStationType === 'dispenser' && this.selectedStationId) {
      return this.wasteDispensers.find(d => d.id === this.selectedStationId);
    }
    return undefined;
  }

  isStatusUpdateValid(): boolean {
    if (this.selectedStationType === 'park') {
      return this.statusUpdateForm.isOpen !== null && this.statusUpdateForm.isOpen !== undefined;
    }
    if (this.selectedStationType === 'dispenser') {
      return this.statusUpdateForm.isWorking !== null && this.statusUpdateForm.isWorking !== undefined;
    }
    return false;
  }
}
