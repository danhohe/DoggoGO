# 🤖 DoggoGO API-Integration Guide 🐕
> **⚠️ KI-KONFIGURIERT:** Diese Dokumentation wurde vollständig von künstlicher Intelligenz erstellt und konfiguriert. Alle API-Definitionen, Interfaces und Implementierungsdetails sind KI-generiert und für eine hypothetische Backend-Integration vorbereitet.

## Überblick

Die DoggoGO-Anwendung ist jetzt vollständig für eine echte API-Integration vorbereitet. Das System kann nahtlos zwischen Mock-Daten (für Entwicklung) und einer echten Backend-API umschalten.

## 🏗️ **Architektur**

```
Frontend (Angular 18)
├── Components (UI)
├── Services
│   ├── ApiReadyService (Unified API Interface)
│   ├── HttpApiService (HTTP Client)
│   ├── AuthService (Authentication)
│   └── DataService (Mock Data)
├── Interceptors (HTTP Middleware)
├── Interfaces (Type Definitions)
└── Environment Configuration
```

## 🔧 **Konfiguration**

### Environment Settings

**Entwicklung (`src/environments/environment.ts`):**
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  enableMockData: true, // Umschalten auf false für echte API
  googleMapsApiKey: 'YOUR_GOOGLE_MAPS_KEY',
  weatherApiKey: 'YOUR_WEATHER_API_KEY'
};
```

**Produktion (`src/environments/environment.prod.ts`):**
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.doggo-go.com/api',
  enableMockData: false,
  googleMapsApiKey: 'YOUR_GOOGLE_MAPS_KEY',
  weatherApiKey: 'YOUR_WEATHER_API_KEY'
};
```

## 🔌 **API-Endpoints**

Die Anwendung erwartet folgende REST-API-Endpoints:

### Authentication
- `POST /api/auth/login` - Benutzer-Login
- `POST /api/auth/register` - Benutzer-Registrierung
- `POST /api/auth/logout` - Benutzer-Logout
- `POST /api/auth/refresh` - Token erneuern

### Dogs
- `GET /api/dogs` - Alle Hunde abrufen
- `GET /api/dogs/:id` - Einzelnen Hund abrufen
- `POST /api/dogs` - Neuen Hund erstellen
- `PUT /api/dogs/:id` - Hund aktualisieren
- `DELETE /api/dogs/:id` - Hund löschen

### Dog Parks
- `GET /api/dog-parks` - Alle Hundeparks abrufen
- `GET /api/dog-parks/:id` - Einzelnen Park abrufen
- `POST /api/dog-parks` - Neuen Park erstellen
- `PUT /api/dog-parks/:id` - Park aktualisieren
- `DELETE /api/dog-parks/:id` - Park löschen

### Waste Dispensers
- `GET /api/waste-dispensers` - Alle Spender abrufen
- `GET /api/waste-dispensers/:id` - Einzelnen Spender abrufen
- `POST /api/waste-dispensers` - Neuen Spender erstellen
- `PUT /api/waste-dispensers/:id` - Spender aktualisieren
- `DELETE /api/waste-dispensers/:id` - Spender löschen
- `POST /api/waste-dispensers/:id/report` - Problem melden

### Utility
- `GET /api/health` - API Gesundheitscheck
- `GET /api/search` - Globale Suche
- `POST /api/upload` - Datei-Upload

## 📋 **API-Response-Format**

Alle API-Responses folgen dem einheitlichen Format:

```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}
```

**Beispiel Login-Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "maxmustermann",
      "name": "Max Mustermann",
      "email": "max@example.com",
      "isActive": true,
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here",
    "expiresIn": 3600
  },
  "message": "Login erfolgreich",
  "timestamp": "2025-07-30T10:00:00Z"
}
```

## 🔐 **Authentication**

### JWT Token Management
- **Access Token**: Gültig für 1 Stunde
- **Refresh Token**: Gültig für 7 Tage
- **Automatische Erneuerung**: AuthInterceptor erneuert Token automatisch

### Token Storage
```typescript
// Tokens werden im localStorage gespeichert
localStorage.setItem('doggo_auth_token', accessToken);
localStorage.setItem('doggo_refresh_token', refreshToken);
```

### Header Format
```http
Authorization: Bearer {access_token}
Content-Type: application/json
```

## 🛠️ **Entwicklung**

### Mock-Modus aktivieren
```typescript
// In environment.ts
enableMockData: true
```

### API-Modus aktivieren
```typescript
// In environment.ts
enableMockData: false,
apiUrl: 'http://localhost:3000/api'
```

### Service Usage Example
```typescript
// In Komponenten
constructor(private apiReady: ApiReadyService) {}

