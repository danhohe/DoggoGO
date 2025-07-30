# DoggoGO - CSS Modularisierung & Projektdokumentation

## 📋 Projektübersicht

**DoggoGO** ist eine Angular-Webanwendung für Hundebesitzer, die eine interaktive Karte mit Hundeparks und Hundesackerlspendern in Leonding bietet. Die App unterstützt Benutzerverwaltung, CRUD-Operationen und responsive Design.

---

## 🎨 CSS-Architektur

Die CSS-Struktur wurde modularisiert, um Wartbarkeit, Performance und Skalierbarkeit zu verbessern.

### Hauptdatei

```txt
src/app/app.component.css (261 bytes)
├── @import './styles/layout.css'
├── @import './styles/themes.css'
├── @import './styles/weather.css'
├── @import './styles/weather-hourly.css'
├── @import './styles/typography.css'
└── @import './styles/responsive.css'
```

### CSS-Module

| Modul | Größe | Zweck |
|-------|-------|--------|
| 📐 **layout.css** | 382 bytes | Container, Flexbox, grundlegende Layouts |
| 🎨 **themes.css** | 1,654 bytes | Farbthemen, Gradients, Dark/Light Modes |
| 🌤️ **weather.css** | 2,574 bytes | Wetteranzeige, Glassmorphism, Animationen |
| ⏰ **weather-hourly.css** | 4,708 bytes | Stündliche Wetterprognose-Boxen |
| 📝 **typography.css** | 557 bytes | Schriften, Text-Styling, Hover-Effekte |
| 📱 **responsive.css** | 1,012 bytes | Media Queries, Mobile Optimierung |

---

## 🏗️ Projektstruktur

```txt
src/
├── app/
│   ├── components/
│   │   ├── dog-management.component.ts     # Hunderverwaltung
│   │   ├── login.component.ts              # Login/Registrierung
│   │   └── navigation.component.ts         # Navigation
│   ├── services/
│   │   ├── data.service.ts                 # Zentrale Datenquelle
│   │   ├── api.service.ts                  # API-Simulation
│   │   ├── auth.service.ts                 # Authentifizierung
│   │   └── auth.guard.ts                   # Route-Protection
│   ├── styles/                             # CSS-Module
│   │   ├── layout.css
│   │   ├── themes.css
│   │   ├── weather.css
│   │   ├── weather-hourly.css
│   │   ├── typography.css
│   │   └── responsive.css
│   ├── app.component.ts/.html/.css         # Hauptkomponente
│   ├── app.config.ts                       # App-Konfiguration
│   ├── app.routes.ts                       # Routing
│   └── root.component.ts                   # Root-Wrapper
├── assets/
│   ├── DoggoGOLogo.png
│   └── DoggoGOLogo.jpg
└── main.ts                                 # Bootstrap
```

---

## 🛠️ Services & Datenarchitektur

### DataService (Zentrale Datenquelle)

- **BehaviorSubjects** für reaktive Daten
- **Users, Dogs, Parks, WasteDispensers** Management
- **LocalStorage** Persistierung
- **Observable-basierte** CRUD-Operationen

### ApiService (API-Simulation)

- **HTTP-kompatible** Methoden
- **Observable-Rückgaben**
- **Vorbereitet** für echte API-Integration

### AuthService (Authentifizierung)

- **Login/Logout** Funktionalität
- **Session-Persistierung**
- **User-Management**

---

## 🌍 Features

### Karten-Integration

- **Google Maps** Integration
- **Interaktive Marker** für Parks und Spender
- **InfoWindows** mit detaillierten Informationen
- **Benutzer-Standort** Anzeige
- **Status-Bearbeitung** für eingeloggte Nutzer (Parks/Spender)

### Status-Update-Feature (NEU)

- **Logged-in Users** können Park- und Spender-Status direkt auf der Karte bearbeiten
- **Modal-Interface** für intuitive Status-Änderungen
- **Echtzeit-Updates** mit sofortiger Anzeige der Änderungen
- **Park-Status**: Geöffnet/Geschlossen
- **Spender-Status**: Funktionsfähig/Defekt
- **Globale Callbacks** für InfoWindow-Integration

### Datenmanagement

- **Hundeparks**: CRUD, Bewertungen, Ausstattung
- **Hundesackerlspender**: 10 echte Leonding-Standorte, Statusmeldungen
- **Hunde**: Vollständige Verwaltung ohne Registrierungsnummer
- **Filter & Suche**: Kategoriebasierte Anzeige

### UI/UX

- **Responsive Design** für alle Geräte
- **Modern Glassmorphism** Effekte
- **Animationen** und Hover-Effekte
- **Wetteranzeige** mit Tag/Nacht-Modi
- **"Meine Hunde" Modus** für personalisierte Ansicht

---

## 🚀 Build & Deployment

### Entwicklung

```bash
npm start                # Dev-Server starten
npm run build           # Production Build
npm test                # Tests ausführen
```

