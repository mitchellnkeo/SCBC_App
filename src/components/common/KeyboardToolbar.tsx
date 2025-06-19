import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  InputAccessoryView,
  Platform,
  Keyboard,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface KeyboardToolbarProps {
  nativeID: string;
  onDone?: () => void;
  doneText?: string;
  showDone?: boolean;
}

const KeyboardToolbar: React.FC<KeyboardToolbarProps> = ({
  nativeID,
  onDone,
  doneText = 'Done',
  showDone = true,
}) => {
  const { theme } = useTheme();

  const handleDone = () => {
    Keyboard.dismiss();
    onDone?.();
  };

  if (Platform.OS !== 'ios') {
    return null;
  }

  return (
    <InputAccessoryView nativeID={nativeID}>
      <View style={[styles.toolbar, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
        <View style={styles.spacer} />
        {showDone && (
          <TouchableOpacity
            style={[styles.doneButton, { backgroundColor: theme.primary }]}
            onPress={handleDone}
            activeOpacity={0.7}
          >
            <Text style={[styles.doneButtonText, { color: '#ffffff' }]}>
              {doneText}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </InputAccessoryView>
  );
};

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    minHeight: 44,
  },
  spacer: {
    flex: 1,
  },
  doneButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default KeyboardToolbar; 