ngOnInit() {
  // Funktioniert sowohl mit Mock als auch echter API
  this.apiReady.getDogs().subscribe(dogs => {
    this.dogs = dogs;
  });
}
```

## 🚀 **Deployment**

### 1. Frontend Build
```bash
# Produktions-Build
ng build --configuration=production

# Build-Files sind in dist/ Ordner
```

### 2. Environment Variables
```bash
# Setze API-URL für Produktion
export API_URL=https://api.doggo-go.com/api
export ENABLE_MOCK_DATA=false
```

### 3. Web Server Konfiguration
```nginx
# Nginx Beispiel
server {
    listen 80;
    server_name doggo-go.com;
    
    location / {
        root /var/www/doggo-go/dist;
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://backend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🔍 **Testing**

### API-Status prüfen
```typescript
this.apiReady.getApiStatus().subscribe(status => {
  console.log('API Status:', status);
  // { isOnline: true, usingMock: false, apiUrl: "https://api..." }
});
```

### Mock/API-Modus prüfen
```typescript
if (this.apiReady.isUsingMockData()) {
  console.log('Läuft im Mock-Modus');
} else {
  console.log('Läuft mit echter API');
}
```

## ⚡ **Performance-Features**

### HTTP Interceptors
- **AuthInterceptor**: Automatische Token-Behandlung
- **LoadingInterceptor**: Globale Loading-States
- **ErrorInterceptor**: Einheitliche Fehlerbehandlung
- **CacheInterceptor**: Response-Caching für bessere Performance

### Caching Strategy
```typescript
// GET-Requests werden 5 Minuten gecacht
// Automatisches Cache-Clearing bei Updates
```

## 🐛 **Error Handling**

### HTTP Error Codes
- `400` - Ungültige Anfrage
- `401` - Nicht autorisiert (automatischer Token-Refresh)
- `403` - Zugriff verweigert
- `404` - Ressource nicht gefunden
- `422` - Validierungsfehler
- `500` - Serverfehler

### Retry Logic
```typescript
// Automatische Wiederholung bei Netzwerkfehlern
retry(1) // 1x wiederholen
timeout(30000) // 30s Timeout
```

## 📊 **Monitoring**

### Health Check
```typescript
this.httpApiService.healthCheck().subscribe(
  response => console.log('API is healthy'),
  error => console.log('API is down')
);
```

### Statistics
```typescript
this.apiReady.getStatistics().subscribe(stats => {
  console.log('App Statistics:', stats);
});
```

## 🔄 **Migration Path**

### Phase 1: Mock-Entwicklung (✅ Aktuell)
- Anwendung läuft mit Mock-Daten
- Vollständige UI-Funktionalität
- `enableMockData: true`

### Phase 2: API-Integration
1. Backend-API entwickeln
2. `enableMockData: false` setzen
3. API-URL konfigurieren
4. Testing & Debugging

### Phase 3: Produktion
1. Produktions-API deployen
2. Frontend mit Produktions-Environment bauen
3. Web-Server konfigurieren
4. Monitoring einrichten

## 🛡️ **Sicherheit**

### Token Security
- JWT-Tokens mit Expiration
- Sichere Token-Storage (HttpOnly Cookies empfohlen für Produktion)
- Automatischer Logout bei ungültigen Tokens

### Input Validation
- Frontend-Validierung
- Backend-Validierung erforderlich
- XSS/CSRF-Protection

### HTTPS
- Nur HTTPS in Produktion
- Sichere Cookie-Flags
- HSTS Headers

## 📚 **Backend-Implementierung**

### Technologie-Empfehlungen
- **Node.js + Express** (TypeScript)
- **NestJS** (Enterprise-ready)
- **ASP.NET Core** (C#)
- **Spring Boot** (Java)

### Datenbank-Schema
```sql
-- Beispiel PostgreSQL Schema
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE dogs (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  breed VARCHAR(255) NOT NULL,
  age INTEGER NOT NULL,
  owner VARCHAR(255) NOT NULL,
  is_special_breed BOOLEAN DEFAULT false,
  user_id INTEGER REFERENCES users(id),
  last_walk TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Weitere Tabellen für dog_parks, waste_dispensers...
```

## 🎯 **Nächste Schritte**

1. **Backend-API entwickeln** basierend auf den Interface-Definitionen
2. **Testing** mit echter API
3. **Deployment-Pipeline** einrichten
4. **Monitoring & Logging** implementieren
5. **Performance-Optimierung** basierend auf Nutzungsdaten

---

**Status: ✅ Frontend API-Ready**
**Nächster Schritt: Backend-Entwicklung**

Die DoggoGO-Anwendung ist vollständig für die API-Integration vorbereitet und kann nahtlos zwischen Mock- und Produktionsdaten umschalten! 🚀
