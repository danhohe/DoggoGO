import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { DataService, Dog, DogPark, WasteDispenser, User } from './data.service';
import { HttpApiService } from './http-api.service';
import { AuthService } from './auth.service';
import {
  ApiDog,
  CreateDogRequest,
  UpdateDogRequest,
  ApiDogPark,
  CreateDogParkRequest,
  UpdateDogParkRequest,
  ApiWasteDispenser,
  CreateWasteDispenserRequest,
  UpdateWasteDispenserRequest,
  SearchParams
} from '../interfaces/api.interfaces';

/**
 * Unified Service für API-Integration
 * Wechselt automatisch zwischen Mock-Daten und echter API basierend auf environment.enableMockData
 * 
 * Diese Service-Schicht abstrahiert die Unterschiede zwischen Mock und echter API,
 * sodass die Komponenten identisch funktionieren können.
 */
@Injectable({
  providedIn: 'root'
})
export class ApiReadyService {
  
  constructor(
    private dataService: DataService,
    private httpApiService: HttpApiService,
    private authService: AuthService
  ) {}

  // ===== UTILITY METHODS =====

  isUsingMockData(): boolean {
    return environment.enableMockData;
  }

  getApiStatus(): Observable<{ isOnline: boolean; usingMock: boolean; apiUrl?: string }> {
    return this.authService.getApiStatus().pipe(
      map(isOnline => ({
        isOnline,
        usingMock: environment.enableMockData,
        apiUrl: environment.enableMockData ? undefined : environment.apiUrl
      }))
    );
  }

  // ===== DOG MANAGEMENT =====