### Build-Konfiguration

- **CSS Budget**: 12kB (erhöht von 4kB)
- **Bundle-Größe**: ~435kB
- **Keine Warnings** nach Modularisierung

---

## 📱 Responsive Design

### Breakpoints

- **900px**: Tablet-optimierte Layouts
- **600px**: Mobile-optimierte Layouts

### Mobile Features

- **Touch-optimierte** Buttons
- **Scrollbare** Wetter-Listen
- **Flexible** Container-Layouts
- **Kleinere** Schriftgrößen

---

## 🔐 Authentifizierung

### Demo-Accounts

```txt
E-Mail: max@example.com
Passwort: beliebig (wird nicht geprüft)

E-Mail: anna@example.com  
Passwort: beliebig (wird nicht geprüft)
```

### Features

- **Session-Persistierung** über LocalStorage
- **Route-Guards** für geschützte Bereiche
- **Registrierung** neuer Benutzer

---

## 🌤️ Wetter-Integration

### Aktuelle Wetter-Anzeige

- **Glassmorphism-Design**
- **Tag/Nacht-Modi** basierend auf Sonnenauf-/untergang
- **Animierte Emojis**
- **Wind & Luftfeuchtigkeit**

### Stündliche Prognose

- **Scrollbare Karten**
- **Hover-Effekte**
- **Responsive Layout**

---

## 🗺️ Leonding Waste Dispenser Locations

Die App enthält 10 echte Hundesackerlspender-Standorte in Leonding:

1. **Hauptplatz** - Zentrum
2. **Stadtpark** - Bei der Traun
3. **Pichlerpark** - Wohngebiet
4. **Haiderpark** - Nahe Schulen
5. **Traun-Uferweg** - Beliebter Spazierweg
6. **Leonding Bahnhof** - Verkehrsknotenpunkt
7. **Reinthalpark** - Familienfreundlich
8. **Kornweg Sportplatz** - Sportbereich
9. **Zaubertalpark** - Naturnahes Gebiet
10. **Dopplpark** - Ruhige Wohngegend

---

## 📈 Performance

### Bundle-Analyse

- **Main**: 400.51 kB → 97.06 kB (gzipped)
- **Polyfills**: 34.52 kB → 11.28 kB (gzipped)
- **Gesamt**: 435.03 kB → 108.34 kB (gzipped)

### Optimierungen

- **CSS-Modularisierung** für bessere Caching
- **Tree-shaking** für ungenutzten Code
- **Lazy Loading** vorbereitet

---

## 🔧 Wartung & Entwicklung

### CSS hinzufügen

1. Neues Modul in `src/app/styles/` erstellen
2. Import in `app.component.css` hinzufügen
3. Themen-spezifische Styles in `themes.css`

### Neue Features

1. Service in `services/` erstellen
2. Component in `components/` hinzufügen
3. Route in `app.routes.ts` registrieren
4. CSS-Module nach Bedarf erweitern

### API-Integration

- **ApiService** ist vorbereitet für HTTP-Calls
- **DataService** kann als Fallback dienen
- **Observable-Pattern** ist bereits implementiert

---

## 🐛 Bekannte Issues

- ✅ **Login-Bug**: Behoben (E-Mail-Adresse korrigiert)
- ✅ **CSS-Budget**: Behoben (Modularisierung)
- ✅ **Build-Warnings**: Behoben
- ✅ **Walk-Routes**: Vollständig entfernt
- ✅ **Registration-Number**: Entfernt

---

## 📝 Changelog

### v1.3.0 - Status-Bearbeitung Feature (NEU)

- **Status-Update-Modal** für Parks und Spender hinzugefügt
- **Eingeloggte Nutzer** können Status direkt auf der Karte ändern
- **InfoWindow-Integration** mit "Status bearbeiten" Button
- **Echtzeit-Updates** und sofortige Anzeige
- **Helper-Methoden** für Modal-Validierung
- **Vollständige UI** mit Radio-Buttons und Validierung

### v1.2.0 - CSS Modularisierung

- CSS in 6 thematische Module aufgeteilt
- Build-Budget von 4kB auf 12kB erhöht
- Performance-Optimierungen
- Bessere Wartbarkeit

### v1.1.0 - Aufräumung

- Alle Backup-Dateien entfernt
- Walk-Route-Code entfernt
- Login-Bug behoben
- Code-Deduplizierung

### v1.0.0 - Initial Release

- Vollständige App-Funktionalität
- Google Maps Integration
- Leonding Waste Dispenser Daten
- Responsive Design

---

## 👥 Entwicklung

**Entwickelt für**: Schule SYP  
**Framework**: Angular 18+  
**Maps**: Google Maps API  
**Styling**: Modular CSS mit Glassmorphism  
**State Management**: RxJS BehaviorSubjects  

---

## 📞 Support

Bei Fragen zur CSS-Struktur oder Projektarchitektur siehe die entsprechenden Modul-Kommentare oder diese Dokumentation.
