import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DataService, Dog, DogPark, WasteDispenser } from './data.service';

// Dieser Service simuliert API-Calls und kann später durch echte HTTP-Calls ersetzt werden
@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private dataService: DataService) {}

  // Dog API Methods
  getAllDogs(): Observable<Dog[]> {
    // Später: return this.http.get<Dog[]>('/api/dogs');
    return this.dataService.getDogs();
  }

  getDogById(id: number): Observable<Dog | undefined> {
    // Später: return this.http.get<Dog>(`/api/dogs/${id}`);
    return this.dataService.getDogById(id);
  }

  createDog(dog: Omit<Dog, 'id' | 'userId'>): Observable<Dog> {
    // Später: return this.http.post<Dog>('/api/dogs', dog);
    const currentUser = this.dataService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User must be logged in to create a dog');
    }
    const dogWithUser = { ...dog, userId: currentUser.id };
    return this.dataService.addDog(dogWithUser);
  }

  updateDog(id: number, updates: Partial<Dog>): Observable<Dog | null> {
    // Später: return this.http.put<Dog>(`/api/dogs/${id}`, updates);
    this.dataService.updateDog(id, updates);
    return new Observable(observer => {
      observer.next(null); // Für jetzt, später echte API response
      observer.complete();
    });
  }

  deleteDog(id: number): Observable<boolean> {
    // Später: return this.http.delete<boolean>(`/api/dogs/${id}`);
    this.dataService.deleteDog(id);
    return new Observable(observer => {
      observer.next(true);
      observer.complete();
    });
  }

  searchDogsByBreed(breed: string): Observable<Dog[]> {
    // Später: return this.http.get<Dog[]>(`/api/dogs/search?breed=${breed}`);
    return this.dataService.searchDogsByBreed(breed);
  }

  // Dog Park API Methods
  getAllDogParks(): Observable<DogPark[]> {
    // Später: return this.http.get<DogPark[]>('/api/dogparks');
    return this.dataService.getDogParks();
  }

  getDogParkById(id: number): Observable<DogPark | undefined> {
    // Später: return this.http.get<DogPark>(`/api/dogparks/${id}`);
    return this.dataService.getDogParkById(id);
  }

  // Waste Dispenser API Methods
  getAllWasteDispensers(): Observable<WasteDispenser[]> {
    // Später: return this.http.get<WasteDispenser[]>('/api/waste-dispensers');
    return this.dataService.getWasteDispensers();
  }

  getWasteDispenserById(id: number): Observable<WasteDispenser | undefined> {
    // Später: return this.http.get<WasteDispenser>(`/api/waste-dispensers/${id}`);
    return this.dataService.getWasteDispenserById(id);
  }

  reportWasteDispenserIssue(id: number, issue: string): Observable<boolean> {
    // Später: return this.http.post<boolean>(`/api/waste-dispensers/${id}/report`, { issue });
    this.dataService.reportWasteDispenserIssue(id, issue);
    return new Observable(observer => {
      observer.next(true);
      observer.complete();
    });
  }

  // User/Authentication API Methods (für später)
  login(email: string, password: string): Observable<any> {
    // Später: return this.http.post('/api/auth/login', { email, password });
    // Für jetzt simulieren wir eine erfolgreiche Anmeldung
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({
          success: true,
          token: 'mock-jwt-token',
          user: {
            id: 1,
            email: email,
            name: 'Test User'
          }
        });
        observer.complete();
      }, 1000);
    });
  }

  register(userData: any): Observable<any> {
    // Später: return this.http.post('/api/auth/register', userData);
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({
          success: true,
          message: 'Registration successful'
        });
        observer.complete();
      }, 1000);
    });
  }

  // Weather API (falls Sie Wetterdaten brauchen)
  getWeatherForLocation(lat: number, lng: number): Observable<any> {
    // Später: return this.http.get(`/api/weather?lat=${lat}&lng=${lng}`);
    return new Observable(observer => {
      setTimeout(() => {
        // Simulierte Wetterdaten
        observer.next({
          temp: 18 + Math.random() * 15, // 18-33°C
          description: ['Sonnig', 'Bewölkt', 'Leicht bewölkt', 'Regnerisch'][Math.floor(Math.random() * 4)],
          humidity: 40 + Math.random() * 40, // 40-80%
          windSpeed: Math.random() * 20 // 0-20 km/h
        });
        observer.complete();
      }, 500);
    });
  }

  // Utility Methods für später
  uploadImage(file: File): Observable<any> {
    // Später: FormData upload zu /api/upload
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({
          success: true,
          url: 'https://example.com/mock-image-url.jpg'
        });
        observer.complete();
      }, 2000);
    });
  }

  // Emergency/Notification API
  sendEmergencyAlert(location: { lat: number, lng: number }, message: string): Observable<any> {
    // Später: return this.http.post('/api/emergency', { location, message });
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({
          success: true,
          alertId: Math.random().toString(36).substr(2, 9)
        });
        observer.complete();
      }, 800);
    });
  }
}
