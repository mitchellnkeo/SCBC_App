import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Theme } from '../contexts/ThemeContext';

/**
 * Common style patterns used throughout the app
 * Consolidates duplicate styling for consistency and maintainability
 */

export const createCommonStyles = (theme: Theme) => StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: theme.background,
  } as ViewStyle,

  scrollContainer: {
    flex: 1,
    backgroundColor: theme.background,
  } as ViewStyle,

  scrollContent: {
    padding: 16,
  } as ViewStyle,

  // Card styles
  card: {
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: theme.border,
  } as ViewStyle,

  cardLarge: {
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: theme.border,
  } as ViewStyle,

  // Loading states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  } as ViewStyle,

  loadingText: {
    fontSize: 16,
    color: theme.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  } as TextStyle,

  // Empty states
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  } as ViewStyle,

  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  } as TextStyle,

  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 8,
    textAlign: 'center',
  } as TextStyle,

  emptySubtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  } as TextStyle,

  // Header styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  } as ViewStyle,

  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
  } as TextStyle,

  // Form styles
  inputContainer: {
    marginBottom: 16,
  } as ViewStyle,

  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
  } as TextStyle,

  textInput: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: theme.text,
  } as ViewStyle,

  textInputError: {
    borderColor: theme.error,
  } as ViewStyle,

  errorText: {
    color: theme.error,
    fontSize: 14,
    marginTop: 4,
  } as TextStyle,

  // Section styles
  section: {
    marginBottom: 24,
  } as ViewStyle,

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 16,
  } as TextStyle,

  // Info/highlight styles
  infoCard: {
    backgroundColor: theme.primaryLight + '20',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: theme.primary,
    marginBottom: 16,
  } as ViewStyle,

  infoText: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
  } as TextStyle,

  // Toggle/Tab styles
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: theme.background,
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: theme.border,
  } as ViewStyle,

  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    minWidth: 50,
  } as ViewStyle,

  toggleButtonActive: {
    backgroundColor: theme.primary,
  } as ViewStyle,

  toggleText: {
    fontSize: 14,
    color: theme.textSecondary,
    fontWeight: '500',
  } as TextStyle,

  toggleTextActive: {
    color: 'white',
    fontWeight: '600',
  } as TextStyle,

  // Badge styles
  badge: {
    backgroundColor: theme.error,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  } as ViewStyle,

  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  } as TextStyle,

  // Button row styles
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  } as ViewStyle,

  // Spacer
  bottomSpacer: {
    height: 32,
  } as ViewStyle,

  // Status styles
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  } as ViewStyle,

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  } as ViewStyle,

  statusText: {
    fontSize: 14,
    fontWeight: '600',
  } as TextStyle,
});

// Status color helpers
export const getStatusColor = (theme: Theme, status: string): string => {
  switch (status.toLowerCase()) {
    case 'approved':
    case 'success':
    case 'active':
      return theme.success;
    case 'pending':
    case 'warning':
      return theme.warning;
    case 'rejected':
    case 'error':
    case 'inactive':
      return theme.error;
    default:
      return theme.textSecondary;
  }
};

// Shadow styles helper
export const createShadowStyle = (theme: Theme, elevation: 'small' | 'medium' | 'large' = 'medium') => {
  const shadows = {
    small: {
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    medium: {
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    large: {
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
  };

  return shadows[elevation];
}; 