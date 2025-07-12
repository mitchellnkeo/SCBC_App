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
    storyGraph?: string; // StoryGraph profile URL
    socialLinks?: {
      instagram?: string;
      x?: string;
      linkedin?: string;
    };
    lastActiveAt?: Date; // For activity-based filtering
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
    storyGraph?: string; // StoryGraph profile URL
    socialLinks?: {
      instagram?: string;
      x?: string;
      linkedin?: string;
    };
    lastActiveAt?: Date;
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
    images?: string[]; // Array of image URLs
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
    images?: string[]; // Array of image URLs
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

  // Friend System Types
  export interface FriendRequest {
    id: string;
    fromUserId: string;
    fromUserName: string;
    fromUserProfilePicture?: string;
    toUserId: string;
    toUserName: string;
    toUserProfilePicture?: string;
    status: 'pending' | 'accepted' | 'declined';
    createdAt: Date;
    updatedAt: Date;
  }

  export interface Friendship {
    id: string;
    user1Id: string;
    user1Name: string;
    user1ProfilePicture?: string;
    user2Id: string;
    user2Name: string;
    user2ProfilePicture?: string;
    createdAt: Date;
  }

  export interface FriendStatus {
    isFriend: boolean;
    hasIncomingRequest: boolean;
    hasOutgoingRequest: boolean;
    friendshipId?: string;
    requestId?: string;
  }

  // Profile Comment Types
  export interface ProfileComment {
    id: string;
    profileUserId: string; // User whose profile this comment is on
    authorId: string; // User who wrote the comment
    authorName: string;
    authorProfilePicture?: string;
    content: string;
    images?: string[]; // Array of image URLs
    mentions?: import('./mentions').Mention[];
    parentCommentId?: string; // For replies
    isReply?: boolean; // Flag to distinguish top-level comments from replies
    replies?: ProfileComment[]; // Nested replies
    createdAt: Date;
    updatedAt: Date;
  }

  export interface CreateProfileCommentData {
    content: string;
    images?: string[];
    parentCommentId?: string;
    mentions?: import('./mentions').Mention[];
  }

  // Report System Types
  export type ReportType = 'profile' | 'comment' | 'event';
  export type ReportStatus = 'pending' | 'investigating' | 'resolved' | 'dismissed';
  export type ReportReason = 
    | 'inappropriate_content'
    | 'harassment'
    | 'spam'
    | 'hate_speech'
    | 'misinformation'
    | 'violence'
    | 'other';

  export interface Report {
    id: string;
    type: ReportType;
    status: ReportStatus;
    reason: ReportReason;
    description: string;
    
    // Reporter information
    reporterId: string;
    reporterName: string;
    
    // Content being reported
    contentId: string; // profileId, commentId, or eventId
    contentOwnerId: string;
    contentOwnerName: string;
    contentPreview: string; // Brief preview of the reported content
    
    // Associated content info
    eventId?: string; // If comment/profile is related to an event
    eventTitle?: string;
    
    // Admin handling
    assignedAdminId?: string;
    assignedAdminName?: string;
    adminNotes?: string;
    resolutionAction?: string;
    
    createdAt: Date;
    updatedAt: Date;
    resolvedAt?: Date;
  }

  export interface CreateReportData {
    type: ReportType;
    reason: ReportReason;
    description: string;
    contentId: string;
    contentOwnerId: string;
    contentOwnerName: string;
    contentPreview: string;
    eventId?: string;
    eventTitle?: string;
  }

  export interface ReportStats {
    totalReports: number;
    pendingReports: number;
    investigatingReports: number;
    resolvedReports: number;
    dismissedReports: number;
    reportsThisWeek: number;
  }