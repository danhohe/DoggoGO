# 🐕 DoggoGO - Hundespaziergänge einfach gemacht

Eine Angular-basierte Web-Anwendung für Hundebesitzer, die bei der Planung von Spaziergängen, dem Finden von Hundeparks und Hundesackerlspender-Standorten hilft.

## 📋 Inhaltsverzeichnis

- [Überblick](#-überblick)
- [Projektstruktur](#-projektstruktur)
- [Technologie-Stack](#-technologie-stack)
- [Installation & Setup](#-installation--setup)
- [Entwicklungsmodi](#-entwicklungsmodi)
- [Architektur](#-architektur)
- [Funktionen](#-funktionen)
- [Konfiguration](#-konfiguration)
- [API-Integration](#-api-integration)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)

## 🎯 Überblick

DoggoGO ist eine Progressive Web App (PWA), die Hundebesitzern dabei hilft:

- 🗺️ Hundeparks und Hundesackerlspender in der Nähe zu finden
- 🧭 **GPS-basierte Navigation** mit aktueller Position
- 🤖 **Automatische Namensgenerierung** für neue Standorte
- 📱 Mobile-first Design für unterwegs
- 👥 Community-Features für Bewertungen und Status-Updates
- 🌤️ Wetter-Integration für Spaziergangsplanung
- 💾 **Vollständige Offline-Funktionalität** mit LocalStorage

## 📁 Projektstruktur

```
src/
├── app/
│   ├── components/              # UI-Komponenten
│   │   ├── login.component.ts   # Anmelde-/Registrierungs-UI
│   │   ├── navigation.component.ts  # Top-Navigation
│   │   ├── profile-management.component.ts  # Profil & Hunde-Management
│   │   └── dog-management.component.ts      # Hunde-spezifische Verwaltung
│   │
│   ├── services/                # Business Logic & Data
│   │   ├── auth.service.ts      # Authentifizierung (Mock + API)
│   │   ├── data.service.ts      # Datenmanagement (LocalStorage + API)
│   │   ├── http-api.service.ts  # HTTP-API Kommunikation
│   │   ├── api.service.ts       # High-Level API Wrapper
│   │   ├── api-ready.service.ts # API-Ready Service (für zukünftige Nutzung)
│   │   └── auth.guard.ts        # Route-Schutz
│   │
│   ├── interfaces/              # TypeScript Interfaces
│   │   └── api.interfaces.ts    # API-Datenstrukturen
│   │
│   ├── interceptors/            # HTTP Interceptors
│   │   └── http.interceptors.ts # Auth, Loading, Error, Cache
│   │
│   ├── app.component.ts         # Haupt-Karten-Komponente
│   ├── app.config.ts           # Angular Konfiguration
│   ├── app.routes.ts           # Routing-Konfiguration
│   └── root.component.ts       # Root-Container
│
├── environments/               # Umgebungskonfiguration
│   ├── environment.ts         # Development
│   └── environment.prod.ts    # Production
│
├── assets/                    # Statische Ressourcen
│   ├── DoggoGOLogo.jpg       # App-Logo (JPEG)
│   └── DoggoGOLogo.png       # App-Logo (PNG)
│
├── index.html                 # HTML Entry Point
├── main.ts                   # Angular Bootstrap
└── styles.css               # Globale Styles
```

## 🔧 Technologie-Stack

### Frontend

- **Angular 18+** - Modern Web Framework mit Standalone Components
- **TypeScript** - Type-Safe JavaScript für bessere Entwicklererfahrung
- **Google Maps API** - Kartenintegration, Navigation & Reverse Geocoding
- **RxJS** - Reactive Programming mit Observables
- **Progressive Web App (PWA)** - App-ähnliche Erfahrung

### Data Management

- **LocalStorage** - Client-seitiger Datenspeicher für Offline-Funktionalität
- **Mock Data System** - Vollständige Simulation für Entwicklung ohne Backend
- **HTTP Client** - RESTful API Integration (vorbereitet für echtes Backend)
- **BehaviorSubjects** - Reaktive Datenstream-Verwaltung

### Smart Features

- **Google Maps Geocoding API** - Automatische Adressermittlung
- **GPS-Integration** - Präzise Standortbestimmung
- **Automatische Namensgebung** - KI-ähnliche Standortbenennung

### Styling

- **CSS3** - Modern Styling mit Flexbox & Grid
- **Responsive Design** - Mobile-first Approach
- **Google Maps Marker** - Custom Icons

## 🚀 Installation & Setup

### Voraussetzungen
```bash
# Node.js (Version 18+)
node --version

# Angular CLI
npm install -g @angular/cli

# Git
git --version
```

### Projekt Setup
```bash
# Repository klonen
git clone [repository-url]
cd DoggoGO/WebApp/Doggo

# Dependencies installieren
npm install

# Development Server starten
ng serve

# Browser öffnen
# http://localhost:4200
```

### Google Maps API Setup
1. Google Cloud Console: https://console.cloud.google.com/
2. Maps JavaScript API aktivieren
3. API Key erstellen
4. In `src/index.html` eintragen:
```html
<script async
  src="https://maps.googleapis.com/maps/api/js?key=DEIN_API_KEY&libraries=places&callback=initMap">
</script>
```

## 🔄 Entwicklungsmodi

### Mock-Daten Modus (Standard)
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  enableMockData: true,  // ← Mock-Daten aktiviert
  apiUrl: 'http://localhost:3000/api'
};
```

**Eigenschaften:**
- ✅ Funktioniert ohne Backend
- ✅ Daten in LocalStorage gespeichert
- ✅ Automatische Demo-Daten
- ✅ Schnelle Entwicklung

### API-Modus
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  enableMockData: false,  // ← API-Modus aktiviert
  apiUrl: 'https://your-api-server.com/api'
};
```

**Eigenschaften:**
- 🌐 Echte Backend-Integration
- 🔄 HTTP-Interceptors aktiv
- 🔐 Token-basierte Authentifizierung
- 📊 Server-seitige Datenhaltung

### Umschalten zwischen Modi
```bash
# Mock-Modus für Entwicklung
ng serve

# API-Modus testen
# 1. environment.ts editieren (enableMockData: false)
# 2. Backend-URL anpassen
# 3. Server neu starten
ng serve
```

## 🏗️ Architektur

### Service-Layer Architektur

```
Components
    ↓
Services Layer
    ↓
Data Sources

AuthService ← Mock Auth / HTTP API
DataService ← LocalStorage / HTTP API  
HttpApiService ← REST API
```

### Komponenten-Hierarchie

```
RootComponent
├── NavigationComponent
├── AppComponent (Map View)
├── LoginComponent
└── ProfileManagementComponent
    └── DogManagementComponent
```

### Datenfluss

```
User → Component → Service → Data Source
                     ↓
                Observable/Promise
                     ↓
                UI Update
```

## ⚡ Funktionen

### 🗺️ Kartenansicht (app.component.ts)

- **Google Maps Integration**: Interaktive Karte mit Custom Markers
- **GPS-Standortermittlung**: Automatische Positionsbestimmung
- **Automatische Namensgenerierung**: Klick auf Karte → Typ wählen → Name wird automatisch erstellt
- **Marker-System**: 
  - 🟢 Hundeparks (Grüne Marker)
  - 🟡 Hundesackerlspender (Gelbe Marker)
  - 🔵 Benutzer-Position (Blauer Marker)

### � Intelligente Standorterfassung

- **Ein-Klick-Erstellung**: Einfach auf Karte klicken
- **Automatische Adressermittlung**: Google Maps Reverse Geocoding
- **Smart Naming**: 
  - Hundeparks: "Hundepark [Straßenname]"
  - Hundesackerlspender: "Hundesackerlspender [Straßenname]"
- **Keine manuelle Eingabe erforderlich**

### �🧭 Navigation

- **Interne Navigation**: Routenberechnung mit Google Directions API
- **Externe Navigation**: Integration mit Google Maps App
- **Aktuelle Position**: GPS-basierte Startpunkt-Ermittlung
- **Modal-System**: Benutzerfreundliche Navigationsoptionen

### 👤 Benutzer-Management
- **Mock-Authentifizierung**: E-Mail-basierte Anmeldung
- **Profil-Verwaltung**: Benutzerdaten bearbeiten
- **Hunde-Management**: Haustiere hinzufügen/bearbeiten/löschen
- **LocalStorage-Persistierung**: Daten bleiben beim Neustart erhalten

### 📍 Standort-Management
- **Community-Features**: Neue Standorte hinzufügen
- **Status-Updates**: Parks/Spender als geöffnet/defekt markieren
- **Bewertungssystem**: 5-Sterne Bewertungen
- **Besitzerkennung**: Eigene Einträge bearbeiten

### 🌤️ Wetter-Integration
- **OpenWeatherMap API**: Aktuelle Wetterdaten
- **Standort-basiert**: Wetter für aktuelle Position
- **Spaziergangs-Planung**: Wetter-Info für bessere Entscheidungen

### 🎨 Design & UX
- **Mobile-First**: Optimiert für Smartphone-Nutzung
- **Responsive**: Funktioniert auf allen Bildschirmgrößen
- **Progressive Web App**: Installierbar wie native App
- **Offline-Fähig**: Grundfunktionen ohne Internet

## ⚙️ Konfiguration

### Environment-Variablen

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  enableMockData: true,           // Mock vs API Modus
  apiUrl: 'http://localhost:3000/api',  // Backend URL
  
  // API Keys (Optional)
  googleMapsApiKey: 'your-key',
  weatherApiKey: 'your-weather-key',
  
  // Feature Flags
  enableWeather: true,
  enableNavigation: true,
  enableCommunityFeatures: true
};
```

### Datenstrukturen

```typescript
// Hundepark
interface DogPark {
  id: number;
  name: string;
  location: { lat: number; lng: number };
  address: string;
  facilities: string[];
  rating: number;
  isOpen: boolean;
  isPublic: boolean;
  userId?: number;
}

// Hundesackerlspender
interface WasteDispenser {
  id: number;
  name: string;
  location: { lat: number; lng: number };
  address: string;
  type: 'bags' | 'bins' | 'both';
  isWorking: boolean;
  isPublic: boolean;
  reportedIssues: string[];
  userId?: number;
}

// Benutzer
interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  registeredAt: Date;
}

// Hund
interface Dog {
  id: number;
  name: string;
  breed: string;
  age: number;
  weight: number;
  specialNeeds: string;
  userId: number;
  color?: string;
  isNeutered?: boolean;
  vaccinations?: string[];
}
```

## 🌐 API-Integration

### HTTP-Interceptors (Ready für Backend)

```typescript
// Automatische Token-Behandlung
AuthInterceptor: Fügt JWT-Token zu Requests hinzu

// Loading-States
LoadingInterceptor: Zeigt globale Loading-Indikatoren

// Error-Handling
ErrorInterceptor: Einheitliche Fehlerbehandlung

// Performance
CacheInterceptor: HTTP-Response Caching
```

### API-Endpunkte (Vorbereitet)

```typescript
// Authentifizierung
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
POST /api/auth/refresh

// Hunde
GET    /api/dogs
POST   /api/dogs
PUT    /api/dogs/:id
DELETE /api/dogs/:id

// Hundeparks
GET    /api/dog-parks
POST   /api/dog-parks
PUT    /api/dog-parks/:id
DELETE /api/dog-parks/:id

// Hundesackerlspender
GET    /api/waste-dispensers
POST   /api/waste-dispensers
PUT    /api/waste-dispensers/:id
DELETE /api/waste-dispensers/:id
```

## 🚢 Deployment

### Development Build
```bash
ng build
# Output: dist/doggo/
```

### Production Build
```bash
ng build --configuration production
# Optimiert und minifiert
```

### PWA-Features
```bash
# Service Worker generieren
ng add @angular/pwa

# Offline-Funktionalität
# App-Installation
# Push-Notifications (optional)
```

### Hosting-Optionen

**Statisches Hosting:**
- Netlify
- Vercel
- GitHub Pages
- Firebase Hosting

**Server-Hosting:**
- Docker Container
- Node.js Server
- Apache/Nginx

## 🔧 Troubleshooting

### Häufige Probleme

**1. Google Maps lädt nicht**
```bash
# Lösung: API Key prüfen
# src/index.html → Google Maps API Key
# Google Cloud Console → APIs aktivieren
```

**2. Standortermittlung funktioniert nicht**
```bash
# Lösung: HTTPS erforderlich
# Browser-Berechtigungen prüfen
# Fallback auf Standard-Position (HTL Leonding)
```

**3. Mock-Daten verschwinden**
```bash
# Lösung: LocalStorage prüfen
# Browser-Entwicklertools → Application → Local Storage
# Bei Bedarf: localStorage.clear() im Browser
```

**4. Navigation startet vom falschen Ort**
```bash
# Lösung: GPS-Berechtigung aktivieren
# Browser-Einstellungen → Standort-Zugriff
# Fallback: Google Maps verwendet IP-basierte Lokalisierung
```

### Debug-Modus
```typescript
// Console-Logs aktivieren (falls benötigt)
// Aktuell entfernt für Production-Readiness
// In Services: console.error() für kritische Fehler beibehalten
```

### Performance-Optimierung
```bash
# Bundle-Größe reduzieren
ng build --prod --source-map=false

# Lazy Loading aktivieren (für größere Apps)
# Tree Shaking (automatisch in Production)
```

## 📱 Mobile-Optimierung

### PWA-Features
- **App-Installation**: "Zum Homescreen hinzufügen"
- **Offline-Modus**: Grundfunktionen ohne Internet
- **Service Worker**: Hintergrund-Synchronisation
- **Responsive Design**: Optimiert für alle Bildschirmgrößen

### Touch-Optimierung
- **Große Touch-Targets**: Mindestens 44px
- **Wisch-Gesten**: Intuitive Navigation
- **Haptic Feedback**: Vibration bei Aktionen (optional)

## 🔮 Zukunftige Erweiterungen

### Geplante Features
- 🔔 Push-Notifications für neue Standorte
- 📊 Statistiken und Analytics
- 🏃‍♂️ Spaziergangs-Tracking mit GPS
- 👥 Social Features (Freunde, Gruppen)
- 🎯 Gamification (Punkte, Abzeichen)

### Backend-Integration
- 🗄️ Echte Datenbank (PostgreSQL/MongoDB)
- 🔐 OAuth-Integration (Google, Facebook)
- 📧 E-Mail-Benachrichtigungen
- 🌐 Real-time Updates (WebSockets)

---


**Happy Coding! 🐕🚀**
