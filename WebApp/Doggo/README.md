# 🐕 DoggoGO - Hundehalter-App

Eine moderne Angular-Webanwendung für Hundehalter zur Verwaltung von Hunden, Hundeparks und Hundesackerlspendern.

## 📱 **Features**

- **🗺️ Interaktive Karte** - Google Maps Integration mit Markern für Parks und Spender
- **🐕 Hundeverwaltung** - Registrierung und Verwaltung eigener Hunde
- **🏞️ Hundeparks** - Übersicht und Bewertung von Hundeparks
- **🗑️ Hundesackerlspender** - Status und Standorte von Spendern
- **⚖️ Gesetzliche Informationen** - Rechtliche Hinweise für verschiedene Hunderassen
- **🌤️ Wetter-Integration** - Aktuelle Wetterdaten für Spaziergänge
- **👤 Benutzerverwaltung** - Login/Registrierung mit Profilverwaltung

## 🏗️ **Technologie-Stack**

- **Frontend**: Angular 18 (Standalone Components)
- **Karten**: Google Maps API
- **Wetter**: OpenWeatherMap API
- **Styling**: CSS mit Gradients und Responsive Design
- **State Management**: RxJS mit BehaviorSubjects
- **Routing**: Angular Router mit Guards

## 🚀 **Installation & Start**

### Voraussetzungen
- Node.js (v18+)
- npm oder yarn
- Angular CLI (`npm install -g @angular/cli`)

### Projekt starten
```bash
# Dependencies installieren
npm install

# Development Server starten
ng serve

# App öffnen
http://localhost:4200
```

### Build für Produktion
```bash
ng build --configuration=production
```

## 📁 **Projektstruktur**

```
src/
├── app/
│   ├── components/                 # Angular Komponenten
│   │   ├── login.component.ts      # Login/Registrierung
│   │   ├── navigation.component.ts # Hauptnavigation
│   │   └── profile-management.component.ts # Profilverwaltung
│   ├── services/                   # Services & Business Logic
│   │   ├── auth.service.ts         # Authentifizierung
│   │   ├── data.service.ts         # Mock-Datenmanagement
│   │   ├── api.service.ts          # API-Abstraktionsschicht
│   │   ├── http-api.service.ts     # HTTP-Client für echte API
│   │   └── api-ready.service.ts    # Unified API Interface
│   ├── interfaces/                 # TypeScript Interfaces
│   │   └── api.interfaces.ts       # API-Definitionen
│   ├── interceptors/               # HTTP-Interceptors
│   │   └── http.interceptors.ts    # Auth, Loading, Error Handling
│   ├── environments/               # Umgebungskonfiguration
│   │   ├── environment.ts          # Development
│   │   └── environment.prod.ts     # Production
│   ├── app.component.*             # Hauptkomponente (Karten-View)
│   ├── root.component.ts           # Root-Wrapper mit Navigation
│   ├── app.config.ts               # App-Konfiguration
│   └── app.routes.ts               # Routing-Konfiguration
├── assets/                         # Statische Assets
│   ├── DoggoGOLogo.png            # App-Logo
│   └── DoggoGOLogo.jpg            # Logo Alternative
└── styles.css                     # Globale Styles
```

## 🎯 **Aktuelle Funktionsweise**

### Simulationsmodus (Standard)
- **Mock-Daten**: Alle Daten werden lokal simuliert
- **Kein Backend**: Vollständig frontend-basiert
- **Test-Login**: `max@example.com` (beliebiges Passwort)
- **Persistierung**: localStorage für Session-Management

### Umgebungskonfiguration
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  enableMockData: true,  // Simulationsmodus aktiv
  googleMapsApiKey: 'YOUR_GOOGLE_MAPS_KEY',
  weatherApiKey: 'YOUR_WEATHER_API_KEY'
};
```

## 🔧 **Konfiguration**

### API-Keys konfigurieren
1. **Google Maps**: API-Key in `environment.ts` eintragen
2. **Wetter**: OpenWeatherMap API-Key eintragen
3. **Maps**: Bereits konfiguriert für Entwicklung

### Mock/API-Umschaltung
```typescript
// Mock-Modus (Standard)
enableMockData: true

