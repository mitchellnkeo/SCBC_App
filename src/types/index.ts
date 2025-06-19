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
    bio?: string;
    hobbies?: string[];
    favoriteBooks?: string[];
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
    startTime: string; // Format: "7:00 PM"
    endTime: string; // Format: "9:00 PM"
    address: string;
    headerPhoto?: string; // URL to header image
    location: string; // Venue name (e.g., "Central Library")
    maxAttendees?: number;
    createdBy: string; // User ID of creator
    hostName: string; // Display name of host
    hostProfilePicture?: string;
    status: 'pending' | 'approved' | 'rejected'; // Admin approval status
    approvedBy?: string; // Admin user ID who approved/rejected
    approvedAt?: Date; // When the approval happened
    rejectionReason?: string; // Optional reason for rejection
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface RSVP {
    id: string;
    eventId: string;
    userId: string;
    userName: string; // Display name for easy access
    userProfilePicture?: string;
    status: 'going' | 'maybe' | 'not-going';
    createdAt: Date;
    updatedAt: Date;
  }
  
  // Comment Types
  export interface EventComment {
    id: string;
    eventId: string;
    userId: string;
    userName: string; // Display name for easy access
    userProfilePicture?: string;
    content: string;
    mentions?: import('./mentions').Mention[];
    parentCommentId?: string; // For replies
    replies?: EventComment[]; // Nested replies
    createdAt: Date;
    updatedAt: Date;
  }
  
  // Event Statistics (for display)
  export interface EventStats {
    totalAttendees: number;
    goingCount: number;
    maybeCount: number;
    notGoingCount: number;
    commentsCount: number;
  }
  
  // Event with populated data for display
  export interface PopulatedEvent extends BookClubEvent {
    rsvps: RSVP[];
    comments: EventComment[];
    stats: EventStats;
    userRsvp?: RSVP; // Current user's RSVP status
  }
  
  // Navigation Types
  export type RootStackParamList = {
    Home: undefined;
    EventDetails: { eventId: string };
    Profile: { userId?: string };
    CreateEvent: undefined;
    EditEvent: { eventId: string };
    Login: undefined;
    Register: undefined;
  };
  
  // API Response Types
  export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
  }

  // Export error types for easy access
  export * from './errors';
  
  // Export mention types
  export * from './mentions';
  
  // Export notification types
  export * from './notifications';
  
  // Form Types
  export interface CreateEventFormData {
    title: string;
    description: string;
    date: Date;
    startTime: string;
    endTime: string;
    location: string;
    address: string;
    maxAttendees?: number;
    headerPhoto?: string;
  }
  
  export interface CreateCommentFormData {
    content: string;
    parentCommentId?: string;
    mentions?: import('./mentions').Mention[];
  }
  
  // Admin Approval Types
  export interface ApprovalFormData {
    action: 'approve' | 'reject';
    rejectionReason?: string;
  }
  
  export interface PendingEventStats {
    totalPending: number;
    newThisWeek: number;
  }

  // FAQ Types
  export interface FAQ {
    id: string;
    question: string;
    answer: string;
    createdBy: string; // User ID of creator
    createdByName: string; // Display name of creator
    createdAt: Date;
    updatedAt: Date;
    isPublished: boolean; // For draft/published status
    order: number; // For manual ordering
  }

  export interface CreateFAQData {
    question: string;
    answer: string;
    isPublished?: boolean;
  }

  export interface EditFAQData {
    question?: string;
    answer?: string;
    isPublished?: boolean;
    order?: number;
  }