import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

// Interfaces für die Datenmodelle
export interface User {
  id: number;
  email: string;
  name: string;
  registeredAt: Date;
}

export interface Dog {
  id: number;
  name: string;
  breed: string;
  age: number;
  owner: string;
  userId: number;
  isSpecialBreed: boolean;
  lastWalk?: Date;
}

export interface DogPark {
  id: number;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  address: string;
  facilities: string[];
  rating: number;
  isOpen: boolean;
  userId?: number;
  isPublic: boolean;
}

export interface WasteDispenser {
  id: number;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  address: string;
  type: 'bags' | 'bins' | 'both';
  isWorking: boolean;
  reportedIssues: string[];
  userId?: number;
  isPublic: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  // BehaviorSubjects für reaktive Daten
  private usersSubject = new BehaviorSubject<User[]>(this.getInitialUsers());
  private dogsSubject = new BehaviorSubject<Dog[]>(this.getInitialDogs());
  private dogParksSubject = new BehaviorSubject<DogPark[]>(this.getInitialDogParks());
  private wasteDispensersSubject = new BehaviorSubject<WasteDispenser[]>(this.getInitialWasteDispensers());

  // Aktueller Benutzer
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  constructor() {
    this.loadFromLocalStorage();
  }

  // Observable Getter für Components
  get users$(): Observable<User[]> {
    return this.usersSubject.asObservable();
  }

