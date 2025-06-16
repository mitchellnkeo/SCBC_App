// Error Types and Categories
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  PERMISSION = 'PERMISSION',
  STORAGE = 'STORAGE',
  UNKNOWN = 'UNKNOWN',
  OFFLINE = 'OFFLINE',
  RATE_LIMIT = 'RATE_LIMIT',
  SERVER = 'SERVER',
}

export enum ErrorSeverity {
  LOW = 'LOW',       // Non-critical, user can continue
  MEDIUM = 'MEDIUM', // Important but not blocking
  HIGH = 'HIGH',     // Blocks current action
  CRITICAL = 'CRITICAL', // App-breaking
}

export interface AppError {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  userMessage: string; // User-friendly message
  code?: string;
  details?: any;
  timestamp: Date;
  retryable: boolean;
  action?: 'RETRY' | 'RELOAD' | 'LOGIN' | 'CONTACT_SUPPORT';
}

export interface ErrorHandlerOptions {
  showAlert?: boolean;
  logError?: boolean;
  autoRetry?: boolean;
  maxRetries?: number;
  fallbackAction?: () => void;
}

// Firebase Error Code Mappings
export const FIREBASE_ERROR_MAPPINGS: Record<string, Partial<AppError>> = {
  // Auth Errors
  'auth/user-not-found': {
    type: ErrorType.AUTHENTICATION,
    severity: ErrorSeverity.MEDIUM,
    userMessage: 'No account found with this email address.',
    retryable: false,
  },
  'auth/wrong-password': {
    type: ErrorType.AUTHENTICATION,
    severity: ErrorSeverity.MEDIUM,
    userMessage: 'Incorrect password. Please try again.',
    retryable: true,
  },
  'auth/invalid-email': {
    type: ErrorType.VALIDATION,
    severity: ErrorSeverity.MEDIUM,
    userMessage: 'Please enter a valid email address.',
    retryable: true,
  },
  'auth/weak-password': {
    type: ErrorType.VALIDATION,
    severity: ErrorSeverity.MEDIUM,
    userMessage: 'Password must be at least 6 characters long.',
    retryable: true,
  },
  'auth/email-already-in-use': {
    type: ErrorType.VALIDATION,
    severity: ErrorSeverity.MEDIUM,
    userMessage: 'An account with this email already exists.',
    retryable: false,
  },
  'auth/network-request-failed': {
    type: ErrorType.NETWORK,
    severity: ErrorSeverity.MEDIUM,
    userMessage: 'Network connection failed. Please check your internet and try again.',
    retryable: true,
    action: 'RETRY',
  },

  // Firestore Errors
  'permission-denied': {
    type: ErrorType.AUTHORIZATION,
    severity: ErrorSeverity.HIGH,
    userMessage: 'You don\'t have permission to perform this action.',
    retryable: false,
  },
  'unavailable': {
    type: ErrorType.NETWORK,
    severity: ErrorSeverity.MEDIUM,
    userMessage: 'Service temporarily unavailable. Please try again in a moment.',
    retryable: true,
    action: 'RETRY',
  },
  'deadline-exceeded': {
    type: ErrorType.NETWORK,
    severity: ErrorSeverity.MEDIUM,
    userMessage: 'Request timed out. Please try again.',
    retryable: true,
    action: 'RETRY',
  },

  // Storage Errors
  'storage/unauthorized': {
    type: ErrorType.AUTHORIZATION,
    severity: ErrorSeverity.HIGH,
    userMessage: 'You don\'t have permission to upload files.',
    retryable: false,
  },
  'storage/quota-exceeded': {
    type: ErrorType.STORAGE,
    severity: ErrorSeverity.HIGH,
    userMessage: 'Storage quota exceeded. Please contact support.',
    retryable: false,
    action: 'CONTACT_SUPPORT',
  },
  'storage/unknown': {
    type: ErrorType.STORAGE,
    severity: ErrorSeverity.MEDIUM,
    userMessage: 'File upload failed. Please try again.',
    retryable: true,
    action: 'RETRY',
  },

  // Network Errors
  'Failed to fetch': {
    type: ErrorType.NETWORK,
    severity: ErrorSeverity.MEDIUM,
    userMessage: 'No internet connection. Please check your network and try again.',
    retryable: true,
    action: 'RETRY',
  },
};

// Common Error Messages
export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  NETWORK: 'Network connection failed. Please check your internet.',
  OFFLINE: 'You\'re currently offline. Some features may not be available.',
  PERMISSION: 'Permission required to access this feature.',
  VALIDATION: 'Please check your input and try again.',
  RATE_LIMIT: 'Too many requests. Please wait a moment and try again.',
  SERVER: 'Server error. Please try again later.',
} as const; 