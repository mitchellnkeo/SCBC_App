import { Alert } from 'react-native';
import { 
  AppError, 
  ErrorType, 
  ErrorSeverity, 
  ErrorHandlerOptions, 
  FIREBASE_ERROR_MAPPINGS,
  ERROR_MESSAGES 
} from '../types/errors';

class ErrorHandler {
  private static instance: ErrorHandler;
  private retryAttempts: Map<string, number> = new Map();

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Parse any error into a standardized AppError
   */
  parseError(error: any, context?: string): AppError {
    const timestamp = new Date();
    
    // Check if it's already an AppError
    if (this.isAppError(error)) {
      return error;
    }

    // Handle Firebase errors
    if (this.isFirebaseError(error)) {
      return this.parseFirebaseError(error, timestamp, context);
    }

    // Handle network errors
    if (this.isNetworkError(error)) {
      return this.createNetworkError(error, timestamp, context);
    }

    // Handle validation errors
    if (this.isValidationError(error)) {
      return this.createValidationError(error, timestamp, context);
    }

    // Default unknown error
    return this.createUnknownError(error, timestamp, context);
  }

  /**
   * Handle error with options for display, logging, and retry
   */
  async handleError(
    error: any, 
    options: ErrorHandlerOptions = {},
    retryFunction?: () => Promise<any>
  ): Promise<void> {
    const {
      showAlert = true,
      logError = true,
      autoRetry = false,
      maxRetries = 3,
      fallbackAction
    } = options;

    const appError = this.parseError(error);

    // Log error if enabled
    if (logError) {
      this.logError(appError);
    }

    // Handle auto-retry for retryable errors
    if (autoRetry && appError.retryable && retryFunction) {
      const success = await this.attemptRetry(
        retryFunction, 
        appError, 
        maxRetries
      );
      if (success) return; // Success, no need to show error
    }

    // Show alert if enabled
    if (showAlert) {
      this.showErrorAlert(appError, retryFunction);
    }

    // Execute fallback action if provided
    if (fallbackAction) {
      fallbackAction();
    }
  }

