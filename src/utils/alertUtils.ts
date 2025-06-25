import { Alert } from 'react-native';

/**
 * Common alert patterns used throughout the app
 * Consolidates duplicate Alert.alert calls for consistent UX
 */

export interface ConfirmationOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
}

/**
 * Show a confirmation dialog with consistent styling
 */
export const showConfirmation = (
  options: ConfirmationOptions,
  onConfirm: () => void,
  onCancel?: () => void
): void => {
  const {
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    destructive = false,
  } = options;

  Alert.alert(
    title,
    message,
    [
      { 
        text: cancelText, 
        style: 'cancel',
        onPress: onCancel,
      },
      {
        text: confirmText,
        style: destructive ? 'destructive' : 'default',
        onPress: onConfirm,
      },
    ]
  );
};

/**
 * Show delete confirmation dialog
 */
export const showDeleteConfirmation = (
  itemName: string,
  onConfirm: () => void,
  additionalMessage?: string
): void => {
  const message = additionalMessage 
    ? `Are you sure you want to delete this ${itemName}? ${additionalMessage} This action cannot be undone.`
    : `Are you sure you want to delete this ${itemName}? This action cannot be undone.`;

  showConfirmation(
    {
      title: `Delete ${itemName}`,
      message,
      confirmText: 'Delete',
      destructive: true,
    },
    onConfirm
  );
};

/**
 * Show success message
 */
export const showSuccess = (title: string, message?: string): void => {
  Alert.alert(title, message, [{ text: 'OK', style: 'default' }]);
};

/**
 * Show error message
 */
export const showError = (title: string = 'Error', message: string): void => {
  Alert.alert(title, message, [{ text: 'OK', style: 'default' }]);
};

/**
 * Show network error with retry option
 */
export const showNetworkError = (
  onRetry?: () => void,
  message: string = 'Network error. Please check your connection and try again.'
): void => {
  if (onRetry) {
    Alert.alert(
      'Network Error',
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Retry', onPress: onRetry },
      ]
    );
  } else {
    showError('Network Error', message);
  }
};

/**
 * Show feature coming soon alert
 */
export const showComingSoon = (featureName: string = 'feature'): void => {
  Alert.alert('Coming Soon', `${featureName} coming soon!`, [{ text: 'OK', style: 'default' }]);
};

/**
 * Show link/external action options
 */
export const showLinkOptions = (
  url: string,
  options: Array<{
    title: string;
    action: () => void;
  }>,
  title: string = 'Choose Action'
): void => {
  const alertOptions = [
    ...options.map(option => ({
      text: option.title,
      onPress: option.action,
    })),
    { text: 'Cancel', style: 'cancel' as const },
  ];

  Alert.alert(title, undefined, alertOptions);
};

/**
 * Show Zoom meeting options (specific to the SCBC app)
 */
export const showZoomOptions = (
  zoomLink: string,
  onEmail: () => void,
  onPhone: () => void,
  onCopy: () => void
): void => {
  showLinkOptions(
    zoomLink,
    [
      { title: 'Email Link to Myself', action: onEmail },
      { title: 'Join from Phone', action: onPhone },
      { title: 'Copy Link', action: onCopy },
    ],
    'Join Virtual Meeting'
  );
};

/**
 * Show past validation error
 */
export const showPastTimeError = (): void => {
  showError('Invalid Time', 'You cannot schedule events in the past. Please select a future date and time.');
};

/**
 * Show generic save error
 */
export const showSaveError = (itemName: string = 'item'): void => {
  showError('Save Failed', `Unable to save ${itemName}. Please try again.`);
}; 