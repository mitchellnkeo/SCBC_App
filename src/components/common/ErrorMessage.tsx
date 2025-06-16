import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AppError, ErrorType } from '../../types/errors';

interface ErrorMessageProps {
  error: AppError | string;
  onRetry?: () => void;
  onDismiss?: () => void;
  style?: any;
  compact?: boolean;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  onRetry,
  onDismiss,
  style,
  compact = false,
}) => {
  // Handle both AppError objects and string messages
  const appError = typeof error === 'string' 
    ? { userMessage: error, retryable: false, type: 'UNKNOWN' as ErrorType }
    : error;

  const getErrorIcon = (type: ErrorType): string => {
    switch (type) {
      case ErrorType.NETWORK:
        return '📡';
      case ErrorType.AUTHENTICATION:
        return '🔐';
      case ErrorType.AUTHORIZATION:
        return '🚫';
      case ErrorType.VALIDATION:
        return '⚠️';
      case ErrorType.STORAGE:
        return '💾';
      case ErrorType.RATE_LIMIT:
        return '⏱️';
      default:
        return '😞';
    }
  };

  const getErrorColor = (type: ErrorType): string => {
    switch (type) {
      case ErrorType.NETWORK:
        return '#3b82f6'; // blue
      case ErrorType.AUTHENTICATION:
      case ErrorType.AUTHORIZATION:
        return '#ef4444'; // red
      case ErrorType.VALIDATION:
        return '#f59e0b'; // amber
      case ErrorType.STORAGE:
        return '#8b5cf6'; // purple
      case ErrorType.RATE_LIMIT:
        return '#f59e0b'; // amber
      default:
        return '#6b7280'; // gray
    }
  };

  if (compact) {
    return (
      <View style={[styles.compactContainer, style]}>
        <View style={styles.compactContent}>
          <Text style={styles.compactIcon}>
            {getErrorIcon(appError.type)}
          </Text>
          <Text style={styles.compactMessage}>
            {appError.userMessage}
          </Text>
        </View>
        
        <View style={styles.compactActions}>
          {onRetry && appError.retryable && (
            <TouchableOpacity
              style={styles.compactButton}
              onPress={onRetry}
            >
              <Text style={styles.compactButtonText}>Retry</Text>
            </TouchableOpacity>
          )}
          
          {onDismiss && (
            <TouchableOpacity
              style={styles.compactDismiss}
              onPress={onDismiss}
            >
              <Text style={styles.compactDismissText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.content}>
        <Text style={styles.icon}>
          {getErrorIcon(appError.type)}
        </Text>
        
        <View style={styles.messageContainer}>
          <Text style={styles.message}>
            {appError.userMessage}
          </Text>
        </View>
      </View>
      
      <View style={styles.actions}>
        {onRetry && appError.retryable && (
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: getErrorColor(appError.type) }
            ]}
            onPress={onRetry}
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        )}
        
        {onDismiss && (
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={onDismiss}
          >
            <Text style={styles.dismissButtonText}>Dismiss</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fef2f2',
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  messageContainer: {
    flex: 1,
  },
  message: {
    fontSize: 16,
    color: '#7f1d1d',
    lineHeight: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#ef4444',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  dismissButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  dismissButtonText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Compact styles
  compactContainer: {
    backgroundColor: '#fef2f2',
    borderRadius: 6,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  compactIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  compactMessage: {
    fontSize: 14,
    color: '#7f1d1d',
    flex: 1,
  },
  compactActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compactButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  compactButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  compactDismiss: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactDismissText: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default ErrorMessage; 