// API-Modus (für echtes Backend)
enableMockData: false
```

## 📊 **Datenmodell**

### Benutzer
```typescript
interface User {
  id: number;
  name: string;
  email: string;
  registeredAt: Date;
}
```

### Hunde
```typescript
interface Dog {
  id: number;
  name: string;
  breed: string;
  age: number;
  owner: string;
  isSpecialBreed: boolean;
  userId: number;
  lastWalk?: Date;
}
```

### Hundeparks
```typescript
interface DogPark {
  id: number;
  name: string;
  address: string;
  location: { lat: number; lng: number };
  rating: number;
  facilities: string[];
  isOpen: boolean;
  userId: number;
  isPublic: boolean;
}
```

### Hundesackerlspender
```typescript
interface WasteDispenser {
  id: number;
  name: string;
  address: string;
  location: { lat: number; lng: number };
  type: 'bags' | 'bins' | 'both';
  isWorking: boolean;
  userId: number;
  isPublic: boolean;
  reportedIssues: string[];
}
```

## 🔐 **Authentication & Routing**

### Geschützte Routen
- `/profile` - Profilverwaltung (AuthGuard)
- Automatische Umleitung zu `/login` bei fehlender Authentifizierung

### Session Management
- JWT-Token Simulation für Mock-Modus
- localStorage für Token-Persistierung
- Automatische Token-Validierung

## 🎨 **UI/UX Features**

- **Responsive Design** - Mobile-first Ansatz
- **Moderne Gradients** - Ansprechende visuelle Gestaltung
- **Smooth Animations** - CSS-Transitions für bessere UX
- **Icon-System** - Emoji-basierte Icons für intuitive Navigation
- **Toast-Notifications** - Feedback für Benutzeraktionen

## 🧪 **Testing**

```bash
# Unit Tests
ng test

# E2E Tests
ng e2e

# Build Test
ng build --configuration=production
```

## 📚 **API-Integration (Vorbereitet)**

Die Anwendung ist vollständig für eine echte Backend-API vorbereitet:

### Verfügbare Dokumentation:
- **`API-INTEGRATION.md`** - Vollständiger Integration-Guide (🤖 KI-konfiguriert)
- **`API-READY-STATUS.md`** - Implementation Summary (🤖 KI-konfiguriert)

### Schnellstart API-Integration:
1. Backend-API entwickeln (siehe `API-INTEGRATION.md`)
2. `environment.enableMockData = false` setzen
3. API-URL in Environment konfigurieren
4. App startet automatisch mit echter API

## 🛠️ **Entwicklung**

### Code Scaffolding
```bash
# Neue Komponente
ng generate component component-name

# Neuer Service
ng generate service service-name

# Neue Guard
ng generate guard guard-name
```

### Development Best Practices
- Standalone Components verwenden
- Services für Business Logic
- RxJS für reaktive Programmierung
- TypeScript Strict Mode
- Consistent Code Style

## 🚀 **Deployment**

### Produktions-Build
```bash
ng build --configuration=production
```

### Umgebungsvariablen für Produktion
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.doggo-go.com/api',
  enableMockData: false,
  googleMapsApiKey: 'PROD_GOOGLE_MAPS_KEY',
  weatherApiKey: 'PROD_WEATHER_API_KEY'
};
```

## 📝 **Changelog**

### v1.0.0 (Aktuell)
- ✅ Vollständige Mock-Implementation
- ✅ Google Maps Integration
- ✅ Wetter-API Integration
- ✅ Benutzer-Authentication
- ✅ CRUD für Hunde, Parks, Spender
- ✅ Responsive Design
- ✅ API-Integration vorbereitet

## 🤝 **Contributing**

1. Fork das Repository
2. Feature Branch erstellen (`git checkout -b feature/AmazingFeature`)
3. Änderungen committen (`git commit -m 'Add some AmazingFeature'`)
4. Branch pushen (`git push origin feature/AmazingFeature`)
5. Pull Request erstellen

## 📄 **Lizenz**

Dieses Projekt ist für Bildungszwecke erstellt.

## 🆘 **Support**

Bei Fragen oder Problemen:
1. Überprüfe die Konsole auf Fehler
2. Stelle sicher, dass alle API-Keys konfiguriert sind
3. Überprüfe die Environment-Konfiguration

---

**Status: ✅ Produktionsbereit** | **Mock-Modus: Aktiv** | **API-Ready: Ja**
