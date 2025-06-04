// User Types
export interface User {
    id: string;
    email: string;
    displayName: string;
    role: 'admin' | 'member';
    profilePicture?: string;
    bio?: string;
    hobbies?: string[];
    favoriteBooks?: string[];
    createdAt: Date;
    updatedAt: Date;
  }
  
  // Authentication Types
  export interface AuthUser {
    id: string;
    email: string;
    displayName: string;
    role: 'admin' | 'member';
    profilePicture?: string;
  }
  
  export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface RegisterCredentials {
    email: string;
    password: string;
    displayName: string;
  }
  
  export interface AuthState {
    user: AuthUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;
  }
  
  // Event Types
  export interface BookClubEvent {
    id: string;
    title: string;
    description: string;
    date: Date;
    location: string;
    maxAttendees?: number;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface RSVP {
    id: string;
    eventId: string;
    userId: string;
    status: 'attending' | 'maybe' | 'not-attending';
    createdAt: Date;
  }
  
  // Comment Types
  export interface Comment {
    id: string;
    eventId: string;
    userId: string;
    content: string;
    parentCommentId?: string; // For replies
    createdAt: Date;
    updatedAt: Date;
  }
  
  // Navigation Types
  export type RootStackParamList = {
    Home: undefined;
    EventDetails: { eventId: string };
    Profile: { userId?: string };
    CreateEvent: undefined;
    Login: undefined;
    Register: undefined;
  };
  
  // API Response Types
  export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
  }