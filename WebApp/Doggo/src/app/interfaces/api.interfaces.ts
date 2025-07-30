// API Request/Response Interfaces für DoggoGO Backend

// Base Response Interface
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

// Pagination Interface
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Authentication Interfaces
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse extends ApiResponse {
  data: {
    user: ApiUser;
    token: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// User Interfaces
export interface ApiUser {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  profile?: {
    phone?: string;
    address?: string;
    preferredLanguage?: string;
  };
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  profile?: {
    phone?: string;
    address?: string;
    preferredLanguage?: string;
  };
}

// Dog Interfaces
export interface ApiDog {
  id: number;
  name: string;
  breed: string;
  age: number;
  owner: string;
  isSpecialBreed: boolean;
  userId: number;
  lastWalk?: string;
  vaccinations?: {
    rabies?: string;
    distemper?: string;
    parvovirus?: string;
  };
  microchipId?: string;
  insuranceProvider?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDogRequest {
  name: string;
  breed: string;
  age: number;
  owner: string;
  isSpecialBreed: boolean;
  microchipId?: string;
  insuranceProvider?: string;
}

export interface UpdateDogRequest {
  name?: string;
  breed?: string;
  age?: number;
  owner?: string;
  isSpecialBreed?: boolean;
  lastWalk?: string;
  microchipId?: string;
  insuranceProvider?: string;
}

// DogPark Interfaces
export interface ApiDogPark {
  id: number;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  facilities: string[];
  rating: number;
  isOpen: boolean;
  isPublic: boolean;
  userId: number;
  openingHours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  contactInfo?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  photos?: string[];
  reviews?: ApiReview[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateDogParkRequest {
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  facilities?: string[];
  rating?: number;
  isOpen?: boolean;
  isPublic?: boolean;
  openingHours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  contactInfo?: {
    phone?: string;
    email?: string;
    website?: string;
  };
}

export interface UpdateDogParkRequest {
  name?: string;
  address?: string;
  location?: {
    lat: number;
    lng: number;
  };
  facilities?: string[];
  rating?: number;
  isOpen?: boolean;
  isPublic?: boolean;
  openingHours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  contactInfo?: {
    phone?: string;
    email?: string;
    website?: string;
  };
}

// WasteDispenser Interfaces
export interface ApiWasteDispenser {
  id: number;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  type: 'bags' | 'bins' | 'both';
  isWorking: boolean;
  isPublic: boolean;
  userId: number;
  reportedIssues: string[];
  lastRefilled?: string;
  capacity?: number;
  maintenanceSchedule?: string;
  photos?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateWasteDispenserRequest {
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  type: 'bags' | 'bins' | 'both';
  isWorking?: boolean;
  isPublic?: boolean;
  capacity?: number;
  maintenanceSchedule?: string;
}

export interface UpdateWasteDispenserRequest {
  name?: string;
  address?: string;
  location?: {
    lat: number;
    lng: number;
  };
  type?: 'bags' | 'bins' | 'both';
  isWorking?: boolean;
  isPublic?: boolean;
  reportedIssues?: string[];
  lastRefilled?: string;
  capacity?: number;
  maintenanceSchedule?: string;
}

export interface ReportIssueRequest {
  issue: string;
  severity?: 'low' | 'medium' | 'high';
  reportedBy?: number; // userId
}

// Review Interfaces
export interface ApiReview {
  id: number;
  rating: number;
  comment?: string;
  userId: number;
  userName: string;
  targetType: 'dog_park' | 'waste_dispenser';
  targetId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewRequest {
  rating: number;
  comment?: string;
  targetType: 'dog_park' | 'waste_dispenser';
  targetId: number;
}

// Search and Filter Interfaces
export interface SearchParams {
  query?: string;
  latitude?: number;
  longitude?: number;
  radius?: number; // in kilometers
  category?: 'parks' | 'dispensers' | 'all';
  isOpen?: boolean;
  isWorking?: boolean;
  rating?: number; // minimum rating
  facilities?: string[];
  page?: number;
  limit?: number;
  sortBy?: 'distance' | 'rating' | 'name' | 'created_date';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResponse<T> extends PaginatedResponse<T> {
  filters: {
    applied: SearchParams;
    available: {
      facilities: string[];
      maxDistance: number;
      ratingRange: { min: number; max: number };
    };
  };
}

// Statistics Interfaces
export interface ApiStats {
  totalDogs: number;
  totalParks: number;
  totalDispensers: number;
  activeUsers: number;
  recentActivity: {
    newDogs: number;
    newParks: number;
    newDispensers: number;
    reportsResolved: number;
  };
  popularBreeds: Array<{
    breed: string;
    count: number;
  }>;
  topRatedParks: Array<{
    id: number;
    name: string;
    rating: number;
  }>;
}

// Notification Interfaces
export interface ApiNotification {
  id: number;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  isRead: boolean;
  targetType?: 'dog_park' | 'waste_dispenser' | 'dog';
  targetId?: number;
  actionUrl?: string;
  createdAt: string;
}

export interface CreateNotificationRequest {
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  targetType?: 'dog_park' | 'waste_dispenser' | 'dog';
  targetId?: number;
  actionUrl?: string;
}

// File Upload Interfaces
export interface FileUploadResponse extends ApiResponse {
  data: {
    filename: string;
    originalName: string;
    size: number;
    mimeType: string;
    url: string;
  };
}

// Error Interfaces
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  field?: string; // For validation errors
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Webhook Interfaces (für externe Integrationen)
export interface WebhookPayload {
  event: string;
  data: any;
  timestamp: string;
  version: string;
}

// Alle Interfaces sind bereits als export interface deklariert
// Kein zusätzlicher export type Block benötigt