  get currentUser$(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  get dogs$(): Observable<Dog[]> {
    return this.dogsSubject.asObservable();
  }

  get dogParks$(): Observable<DogPark[]> {
    return this.dogParksSubject.asObservable();
  }

  get wasteDispensers$(): Observable<WasteDispenser[]> {
    return this.wasteDispensersSubject.asObservable();
  }

  // Gefilterte Parks: öffentliche + eigene private
  getVisibleDogParks(): Observable<DogPark[]> {
    const currentUser = this.currentUserSubject.value;
    const allParks = this.dogParksSubject.value;
    
    if (!currentUser) {
      const publicParks = allParks.filter(park => park.isPublic);
      return of(publicParks);
    }
    
    const visibleParks = allParks.filter(park => 
      park.isPublic || park.userId === currentUser.id
    );
    return of(visibleParks);
  }

  // Gefilterte Spender: öffentliche + eigene private
  getVisibleWasteDispensers(): Observable<WasteDispenser[]> {
    const currentUser = this.currentUserSubject.value;
    const allDispensers = this.wasteDispensersSubject.value;
    
    if (!currentUser) {
      const publicDispensers = allDispensers.filter(dispenser => dispenser.isPublic);
      return of(publicDispensers);
    }
    
    const visibleDispensers = allDispensers.filter(dispenser => 
      dispenser.isPublic || dispenser.userId === currentUser.id
    );
    return of(visibleDispensers);
  }

  // User Management
  setCurrentUser(user: User | null): void {
    this.currentUserSubject.next(user);
    this.saveToLocalStorage();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  addUser(user: Omit<User, 'id'>): Observable<User> {
    const newUser: User = {
      ...user,
      id: Math.max(...this.usersSubject.value.map(u => u.id), 0) + 1
    };
    const users = [...this.usersSubject.value, newUser];
    this.usersSubject.next(users);
    this.saveToLocalStorage();
    return of(newUser).pipe(delay(300));
  }

  getUserByEmail(email: string): User | null {
    return this.usersSubject.value.find(user => user.email === email) || null;
  }

  // Dog Management
  addDog(dog: Omit<Dog, 'id'>): Observable<Dog> {
    const newDog: Dog = {
      ...dog,
      id: Math.max(...this.dogsSubject.value.map(d => d.id), 0) + 1
    };
    const dogs = [...this.dogsSubject.value, newDog];
    this.dogsSubject.next(dogs);
    this.saveToLocalStorage();
    return of(newDog).pipe(delay(300));
  }

  updateDog(id: number, updates: Partial<Dog>): void {
    const dogs = this.dogsSubject.value.map(dog =>
      dog.id === id ? { ...dog, ...updates } : dog
    );
    this.dogsSubject.next(dogs);
    this.saveToLocalStorage();
  }

  deleteDog(id: number): void {
    const dogs = this.dogsSubject.value.filter(dog => dog.id !== id);
    this.dogsSubject.next(dogs);
    this.saveToLocalStorage();
  }

  getDogsByUserId(userId: number): Dog[] {
    return this.dogsSubject.value.filter(dog => dog.userId === userId);
  }

  // Dog Park Management
  addDogPark(park: Omit<DogPark, 'id'>): Observable<DogPark> {
    const newPark: DogPark = {
      ...park,
      id: Math.max(...this.dogParksSubject.value.map(p => p.id), 0) + 1
    };
    const parks = [...this.dogParksSubject.value, newPark];
    this.dogParksSubject.next(parks);
    this.saveToLocalStorage();
    return of(newPark).pipe(delay(300));
  }

  updateDogPark(id: number, updates: Partial<DogPark>): void {
    const parks = this.dogParksSubject.value.map(park =>
      park.id === id ? { ...park, ...updates } : park
    );
    this.dogParksSubject.next(parks);
    this.saveToLocalStorage();
  }

  deleteDogPark(id: number): Observable<void> {
    const parks = this.dogParksSubject.value.filter(park => park.id !== id);
    this.dogParksSubject.next(parks);
    this.saveToLocalStorage();
    return new Observable(observer => {
      observer.next();
      observer.complete();
    });
  }

  getDogParksByUserId(userId: number): DogPark[] {
    return this.dogParksSubject.value.filter(park => park.userId === userId);
  }

  // Waste Dispenser Management
  addWasteDispenser(dispenser: Omit<WasteDispenser, 'id'>): Observable<WasteDispenser> {
    const newDispenser: WasteDispenser = {
      ...dispenser,
      id: Math.max(...this.wasteDispensersSubject.value.map(d => d.id), 0) + 1
    };
    const dispensers = [...this.wasteDispensersSubject.value, newDispenser];
    this.wasteDispensersSubject.next(dispensers);
    this.saveToLocalStorage();
    return of(newDispenser).pipe(delay(300));
  }

  updateWasteDispenser(id: number, updates: Partial<WasteDispenser>): void {
    const dispensers = this.wasteDispensersSubject.value.map(dispenser =>
      dispenser.id === id ? { ...dispenser, ...updates } : dispenser
    );
    this.wasteDispensersSubject.next(dispensers);
    this.saveToLocalStorage();
  }

  deleteWasteDispenser(id: number): Observable<void> {
    const dispensers = this.wasteDispensersSubject.value.filter(dispenser => dispenser.id !== id);
    this.wasteDispensersSubject.next(dispensers);
    this.saveToLocalStorage();
    return new Observable(observer => {
      observer.next();
      observer.complete();
    });
  }

  getWasteDispensersByUserId(userId: number): WasteDispenser[] {
    return this.wasteDispensersSubject.value.filter(dispenser => dispenser.userId === userId);
  }

  reportWasteDispenserIssue(id: number, issue: string): void {
    const dispensers = this.wasteDispensersSubject.value.map(dispenser => {
      if (dispenser.id === id) {
        return {
          ...dispenser,
          reportedIssues: [...dispenser.reportedIssues, issue],
          isWorking: false
        };
      }
      return dispenser;
    });
    this.wasteDispensersSubject.next(dispensers);
    this.saveToLocalStorage();
  }

  // Für ApiService Kompatibilität
  getDogs(): Observable<Dog[]> {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser) {
      return of([]);
    }
    const userDogs = this.dogsSubject.value.filter(dog => dog.userId === currentUser.id);
    return of(userDogs).pipe(delay(300));
  }

  getDogById(id: number): Observable<Dog | undefined> {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser) {
      return of(undefined);
    }
    const dog = this.dogsSubject.value.find(d => d.id === id && d.userId === currentUser.id);
    return of(dog).pipe(delay(300));
  }