  /**
   * Show user-friendly error alert with appropriate actions
   */
  private showErrorAlert(appError: AppError, retryFunction?: () => Promise<any>): void {
    const title = this.getErrorTitle(appError);
    const message = appError.userMessage;

    // Different alert types based on error severity and actions
    if (appError.retryable && retryFunction) {
      Alert.alert(
        title,
        message,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Retry',
            onPress: async () => {
              try {
                await retryFunction();
              } catch (error) {
                // If retry fails, handle recursively but without auto-retry
                this.handleError(error, { autoRetry: false });
              }
            },
          },
        ]
      );
    } else if (appError.action === 'CONTACT_SUPPORT') {
      Alert.alert(
        title,
        message,
        [
          { text: 'OK', style: 'default' },
          {
            text: 'Contact Support',
            onPress: () => {
              // TODO: Implement contact support functionality
              Alert.alert('Support', 'Please email support@scbc.app for assistance.');
            },
          },
        ]
      );
    } else {
      Alert.alert(title, message, [{ text: 'OK', style: 'default' }]);
    }
  }

  /**
   * Attempt to retry a failed operation
   */
  private async attemptRetry(
    retryFunction: () => Promise<any>,
    appError: AppError,
    maxRetries: number
  ): Promise<boolean> {
    const key = this.getRetryKey(appError);
    const currentAttempts = this.retryAttempts.get(key) || 0;

    if (currentAttempts >= maxRetries) {
      this.retryAttempts.delete(key);
      return false;
    }

    try {
      // Exponential backoff: wait 1s, 2s, 4s, etc.
      const delay = Math.pow(2, currentAttempts) * 1000;
      await this.sleep(delay);

      this.retryAttempts.set(key, currentAttempts + 1);
      await retryFunction();
      
      // Success - clear retry counter
      this.retryAttempts.delete(key);
      return true;
    } catch (error) {
      // Retry failed, will try again or give up
      return false;
    }
  }

  /**
   * Create error from Firebase error
   */
  private parseFirebaseError(error: any, timestamp: Date, context?: string): AppError {
    const code = error.code || error.message;
    const mapping = FIREBASE_ERROR_MAPPINGS[code];

    if (mapping) {
      return {
        type: mapping.type!,
        severity: mapping.severity!,
        message: error.message || 'Firebase error',
        userMessage: mapping.userMessage!,
        code,
        details: { context, originalError: error },
        timestamp,
        retryable: mapping.retryable!,
        action: mapping.action,
      };
    }

    // Unknown Firebase error
    return this.createUnknownError(error, timestamp, context);
  }

  /**
   * Create network error
   */
  private createNetworkError(error: any, timestamp: Date, context?: string): AppError {
    return {
      type: ErrorType.NETWORK,
      severity: ErrorSeverity.MEDIUM,
      message: error.message || 'Network error',
      userMessage: ERROR_MESSAGES.NETWORK,
      details: { context, originalError: error },
      timestamp,
      retryable: true,
      action: 'RETRY',
    };
  }

  /**
   * Create validation error
   */
  private createValidationError(error: any, timestamp: Date, context?: string): AppError {
    return {
      type: ErrorType.VALIDATION,
      severity: ErrorSeverity.MEDIUM,
      message: error.message || 'Validation error',
      userMessage: error.message || ERROR_MESSAGES.VALIDATION,
      details: { context, originalError: error },
      timestamp,
      retryable: true,
    };
  }

  /**
   * Create unknown error
   */
  private createUnknownError(error: any, timestamp: Date, context?: string): AppError {
    return {
      type: ErrorType.UNKNOWN,
      severity: ErrorSeverity.MEDIUM,
      message: error.message || 'Unknown error',
      userMessage: ERROR_MESSAGES.GENERIC,
      details: { context, originalError: error },
      timestamp,
      retryable: false,
    };
  }

  /**
   * Type checking helpers
   */
  private isAppError(error: any): error is AppError {
    return error && typeof error === 'object' && 'type' in error && 'severity' in error;
  }

  private isFirebaseError(error: any): boolean {
    return error && (error.code?.startsWith('auth/') || 
                     error.code?.startsWith('storage/') ||
                     typeof error.code === 'string');
  }

  private isNetworkError(error: any): boolean {
    return error && (
      error.message?.includes('network') ||
      error.message?.includes('Failed to fetch') ||
      error.message?.includes('timeout') ||
      error.code === 'NETWORK_ERROR'
    );
  }

  private isValidationError(error: any): boolean {
    return error && (
      error.name === 'ValidationError' ||
      error.message?.includes('validation') ||
      error.message?.includes('required') ||
      error.message?.includes('invalid')
    );
  }

  /**
   * Helper methods
   */
  private getErrorTitle(appError: AppError): string {
    switch (appError.type) {
      case ErrorType.AUTHENTICATION:
        return 'Authentication Error';
      case ErrorType.AUTHORIZATION:
        return 'Permission Denied';
      case ErrorType.NETWORK:
        return 'Connection Error';
      case ErrorType.VALIDATION:
        return 'Invalid Input';
      case ErrorType.STORAGE:
        return 'Upload Error';
      case ErrorType.RATE_LIMIT:
        return 'Too Many Requests';
      default:
        return 'Error';
    }
  }

  private getRetryKey(appError: AppError): string {
    return `${appError.type}-${appError.message}`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private logError(appError: AppError): void {
    console.group(`🚨 ${appError.severity} ERROR - ${appError.type}`);
    console.error('Message:', appError.message);
    console.error('User Message:', appError.userMessage);
    console.error('Code:', appError.code);
    console.error('Retryable:', appError.retryable);
    console.error('Timestamp:', appError.timestamp.toISOString());
    if (appError.details) {
      console.error('Details:', appError.details);
    }
    console.groupEnd();
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Convenience function for quick error handling
export const handleError = (
  error: any, 
  options?: ErrorHandlerOptions,
  retryFunction?: () => Promise<any>
) => {
  return errorHandler.handleError(error, options, retryFunction);
}; 