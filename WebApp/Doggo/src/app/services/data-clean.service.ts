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
  userId: number; // Zuordnung zum angemeldeten Benutzer
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
}

export interface WalkRoute {
  id: number;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number; // in Minuten
  distance: number; // in km
  waypoints: {
    lat: number;
    lng: number;
  }[];
  rating: number;
}

export interface WasteDispenser {
  id: number;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  address: string;
  type: 'bags' | 'bins' | 'both'; // Sackerl, Mülleimer oder beides
  isWorking: boolean;
  lastRefilled?: Date;
  reportedIssues: string[];
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  
  // Simulierte Datenbank als BehaviorSubjects für reaktive Updates
  private usersSubject = new BehaviorSubject<User[]>(this.getInitialUsers());
  private dogsSubject = new BehaviorSubject<Dog[]>(this.getInitialDogs());
  private dogParksSubject = new BehaviorSubject<DogPark[]>(this.getInitialDogParks());
  private walkRoutesSubject = new BehaviorSubject<WalkRoute[]>(this.getInitialWalkRoutes());
  private wasteDispensersSubject = new BehaviorSubject<WasteDispenser[]>(this.getInitialWasteDispensers());

  // Aktuell angemeldeter Benutzer
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  constructor() {
    // Lade Daten aus localStorage falls vorhanden
    this.loadFromLocalStorage();
    // Simuliere angemeldeten Benutzer
    this.simulateLoggedInUser();
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

  get walkRoutes$(): Observable<WalkRoute[]> {
    return this.walkRoutesSubject.asObservable();
  }

  get wasteDispensers$(): Observable<WasteDispenser[]> {
    return this.wasteDispensersSubject.asObservable();
  }

  // CRUD Operationen für Hunde (nur für angemeldeten Benutzer)
  getDogs(): Observable<Dog[]> {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser) {
      return of([]);
    }
    // Nur Hunde des aktuellen Benutzers zurückgeben
    const userDogs = this.dogsSubject.value.filter(dog => dog.userId === currentUser.id);
    return of(userDogs).pipe(delay(500));
  }

