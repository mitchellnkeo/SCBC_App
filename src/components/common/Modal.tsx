import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export interface BaseModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  backgroundDismiss?: boolean;
}

// Center Modal (Dialog-style)
export interface CenterModalProps extends BaseModalProps {
  maxWidth?: number;
  padding?: number;
}

export const CenterModal: React.FC<CenterModalProps> = ({
  visible,
  onClose,
  children,
  backgroundDismiss = true,
  maxWidth = 400,
  padding = 24,
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: theme.overlay,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    content: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding,
      width: '100%',
      maxWidth,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 8,
    },
  });

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={backgroundDismiss ? onClose : undefined}
      >
        <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
          <View style={styles.content}>
            {children}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </RNModal>
  );
};

// Bottom Sheet Modal
export interface BottomSheetModalProps extends BaseModalProps {
  maxHeight?: number;
  keyboardAvoiding?: boolean;
}

export const BottomSheetModal: React.FC<BottomSheetModalProps> = ({
  visible,
  onClose,
  children,
  backgroundDismiss = true,
  maxHeight = screenHeight * 0.9,
  keyboardAvoiding = true,
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: theme.overlay,
      justifyContent: 'flex-end',
    },
    content: {
      backgroundColor: theme.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
      maxHeight,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 10,
    },
  });

  const content = (
    <TouchableOpacity
      style={styles.overlay}
      activeOpacity={1}
      onPress={backgroundDismiss ? onClose : undefined}
    >
      <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
        <View style={styles.content}>
          {children}
        </View>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </RNModal>
  );
};

// Full Screen Modal
export interface FullScreenModalProps extends BaseModalProps {
  headerComponent?: React.ReactNode;
}

export const FullScreenModal: React.FC<FullScreenModalProps> = ({
  visible,
  onClose,
  children,
  headerComponent,
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    content: {
      flex: 1,
    },
  });

  return (
    <RNModal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {headerComponent && (
          <View style={styles.header}>
            {headerComponent}
          </View>
        )}
        <View style={styles.content}>
          {children}
        </View>
      </View>
    </RNModal>
  );
};

// Action Sheet Modal (for options/actions)
export interface ActionSheetOption {
  title: string;
  onPress: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

export interface ActionSheetModalProps extends BaseModalProps {
  title?: string;
  message?: string;
  options: ActionSheetOption[];
  cancelText?: string;
}

export const ActionSheetModal: React.FC<ActionSheetModalProps> = ({
  visible,
  onClose,
  title,
  message,
  options,
  cancelText = 'Cancel',
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: theme.overlay,
      justifyContent: 'flex-end',
    },
    container: {
      backgroundColor: theme.surface,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingBottom: 20,
    },
    header: {
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      textAlign: 'center',
      marginBottom: message ? 8 : 0,
    },
    message: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
    option: {
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    optionText: {
      fontSize: 16,
      color: theme.text,
      textAlign: 'center',
    },
    destructiveText: {
      color: theme.error,
    },
    disabledText: {
      color: theme.textTertiary,
    },
    cancelOption: {
      marginTop: 8,
      backgroundColor: theme.background,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    cancelText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.textSecondary,
      textAlign: 'center',
    },
  });

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
          <View style={styles.container}>
            {(title || message) && (
              <View style={styles.header}>
                {title && <Text style={styles.title}>{title}</Text>}
                {message && <Text style={styles.message}>{message}</Text>}
              </View>
            )}
            
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.option}
                onPress={() => {
                  option.onPress();
                  onClose();
                }}
                disabled={option.disabled}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.optionText,
                    option.destructive && styles.destructiveText,
                    option.disabled && styles.disabledText,
                  ]}
                >
                  {option.title}
                </Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={[styles.option, styles.cancelOption]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>{cancelText}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </RNModal>
  );
};

// Quick helper functions for common modal patterns
export const showActionSheet = (props: Omit<ActionSheetModalProps, 'visible' | 'onClose'>) => {
  // This would need to be implemented with a modal provider/context
  // For now, it's a placeholder for the interface
  console.warn('showActionSheet requires a modal provider to be implemented');
};

export default {
  CenterModal,
  BottomSheetModal,
  FullScreenModal,
  ActionSheetModal,
}; 