  searchDogsByBreed(breed: string): Observable<Dog[]> {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser) {
      return of([]);
    }
    const filteredDogs = this.dogsSubject.value.filter(dog => 
      dog.userId === currentUser.id && 
      dog.breed.toLowerCase().includes(breed.toLowerCase())
    );
    return of(filteredDogs).pipe(delay(300));
  }

  getDogParks(): Observable<DogPark[]> {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser) {
      return of([]);
    }
    const userParks = this.dogParksSubject.value.filter(park => park.userId === currentUser.id);
    return of(userParks).pipe(delay(300));
  }

  getDogParkById(id: number): Observable<DogPark | undefined> {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser) {
      return of(undefined);
    }
    const park = this.dogParksSubject.value.find(p => p.id === id && p.userId === currentUser.id);
    return of(park).pipe(delay(300));
  }

  getWasteDispensers(): Observable<WasteDispenser[]> {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser) {
      return of([]);
    }
    const userDispensers = this.wasteDispensersSubject.value.filter(dispenser => dispenser.userId === currentUser.id);
    return of(userDispensers).pipe(delay(300));
  }

  getWasteDispenserById(id: number): Observable<WasteDispenser | undefined> {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser) {
      return of(undefined);
    }
    const dispenser = this.wasteDispensersSubject.value.find(d => d.id === id && d.userId === currentUser.id);
    return of(dispenser).pipe(delay(300));
  }

  getUsers(): Observable<User[]> {
    return of(this.usersSubject.value).pipe(delay(300));
  }

  // LocalStorage Management
  private saveToLocalStorage(): void {
    const data = {
      users: this.usersSubject.value,
      dogs: this.dogsSubject.value,
      dogParks: this.dogParksSubject.value,
      wasteDispensers: this.wasteDispensersSubject.value,
      currentUser: this.currentUserSubject.value
    };
    localStorage.setItem('doggoGO_data', JSON.stringify(data));
  }

  private loadFromLocalStorage(): void {
    const saved = localStorage.getItem('doggoGO_data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.users) this.usersSubject.next(data.users);
        if (data.dogs) this.dogsSubject.next(data.dogs);
        if (data.dogParks) this.dogParksSubject.next(data.dogParks);
        if (data.wasteDispensers) this.wasteDispensersSubject.next(data.wasteDispensers);
        if (data.currentUser) this.currentUserSubject.next(data.currentUser);
      } catch (error) {
        console.error('Fehler beim Laden der LocalStorage-Daten:', error);
      }
    }
  }

  // Initial Data
  private getInitialUsers(): User[] {
    return [
      {
        id: 1,
        email: 'max@example.com',
        name: 'Max Mustermann',
        registeredAt: new Date('2024-01-15')
      },
      {
        id: 2,
        email: 'anna@example.com',
        name: 'Anna Schmidt',
        registeredAt: new Date('2024-02-20')
      }
    ];
  }

  private getInitialDogs(): Dog[] {
    return [
      {
        id: 1,
        name: 'Buddy',
        breed: 'Golden Retriever',
        age: 3,
        owner: 'Max Mustermann',
        userId: 1,
        isSpecialBreed: false,
        lastWalk: new Date('2024-03-15T10:30:00')
      },
      {
        id: 2,
        name: 'Luna',
        breed: 'Border Collie',
        age: 2,
        owner: 'Anna Schmidt',
        userId: 2,
        isSpecialBreed: false,
        lastWalk: new Date('2024-03-14T16:45:00')
      },
      {
        id: 3,
        name: 'Rex',
        breed: 'Deutscher Schäferhund',
        age: 5,
        owner: 'Max Mustermann',
        userId: 1,
        isSpecialBreed: true,
        lastWalk: new Date('2024-03-16T08:15:00')
      }
    ];
  }

  private getInitialDogParks(): DogPark[] {
    return [
      {
        id: 1,
        name: 'Hundepark Linz Zentrum',
        location: { lat: 48.3069, lng: 14.2858 },
        address: 'Landstraße 1, 4020 Linz',
        facilities: ['Zaun', 'Wasserspender', 'Agility-Parcours'],
        rating: 4.5,
        isOpen: true,
        userId: undefined,
        isPublic: true
      },
      {
        id: 2,
        name: 'Donaupark Hundewiese',
        location: { lat: 48.3158, lng: 14.2922 },
        address: 'Untere Donaulände, 4020 Linz',
        facilities: ['Wasserspender', 'Schatten'],
        rating: 4.2,
        isOpen: true,
        userId: 1,
        isPublic: true
      },
      {
        id: 3,
        name: 'Stadtpark Hundebereich',
        location: { lat: 48.2973, lng: 14.2847 },
        address: 'Stadtpark, 4020 Linz',
        facilities: ['Zaun', 'Bänke'],
        rating: 3.8,
        isOpen: true,
        userId: undefined,
        isPublic: true
      }
    ];
  }

  private getInitialWasteDispensers(): WasteDispenser[] {
    return [
      {
        id: 1,
        name: 'Hundesackerlspender Stadtplatz',
        location: { lat: 48.2797, lng: 14.2488 },
        address: 'Stadtplatz 1, 4060 Leonding (Rathaus)',
        type: 'both',
        isWorking: true,
        reportedIssues: [],
        userId: undefined,
        isPublic: true
      },
      {
        id: 2,
        name: 'Hundesackerlspender Hainzenbachstraße',
        location: { lat: 48.27868, lng: 14.24570 },
        address: 'Hainzenbachstraße 18, 4060 Leonding (OMV Tankstelle)',
        type: 'bags',
        isWorking: true,
        reportedIssues: [],
        userId: undefined,
        isPublic: true
      },
      {
        id: 3,
        name: 'Hundesackerlspender Lehnergutstraße',
        location: { lat: 48.2761693, lng: 14.2548512 },
        address: 'Lehnergutstraße (nahe Imbergstraße), 4060 Leonding',
        type: 'both',
        isWorking: true,
        reportedIssues: [],
        userId: undefined,
        isPublic: true
      },
      {
        id: 4,
        name: 'Hundesackerlspender Schafferstraße',
        location: { lat: 48.28075, lng: 14.23171 },
        address: 'Schafferstraße (mittlerer Bereich), 4060 Leonding',
        type: 'bags',
        isWorking: false,
        reportedIssues: ['Leer', 'Beschädigung am Spender'],
        userId: undefined,
        isPublic: true
      },
      {
        id: 5,
        name: 'Hundesackerlspender Miesenbergerhof',
        location: { lat: 48.278229, lng: 14.233858 },
        address: 'Schafferstraße 14, 4060 Leonding (Miesenbergerhof)',
        type: 'both',
        isWorking: true,
        reportedIssues: [],
        userId: undefined,
        isPublic: true
      },
      {
        id: 6,
        name: 'Hundesackerlspender Jakob-Täubel-Weg',
        location: { lat: 48.274441, lng: 14.225754 },
        address: 'Jakob-Täubel-Weg 2, 4060 Leonding (Hundeschule)',
        type: 'both',
        isWorking: true,
        reportedIssues: [],
        userId: undefined,
        isPublic: true
      },
      {
        id: 7,
        name: 'Hundesackerlspender Bergham',
        location: { lat: 48.28083, lng: 14.23111 },
        address: 'Bergham, 4060 Leonding (Stadtteil)',
        type: 'bags',
        isWorking: true,
        reportedIssues: [],
        userId: undefined,
        isPublic: true
      },
      {
        id: 8,
        name: 'Hundesackerlspender Zaubertal',
        location: { lat: 48.30333, lng: 14.25700 },
        address: 'Zaubertal, 4060 Leonding (Stadtteil)',
        type: 'both',
        isWorking: false,
        reportedIssues: ['Defekt'],
        userId: undefined,
        isPublic: true
      },
      {
        id: 9,
        name: 'Hundesackerlspender Radmayrweg',
        location: { lat: 48.2816892, lng: 14.2609502 },
        address: 'Radmayrweg (neben Imbergstraße), 4060 Leonding',
        type: 'bags',
        isWorking: true,
        reportedIssues: [],
        userId: undefined,
        isPublic: true
      },
      {
        id: 10,
        name: 'Hundesackerlspender Pilgerkreuz',
        location: { lat: 48.287535, lng: 14.241524 },
        address: 'Kreuzung Hainzenbach/Ruflinger Straße, 4060 Leonding',
        type: 'both',
        isWorking: true,
        reportedIssues: [],
        userId: undefined,
        isPublic: true
      }
    ];
  }

  // Reset-Methode für Testdaten
  resetToInitialData(): void {
    this.usersSubject.next(this.getInitialUsers());
    this.dogsSubject.next(this.getInitialDogs());
    this.dogParksSubject.next(this.getInitialDogParks());
    this.wasteDispensersSubject.next(this.getInitialWasteDispensers());
    this.saveToLocalStorage();
  }
}
