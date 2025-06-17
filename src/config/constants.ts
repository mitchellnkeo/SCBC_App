// App Configuration Constants
export const APP_CONFIG = {
  // Pagination and Limits
  EVENTS_PER_PAGE: 20,
  COMMENTS_PER_PAGE: 50,
  USERS_PER_SEARCH: 10,
  MAX_IMAGE_SIZE_MB: 5,
  MAX_COMMENT_LENGTH: 1000,
  MAX_EVENT_DESCRIPTION_LENGTH: 2000,
  
  // Cache TTL (Time To Live) in milliseconds
  CACHE_TTL: {
    EVENTS: 5 * 60 * 1000, // 5 minutes
    USERS: 10 * 60 * 1000, // 10 minutes
    NOTIFICATIONS: 2 * 60 * 1000, // 2 minutes
  },
  
  // Retry Configuration
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  
  // Image Configuration
  IMAGE_QUALITY: 0.8,
  PROFILE_PICTURE_SIZE: { width: 200, height: 200 },
  EVENT_HEADER_SIZE: { width: 800, height: 400 },
  BOOK_COVER_SIZE: { width: 400, height: 600 },
  
  // Notification Configuration
  NOTIFICATION_BATCH_SIZE: 100,
  
  // Performance Monitoring
  SLOW_QUERY_THRESHOLD: 2000, // 2 seconds
  
  // Feature Flags
  FEATURES: {
    PUSH_NOTIFICATIONS: true,
    IMAGE_COMPRESSION: true,
    OFFLINE_SUPPORT: false, // Future feature
    ANALYTICS: true,
  },
} as const;

// Firebase Collection Names
export const COLLECTIONS = {
  USERS: 'users',
  EVENTS: 'events',
  RSVPS: 'rsvps',
  COMMENTS: 'comments',
  NOTIFICATIONS: 'notifications',
  MONTHLY_BOOKS: 'monthlyBooks',
} as const;

// Storage Paths
export const STORAGE_PATHS = {
  PROFILE_PICTURES: 'profile-pictures',
  EVENT_HEADERS: 'event-headers',
  MONTHLY_BOOKS: 'monthlyBooks',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  PERMISSION_DENIED: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested item was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  IMAGE_TOO_LARGE: `Image size must be less than ${APP_CONFIG.MAX_IMAGE_SIZE_MB}MB.`,
  COMMENT_TOO_LONG: `Comment must be less than ${APP_CONFIG.MAX_COMMENT_LENGTH} characters.`,
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  EVENT_CREATED: 'Event created successfully!',
  EVENT_UPDATED: 'Event updated successfully!',
  EVENT_DELETED: 'Event deleted successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  COMMENT_POSTED: 'Comment posted successfully!',
  RSVP_UPDATED: 'RSVP updated successfully!',
  BOOK_UPDATED: 'Monthly book updated successfully!',
} as const;

// Environment Configuration
export const ENV = {
  IS_DEV: __DEV__,
  IS_PROD: !__DEV__,
} as const; 