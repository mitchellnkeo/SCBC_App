import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopNavbar from '../../components/navigation/TopNavbar';
import { useSettingsStore } from '../../stores/settingsStore';
import { useTheme } from '../../contexts/ThemeContext';
import { AppSettings } from '../../types/settings';

const SettingsScreen: React.FC = () => {
  const { settings, isLoading, error, loadSettings, updateSetting, resetSettings, clearError } = useSettingsStore();
  const { theme } = useTheme();

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      clearError();
    }
  }, [error]);

  const handleThemeChange = (themeValue: AppSettings['theme']) => {
    updateSetting('theme', themeValue);
  };

  const handleFontSizeChange = (fontSize: AppSettings['fontSize']) => {
    updateSetting('fontSize', fontSize);
  };

  const handlePrivacyChange = (privacy: AppSettings['profilePrivacy']) => {
    updateSetting('profilePrivacy', privacy);
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: resetSettings },
      ]
    );
  };

  const SettingSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
      {children}
    </View>
  );

  const OptionButton: React.FC<{
    label: string;
    isSelected: boolean;
    onPress: () => void;
    description?: string;
  }> = ({ label, isSelected, onPress, description }) => (
    <TouchableOpacity
      style={[
        styles.optionButton,
        { backgroundColor: theme.card, borderColor: isSelected ? theme.primary : 'transparent' },
        isSelected && { backgroundColor: theme.primaryLight }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.optionContent}>
        <Text style={[styles.optionLabel, { color: isSelected ? theme.primary : theme.text }]}>{label}</Text>
        {description && (
          <Text style={[styles.optionDescription, { color: isSelected ? theme.primary : theme.textTertiary }]}>
            {description}
          </Text>
        )}
      </View>
      {isSelected && <Text style={[styles.checkmark, { color: theme.primary }]}>✓</Text>}
    </TouchableOpacity>
  );

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 24,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.textTertiary,
      textAlign: 'center',
    },
    footer: {
      marginHorizontal: 20,
      marginBottom: 32,
      padding: 16,
      backgroundColor: theme.card,
      borderRadius: 12,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    footerText: {
      fontSize: 14,
      color: theme.textTertiary,
      textAlign: 'center',
      lineHeight: 20,
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <TopNavbar />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={dynamicStyles.header}>
          <Text style={styles.emoji}>⚙️</Text>
          <Text style={dynamicStyles.title}>Settings</Text>
          <Text style={dynamicStyles.subtitle}>Customize your SCBC experience</Text>
        </View>

        {/* Theme Settings */}
        <SettingSection title="Appearance">
          <OptionButton
            label="Light Mode"
            description="Bright and clean interface"
            isSelected={settings.theme === 'light'}
            onPress={() => handleThemeChange('light')}
          />
          <OptionButton
            label="Dark Mode"
            description="Easy on the eyes for reading"
            isSelected={settings.theme === 'dark'}
            onPress={() => handleThemeChange('dark')}
          />
          <OptionButton
            label="System Default"
            description="Follow your device settings"
            isSelected={settings.theme === 'system'}
            onPress={() => handleThemeChange('system')}
          />
        </SettingSection>

        {/* Font Size Settings */}
        <SettingSection title="Text Size">
          <OptionButton
            label="Small"
            description="Compact text for more content"
            isSelected={settings.fontSize === 'small'}
            onPress={() => handleFontSizeChange('small')}
          />
          <OptionButton
            label="Medium"
            description="Standard text size"
            isSelected={settings.fontSize === 'medium'}
            onPress={() => handleFontSizeChange('medium')}
          />
          <OptionButton
            label="Large"
            description="Larger text for better readability"
            isSelected={settings.fontSize === 'large'}
            onPress={() => handleFontSizeChange('large')}
          />
        </SettingSection>

        {/* Privacy Settings */}
        <SettingSection title="Profile Privacy">
          <OptionButton
            label="Public"
            description="All members can see your full profile"
            isSelected={settings.profilePrivacy === 'public'}
            onPress={() => handlePrivacyChange('public')}
          />
          <OptionButton
            label="Private"
            description="Only you can see your full profile details"
            isSelected={settings.profilePrivacy === 'private'}
            onPress={() => handlePrivacyChange('private')}
          />
        </SettingSection>

        {/* Reset Settings */}
        <View style={styles.resetSection}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetSettings}
            activeOpacity={0.7}
          >
            <Text style={styles.resetButtonText}>Reset to Defaults</Text>
          </TouchableOpacity>
        </View>

        {/* Info Footer */}
        <View style={dynamicStyles.footer}>
          <Text style={dynamicStyles.footerText}>
            Settings are automatically saved and will be applied immediately.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  optionButton: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
  },
  checkmark: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  resetSection: {
    marginHorizontal: 20,
    marginBottom: 32,
  },
  resetButton: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SettingsScreen; 