  getDogs(): Observable<Dog[]> {
    if (environment.enableMockData) {
      return this.dataService.dogs$;
    }

    return this.httpApiService.getDogs().pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data.map(this.convertApiDogToDog);
        }
        return [];
      })
    );
  }

  getDog(id: number): Observable<Dog | null> {
    if (environment.enableMockData) {
      return this.dataService.dogs$.pipe(
        map(dogs => dogs.find(dog => dog.id === id) || null)
      );
    }

    return this.httpApiService.getDog(id).pipe(
      map(response => {
        if (response.success && response.data) {
          return this.convertApiDogToDog(response.data);
        }
        return null;
      })
    );
  }

  createDog(dogData: Omit<Dog, 'id'>): Observable<Dog> {
    if (environment.enableMockData) {
      return this.dataService.addDog(dogData);
    }

    const apiDogData: CreateDogRequest = {
      name: dogData.name,
      breed: dogData.breed,
      age: dogData.age,
      isSpecialBreed: dogData.isSpecialBreed
    };

    return this.httpApiService.createDog(apiDogData).pipe(
      map(response => {
        if (response.success && response.data) {
          return this.convertApiDogToDog(response.data);
        }
        throw new Error('Failed to create dog');
      })
    );
  }

  updateDog(id: number, updates: Partial<Dog>): Observable<Dog> {
    if (environment.enableMockData) {
      // Mock: Simuliere Update
      return this.getDogs().pipe(
        map(dogs => {
          const dog = dogs.find(d => d.id === id);
          if (dog) {
            const updatedDog = { ...dog, ...updates };
            // In echter Implementierung würde DataService ein Observable zurückgeben
            return updatedDog;
          }
          throw new Error('Dog not found');
        })
      );
    }

    const apiUpdates: UpdateDogRequest = {
      name: updates.name,
      breed: updates.breed,
      age: updates.age,
      isSpecialBreed: updates.isSpecialBreed,
      lastWalk: updates.lastWalk?.toISOString()
    };

    return this.httpApiService.updateDog(id, apiUpdates).pipe(
      map(response => {
        if (response.success && response.data) {
          return this.convertApiDogToDog(response.data);
        }
        throw new Error('Failed to update dog');
      })
    );
  }

  deleteDog(id: number): Observable<boolean> {
    if (environment.enableMockData) {
      // Mock: Simuliere Löschung
      return of(true);
    }

    return this.httpApiService.deleteDog(id).pipe(
      map(response => response.success)
    );
  }

  // ===== DOG PARK MANAGEMENT =====

  getDogParks(): Observable<DogPark[]> {
    if (environment.enableMockData) {
      return this.dataService.getVisibleDogParks();
    }

    return this.httpApiService.getDogParks().pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data.map(this.convertApiDogParkToDogPark);
        }
        return [];
      })
    );
  }

  createDogPark(parkData: Omit<DogPark, 'id'>): Observable<DogPark> {
    if (environment.enableMockData) {
      return this.dataService.addDogPark(parkData);
    }

    const apiParkData: CreateDogParkRequest = {
      name: parkData.name,
      address: parkData.address,
      location: parkData.location,
      facilities: parkData.facilities,
      rating: parkData.rating,
      isOpen: parkData.isOpen,
      isPublic: parkData.isPublic
    };

    return this.httpApiService.createDogPark(apiParkData).pipe(
      map(response => {
        if (response.success && response.data) {
          return this.convertApiDogParkToDogPark(response.data);
        }
        throw new Error('Failed to create dog park');
      })
    );
  }

  updateDogPark(id: number, updates: Partial<DogPark>): Observable<boolean> {
    if (environment.enableMockData) {
      this.dataService.updateDogPark(id, updates);
      return of(true);
    }

    const apiUpdates: UpdateDogParkRequest = {
      name: updates.name,
      address: updates.address,
      location: updates.location,
      facilities: updates.facilities,
      rating: updates.rating,
      isOpen: updates.isOpen,
      isPublic: updates.isPublic
    };

    return this.httpApiService.updateDogPark(id, apiUpdates).pipe(
      map(response => response.success)
    );
  }

  deleteDogPark(id: number): Observable<boolean> {
    if (environment.enableMockData) {
      return this.dataService.deleteDogPark(id).pipe(map(() => true));
    }

    return this.httpApiService.deleteDogPark(id).pipe(
      map(response => response.success)
    );
  }

  // ===== WASTE DISPENSER MANAGEMENT =====

  getWasteDispensers(): Observable<WasteDispenser[]> {
    if (environment.enableMockData) {
      return this.dataService.getVisibleWasteDispensers();
    }

    return this.httpApiService.getWasteDispensers().pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data.map(this.convertApiWasteDispenserToWasteDispenser);
        }
        return [];
      })
    );
  }

  createWasteDispenser(dispenserData: Omit<WasteDispenser, 'id'>): Observable<WasteDispenser> {
    if (environment.enableMockData) {
      return this.dataService.addWasteDispenser(dispenserData);
    }

    const apiDispenserData: CreateWasteDispenserRequest = {
      name: dispenserData.name,
      address: dispenserData.address,
      location: dispenserData.location,
      type: dispenserData.type,
      isWorking: dispenserData.isWorking,
      isPublic: dispenserData.isPublic
    };

    return this.httpApiService.createWasteDispenser(apiDispenserData).pipe(
      map(response => {
        if (response.success && response.data) {
          return this.convertApiWasteDispenserToWasteDispenser(response.data);
        }
        throw new Error('Failed to create waste dispenser');
      })
    );
  }

  updateWasteDispenser(id: number, updates: Partial<WasteDispenser>): Observable<boolean> {
    if (environment.enableMockData) {
      this.dataService.updateWasteDispenser(id, updates);
      return of(true);
    }

    const apiUpdates: UpdateWasteDispenserRequest = {
      name: updates.name,
      address: updates.address,
      location: updates.location,
      type: updates.type,
      isWorking: updates.isWorking,
      isPublic: updates.isPublic,
      reportedIssues: updates.reportedIssues
    };

    return this.httpApiService.updateWasteDispenser(id, apiUpdates).pipe(
      map(response => response.success)
    );
  }

  deleteWasteDispenser(id: number): Observable<boolean> {
    if (environment.enableMockData) {
      return this.dataService.deleteWasteDispenser(id).pipe(map(() => true));
    }

    return this.httpApiService.deleteWasteDispenser(id).pipe(
      map(response => response.success)
    );
  }

  reportWasteDispenserIssue(id: number, issue: string): Observable<boolean> {
    if (environment.enableMockData) {
      // Mock: Füge Issue zur lokalen Liste hinzu
      return this.dataService.getWasteDispensers().pipe(
        switchMap(dispensers => {
          const dispenser = dispensers.find(d => d.id === id);
          if (dispenser) {
            const updatedDispenser = {
              ...dispenser,
              reportedIssues: [...dispenser.reportedIssues, issue]
            };
            this.dataService.updateWasteDispenser(id, updatedDispenser);
            return of(true);
          }
          return of(false);
        })
      );
    }

    return this.httpApiService.reportWasteDispenserIssue(id, { issue }).pipe(
      map(response => response.success)
    );
  }

  // ===== SEARCH =====

  searchAll(params: SearchParams): Observable<{ dogs: Dog[]; parks: DogPark[]; dispensers: WasteDispenser[] }> {
    if (environment.enableMockData) {
      // Mock-Implementierung: Einfache lokale Suche
      return of({
        dogs: [],
        parks: [],
        dispensers: []
      });
    }

    return this.httpApiService.searchAll(params).pipe(
      map(response => {
        if (response.success && response.data) {
          return {
            dogs: [],
            parks: [],
            dispensers: []
          };
        }
        return { dogs: [], parks: [], dispensers: [] };
      })
    );
  }

  // ===== CONVERSION METHODS =====

  private convertApiDogToDog(apiDog: ApiDog): Dog {
    return {
      id: apiDog.id,
      name: apiDog.name,
      breed: apiDog.breed,
      age: apiDog.age,
      isSpecialBreed: apiDog.isSpecialBreed,
      userId: apiDog.userId,
      lastWalk: apiDog.lastWalk ? new Date(apiDog.lastWalk) : undefined
    };
  }

  private convertApiDogParkToDogPark(apiPark: ApiDogPark): DogPark {
    return {
      id: apiPark.id,
      name: apiPark.name,
      address: apiPark.address,
      location: apiPark.location,
      facilities: apiPark.facilities,
      rating: apiPark.rating,
      isOpen: apiPark.isOpen,
      isPublic: apiPark.isPublic,
      userId: apiPark.userId
    };
  }

  private convertApiWasteDispenserToWasteDispenser(apiDispenser: ApiWasteDispenser): WasteDispenser {
    return {
      id: apiDispenser.id,
      name: apiDispenser.name,
      address: apiDispenser.address,
      location: apiDispenser.location,
      type: apiDispenser.type,
      isWorking: apiDispenser.isWorking,
      isPublic: apiDispenser.isPublic,
      reportedIssues: apiDispenser.reportedIssues,
      userId: apiDispenser.userId
    };
  }

  // ===== STATISTICS & HEALTH =====

  getStatistics(): Observable<any> {
    if (environment.enableMockData) {
      // Mock-Statistiken
      return of({
        totalDogs: 0,
        totalParks: 0,
        totalDispensers: 0,
        activeUsers: 0
      });
    }

    return this.httpApiService.getStatistics().pipe(
      map(response => response.data || {})
    );
  }

  // ===== FILE UPLOAD =====

  uploadFile(file: File, category: 'dog' | 'park' | 'dispenser' = 'dog'): Observable<string> {
    if (environment.enableMockData) {
      // Mock: Simuliere File Upload
      return of(`mock_upload_${Date.now()}_${file.name}`);
    }

    return this.httpApiService.uploadFile(file, category).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data.url;
        }
        throw new Error('File upload failed');
      })
    );
  }
}
