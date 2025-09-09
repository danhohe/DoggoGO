# DoggoGO - Simulierte Datenbank

## Übersicht

Ihre Angular-App verfügt jetzt über eine vollständig simulierte Datenbank, die später einfach durch eine echte Backend-API ersetzt werden kann.

## Architektur

### 1. DataService (`src/app/services/data.service.ts`)
- **Zweck**: Simuliert eine lokale Datenbank mit Observables
- **Features**:
  - Speichert Daten im Browser's LocalStorage
  - Reaktive Updates mit BehaviorSubjects
  - CRUD-Operationen für Hunde, Hundeparks und Spazierwege
  - Simuliert API-Delays für realistische Erfahrung

### 2. ApiService (`src/app/services/api.service.ts`)
- **Zweck**: Abstraktionsschicht für API-Calls
- **Features**:
  - Alle Methoden sind bereit für echte HTTP-Calls
  - Einfacher Austausch gegen echte Backend-Verbindung
  - Kommentare zeigen, wie die echten API-Calls aussehen werden

### 3. Datenmodelle

#### User Interface
```typescript
interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  registeredAt: Date;
}
```

#### Dog Interface
```typescript
interface Dog {
  id: number;
  name: string;
  breed: string;
  age: number;
  userId: number;
  isSpecialBreed: boolean;
  lastWalk?: Date;
}
```

#### DogPark Interface
```typescript
interface DogPark {
  id: number;
  name: string; // Wird automatisch als "Hundepark [Straßenname]" generiert
  location: {
    lat: number;
    lng: number;
  };
  address: string; // Wird über Google Maps Reverse Geocoding ermittelt
  facilities: string[];
  rating: number;
  isOpen: boolean;
  userId?: number; // Optional: Ersteller des Eintrags
  isPublic: boolean;
}
```

#### WasteDispenser Interface (Hundesackerlspender)
```typescript
interface WasteDispenser {
  id: number;
  name: string; // Wird automatisch als "Hundesackerlspender [Straßenname]" generiert
  location: {
    lat: number;
    lng: number;
  };
  address: string; // Wird über Google Maps Reverse Geocoding ermittelt
  type: 'bags' | 'bins' | 'both';
  isWorking: boolean;
  reportedIssues: string[];
  userId?: number; // Optional: Ersteller des Eintrags
  isPublic: boolean;
}
```

## Navigation

Die App verfügt jetzt über zwei Hauptbereiche:

1. **🗺️ Karte** (`/map`) - Ihre ursprüngliche Karten-Ansicht
2. **🐕 Hunde verwalten** (`/dogs`) - Neue Verwaltungsseite für die simulierte Datenbank

## Automatisches Benennungssystem

### Funktionsweise
Das System generiert automatisch Namen für Parks und Hundesackerlspender basierend auf ihrer geografischen Lage:

1. **Benutzer klickt auf Karte** → GPS-Koordinaten werden erfasst
2. **Typ wird ausgewählt** → Park oder Hundesackerlspender
3. **Google Maps Reverse Geocoding** → Automatische Adressermittlung
4. **Name wird generiert** → "Hundepark [Straßenname]" oder "Hundesackerlspender [Straßenname]"

### Beispiele
- **Hundeparks**: "Hundepark Hauptstraße", "Hundepark Am Stadtpark"
- **Hundesackerlspender**: "Hundesackerlspender Parkweg", "Hundesackerlspender Lindenallee"

### Vorteile
- ✅ Keine manuelle Eingabe erforderlich
- ✅ Konsistente Namensgebung
- ✅ Automatische Lokalisierung
- ✅ Benutzerfreundlicher Workflow

## Verwendung

### Hunde verwalten
- Neue Hunde hinzufügen
- Bestehende Hunde bearbeiten
- Hunde löschen
- Automatische Erkennung von Spezialrassen
- Letzter Spaziergang-Tracking
- Validation und Fehlerbehandlung

### Parks und Spender verwalten

- **Automatische Namensgebung**: Namen werden vollständig automatisch generiert
  - **Hundeparks**: "Hundepark [Straßenname]" (z.B. "Hundepark Hauptstraße")
  - **Hundesackerlspender**: "Hundesackerlspender [Straßenname]" (z.B. "Hundesackerlspender Parkweg")
  - Die Namensgebung erfolgt automatisch durch Reverse Geocoding über Google Maps API
  - Keine manuelle Eingabe von Namen erforderlich
- Vollautomatischer Prozess: Klick auf Karte → Typ wählen → Fertig
- Benutzerfreundliche Formulare ohne redundante Eingaben

### Daten-Persistierung
- Alle Daten werden automatisch im LocalStorage gespeichert
- Daten bleiben nach Browser-Neustart erhalten
- Reset-Funktion verfügbar für Entwicklung

### API-Simulation
- Realistische Delays (300-500ms)
- Error-Handling
- Observable-basierte Architektur

## Migration zu echtem Backend

Wenn Sie später ein echtes Backend haben, müssen Sie nur:

1. **HttpClientModule** importieren
2. In `ApiService` die kommentierten HTTP-Calls aktivieren
3. Die simulierten Calls durch echte ersetzen
4. Eventuell Interceptors für Authentifizierung hinzufügen

### Beispiel für echte API-Calls:
```typescript
// Aus dem ApiService - einfach auskommentieren und anpassen:
getAllDogs(): Observable<Dog[]> {
  return this.http.get<Dog[]>('/api/dogs');
}

createDog(dog: Omit<Dog, 'id'>): Observable<Dog> {
  return this.http.post<Dog>('/api/dogs', dog);
}
```

## Features der simulierten Datenbank

### ✅ Verfügbare Funktionen

- CRUD-Operationen für alle Entitäten (Hunde, Hundeparks, Hundesackerlspender)
- **Automatische Namensgenerierung** für Parks und Spender
- **GPS-basierte Navigation** mit aktueller Position
- Suchfunktionen (nach Rasse, Standort)
- Entfernungsberechnung zwischen Standorten
- Reaktive Updates mit RxJS Observables
- LocalStorage-Persistierung für Offline-Funktionalität
- Validierung von Spezialrassen
- Umfassendes Error-Handling
- **Google Maps Integration** mit Reverse Geocoding

### 🔮 Erweiterbar für später
- Benutzer-Authentifizierung
- Datei-Upload (Hundefotos)
- Push-Notifications
- Echtzeit-Updates
- Geo-Location Services
- Wetter-Integration

## Komponenten

### DogManagementComponent
- Vollständige CRUD-Oberfläche
- Responsive Design
- Form-Validation
- Loading States
- Error Messages

### NavigationComponent
- Moderne Navigation zwischen Bereichen
- Responsive Design
- Aktive Route-Hervorhebung

## Development

Die simulierte Datenbank läuft komplett client-seitig und benötigt keine zusätzliche Konfiguration. Starten Sie einfach:

```bash
ng serve
```

Dann navigieren Sie zu:
- `http://localhost:4200/map` - Karten-Ansicht
- `http://localhost:4200/dogs` - Hunde-Verwaltung

## Vorteile dieser Lösung

1. **Sofort einsatzbereit** - Keine Backend-Abhängigkeiten
2. **Realistische Entwicklung** - Echte Angular Patterns
3. **Einfache Migration** - Klar strukturiert für Backend-Wechsel
4. **Vollständige Features** - Alle CRUD-Operationen verfügbar
5. **Moderne Architektur** - Observables, Services, Components
6. **Responsive UI** - Funktioniert auf allen Geräten