  getDogById(id: number): Observable<Dog | undefined> {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser) {
      return of(undefined);
    }
    const dog = this.dogsSubject.value.find(d => d.id === id && d.userId === currentUser.id);
    return of(dog).pipe(delay(300));
  }

  addDog(dog: Omit<Dog, 'id' | 'userId'>): Observable<Dog> {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser) {
      throw new Error('Benutzer muss angemeldet sein');
    }

    const newDog: Dog = {
      ...dog,
      id: this.generateId(this.dogsSubject.value),
      userId: currentUser.id
    };
    
    const updatedDogs = [...this.dogsSubject.value, newDog];
    this.dogsSubject.next(updatedDogs);
    this.saveToLocalStorage();
    
    return of(newDog).pipe(delay(300));
  }

  updateDog(id: number, updates: Partial<Dog>): Observable<Dog | null> {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser) {
      return of(null);
    }

    const dogs = this.dogsSubject.value;
    const index = dogs.findIndex(d => d.id === id && d.userId === currentUser.id);
    
    if (index === -1) {
      return of(null);
    }
    
    const updatedDog = { ...dogs[index], ...updates };
    const updatedDogs = [...dogs];
    updatedDogs[index] = updatedDog;
    
    this.dogsSubject.next(updatedDogs);
    this.saveToLocalStorage();
    
    return of(updatedDog).pipe(delay(300));
  }

  deleteDog(id: number): Observable<boolean> {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser) {
      return of(false);
    }

    const dogs = this.dogsSubject.value;
    const filteredDogs = dogs.filter(d => !(d.id === id && d.userId === currentUser.id));
    
    if (filteredDogs.length === dogs.length) {
      return of(false); // Hund nicht gefunden oder gehört nicht dem Benutzer
    }
    
    this.dogsSubject.next(filteredDogs);
    this.saveToLocalStorage();
    
    return of(true).pipe(delay(300));
  }

  // CRUD Operationen für Hundeparks
  getDogParks(): Observable<DogPark[]> {
    return of(this.dogParksSubject.value).pipe(delay(400));
  }

  getDogParkById(id: number): Observable<DogPark | undefined> {
    const park = this.dogParksSubject.value.find(p => p.id === id);
    return of(park).pipe(delay(300));
  }

  // CRUD Operationen für Spazierwege
  getWalkRoutes(): Observable<WalkRoute[]> {
    return of(this.walkRoutesSubject.value).pipe(delay(400));
  }

  getWalkRouteById(id: number): Observable<WalkRoute | undefined> {
    const route = this.walkRoutesSubject.value.find(r => r.id === id);
    return of(route).pipe(delay(300));
  }

  addWalkRoute(route: Omit<WalkRoute, 'id'>): Observable<WalkRoute> {
    const newRoute: WalkRoute = {
      ...route,
      id: this.generateId(this.walkRoutesSubject.value)
    };
    
    const updatedRoutes = [...this.walkRoutesSubject.value, newRoute];
    this.walkRoutesSubject.next(updatedRoutes);
    this.saveToLocalStorage();
    
    return of(newRoute).pipe(delay(300));
  }

  // CRUD Operationen für Hundesackerlspender
  getWasteDispensers(): Observable<WasteDispenser[]> {
    return of(this.wasteDispensersSubject.value).pipe(delay(400));
  }

  getWasteDispenserById(id: number): Observable<WasteDispenser | undefined> {
    const dispenser = this.wasteDispensersSubject.value.find(d => d.id === id);
    return of(dispenser).pipe(delay(300));
  }

  addWasteDispenser(dispenser: Omit<WasteDispenser, 'id'>): Observable<WasteDispenser> {
    const newDispenser: WasteDispenser = {
      ...dispenser,
      id: this.generateId(this.wasteDispensersSubject.value)
    };
    
    const updatedDispensers = [...this.wasteDispensersSubject.value, newDispenser];
    this.wasteDispensersSubject.next(updatedDispensers);
    this.saveToLocalStorage();
    
    return of(newDispenser).pipe(delay(300));
  }

  reportWasteDispenserIssue(id: number, issue: string): Observable<boolean> {
    const dispensers = this.wasteDispensersSubject.value;
    const index = dispensers.findIndex(d => d.id === id);
    
    if (index === -1) {
      return of(false);
    }
    
    const updatedDispenser = { 
      ...dispensers[index], 
      reportedIssues: [...dispensers[index].reportedIssues, issue]
    };
    const updatedDispensers = [...dispensers];
    updatedDispensers[index] = updatedDispenser;
    
    this.wasteDispensersSubject.next(updatedDispensers);
    this.saveToLocalStorage();
    
    return of(true).pipe(delay(300));
  }

  // Benutzer-Management
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<User | null> {
    // Simuliere Login
    const user = this.usersSubject.value.find(u => u.email === email);
    if (user && password === 'password') { // Einfache Simulation
      this.currentUserSubject.next(user);
      return of(user).pipe(delay(1000));
    }
    return of(null).pipe(delay(1000));
  }

  logout(): void {
    this.currentUserSubject.next(null);
  }

  register(userData: Omit<User, 'id' | 'registeredAt'>): Observable<User> {
    const newUser: User = {
      ...userData,
      id: this.generateId(this.usersSubject.value),
      registeredAt: new Date()
    };
    
    const updatedUsers = [...this.usersSubject.value, newUser];
    this.usersSubject.next(updatedUsers);
    this.saveToLocalStorage();
    
    return of(newUser).pipe(delay(1000));
  }

  // Hilfsmethoden
  private generateId(items: any[]): number {
    return items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
  }

  private saveToLocalStorage(): void {
    localStorage.setItem('doggo-users', JSON.stringify(this.usersSubject.value));
    localStorage.setItem('doggo-dogs', JSON.stringify(this.dogsSubject.value));
    localStorage.setItem('doggo-parks', JSON.stringify(this.dogParksSubject.value));
    localStorage.setItem('doggo-routes', JSON.stringify(this.walkRoutesSubject.value));
    localStorage.setItem('doggo-dispensers', JSON.stringify(this.wasteDispensersSubject.value));
    localStorage.setItem('doggo-currentUser', JSON.stringify(this.currentUserSubject.value));
  }

  private loadFromLocalStorage(): void {
    const savedUsers = localStorage.getItem('doggo-users');
    const savedDogs = localStorage.getItem('doggo-dogs');
    const savedParks = localStorage.getItem('doggo-parks');
    const savedRoutes = localStorage.getItem('doggo-routes');
    const savedDispensers = localStorage.getItem('doggo-dispensers');
    const savedCurrentUser = localStorage.getItem('doggo-currentUser');

    if (savedUsers) {
      this.usersSubject.next(JSON.parse(savedUsers));
    }
    if (savedDogs) {
      this.dogsSubject.next(JSON.parse(savedDogs));
    }
    if (savedParks) {
      this.dogParksSubject.next(JSON.parse(savedParks));
    }
    if (savedRoutes) {
      this.walkRoutesSubject.next(JSON.parse(savedRoutes));
    }
    if (savedDispensers) {
      this.wasteDispensersSubject.next(JSON.parse(savedDispensers));
    }
    if (savedCurrentUser) {
      this.currentUserSubject.next(JSON.parse(savedCurrentUser));
    }
  }

  private simulateLoggedInUser(): void {
    // Simuliere einen angemeldeten Benutzer für die Entwicklung
    const users = this.usersSubject.value;
    if (users.length > 0 && !this.currentUserSubject.value) {
      this.currentUserSubject.next(users[0]);
    }
  }

  // Suchfunktionen
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

  // Initialdaten
  private getInitialUsers(): User[] {
    return [
      {
        id: 1,
        email: 'user@example.com',
        name: 'Test Benutzer',
        registeredAt: new Date('2024-01-01')
      },
      {
        id: 2,
        email: 'anna@example.com',
        name: 'Anna Müller',
        registeredAt: new Date('2024-02-15')
      }
    ];
  }

  private getInitialDogs(): Dog[] {
    return [
      {
        id: 1,
        name: 'Max',
        breed: 'Golden Retriever',
        age: 3,
        owner: 'Test Benutzer',
        userId: 1,
        isSpecialBreed: false,
        lastWalk: new Date()
      },
      {
        id: 2,
        name: 'Bella',
        breed: 'American Staffordshire Terrier',
        age: 2,
        owner: 'Test Benutzer',
        userId: 1,
        isSpecialBreed: true
      },
      {
        id: 3,
        name: 'Charlie',
        breed: 'Labrador',
        age: 5,
        owner: 'Anna Müller',
        userId: 2,
        isSpecialBreed: false
      }
    ];
  }

  private getInitialDogParks(): DogPark[] {
    return [
      {
        id: 1,
        name: 'Hundepark Leonding',
        location: { lat: 48.3100, lng: 14.2900 },
        address: 'Parkstraße 1, 4060 Leonding',
        facilities: ['Eingezäunt', 'Wasserspender', 'Agility-Geräte', 'Parkplätze'],
        rating: 4.5,
        isOpen: true
      },
      {
        id: 2,
        name: 'Donaupark Hundewiese',
        location: { lat: 48.3150, lng: 14.2800 },
        address: 'Donaupromenade, 4020 Linz',
        facilities: ['Große Wiese', 'Wasserzugang', 'Schatten', 'Mülleimer'],
        rating: 4.2,
        isOpen: true
      },
      {
        id: 3,
        name: 'Stadtpark Hundebereich',
        location: { lat: 48.3000, lng: 14.2950 },
        address: 'Stadtpark 12, 4060 Leonding',
        facilities: ['Eingezäunt', 'Bänke', 'Beleuchtung'],
        rating: 3.8,
        isOpen: false
      }
    ];
  }

  private getInitialWalkRoutes(): WalkRoute[] {
    return [
      {
        id: 1,
        name: 'Donaurunde',
        description: 'Schöner Spaziergang entlang der Donau mit herrlichem Ausblick',
        difficulty: 'easy',
        duration: 45,
        distance: 3.2,
        waypoints: [
          { lat: 48.3069, lng: 14.2868 },
          { lat: 48.3100, lng: 14.2900 },
          { lat: 48.3150, lng: 14.2800 },
          { lat: 48.3069, lng: 14.2868 }
        ],
        rating: 4.6
      },
      {
        id: 2,
        name: 'Waldspaziergang Pöstlingberg',
        description: 'Anspruchsvolle Route durch den Wald mit schönen Aussichtspunkten',
        difficulty: 'hard',
        duration: 90,
        distance: 5.8,
        waypoints: [
          { lat: 48.3200, lng: 14.2700 },
          { lat: 48.3250, lng: 14.2650 },
          { lat: 48.3300, lng: 14.2600 },
          { lat: 48.3200, lng: 14.2700 }
        ],
        rating: 4.8
      },
      {
        id: 3,
        name: 'Stadtpark Runde',
        description: 'Kurze Runde für den täglichen Spaziergang',
        difficulty: 'easy',
        duration: 20,
        distance: 1.5,
        waypoints: [
          { lat: 48.3000, lng: 14.2950 },
          { lat: 48.3020, lng: 14.2980 },
          { lat: 48.3000, lng: 14.2950 }
        ],
        rating: 4.1
      }
    ];
  }

  private getInitialWasteDispensers(): WasteDispenser[] {
    return [
      {
        id: 1,
        name: 'Hundesackerlspender Parkeingang',
        location: { lat: 48.3100, lng: 14.2900 },
        address: 'Parkstraße 1, 4060 Leonding',
        type: 'bags',
        isWorking: true,
        lastRefilled: new Date('2024-01-20'),
        reportedIssues: []
      },
      {
        id: 2,
        name: 'Hundestation Donaupromenade',
        location: { lat: 48.3150, lng: 14.2800 },
        address: 'Donaupromenade, 4020 Linz',
        type: 'both',
        isWorking: true,
        lastRefilled: new Date('2024-01-18'),
        reportedIssues: []
      },
      {
        id: 3,
        name: 'Hundemülleimer Stadtpark',
        location: { lat: 48.3000, lng: 14.2950 },
        address: 'Stadtpark 12, 4060 Leonding',
        type: 'bins',
        isWorking: false,
        lastRefilled: new Date('2024-01-10'),
        reportedIssues: ['Überfüllt', 'Defekter Deckel']
      },
      {
        id: 4,
        name: 'Hundesackerlspender HTL-Kreuzung',
        location: { lat: 48.3069, lng: 14.2868 },
        address: 'HTL-Kreuzung, 4060 Leonding',
        type: 'bags',
        isWorking: true,
        lastRefilled: new Date('2024-01-22'),
        reportedIssues: []
      }
    ];
  }

  // Reset-Methode für Testing
  resetToInitialData(): void {
    this.usersSubject.next(this.getInitialUsers());
    this.dogsSubject.next(this.getInitialDogs());
    this.dogParksSubject.next(this.getInitialDogParks());
    this.walkRoutesSubject.next(this.getInitialWalkRoutes());
    this.wasteDispensersSubject.next(this.getInitialWasteDispensers());
    this.simulateLoggedInUser();
    this.saveToLocalStorage();
  }
}
