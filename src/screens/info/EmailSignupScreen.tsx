import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../../components/common/Button';

const EmailSignupScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();

  const MAILERLITE_SIGNUP_URL = 'https://dashboard.mailerlite.com/forms/1477255/152598423347922626/share';

  const handleSignupPress = async () => {
    try {
      const canOpen = await Linking.canOpenURL(MAILERLITE_SIGNUP_URL);
      if (canOpen) {
        await Linking.openURL(MAILERLITE_SIGNUP_URL);
      } else {
        Alert.alert(
          'Unable to Open Link',
          'We couldn\'t open the signup form. Please try again later.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Something went wrong. Please try again later.',
        [{ text: 'OK' }]
      );
    }
  };

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>E-Mail Signup</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>📧</Text>
        </View>
        
        <Text style={styles.heading}>Stay Connected</Text>
        
        <Text style={styles.description}>
          Join our mailing list to receive updates about upcoming book club events, 
          reading recommendations, and community news from the Seattle Chinatown Book Club.
        </Text>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>📚</Text>
            <Text style={styles.featureText}>Event announcements</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>💌</Text>
            <Text style={styles.featureText}>Monthly newsletters</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🎯</Text>
            <Text style={styles.featureText}>Book recommendations</Text>
          </View>
        </View>

        <Button
          title="Sign Up for Updates"
          onPress={handleSignupPress}
          style={styles.signupButton}
          textStyle={styles.signupButtonText}
        />

        <Text style={styles.disclaimer}>
          We respect your privacy. You can unsubscribe at any time.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: theme.text,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  icon: {
    fontSize: 64,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  features: {
    width: '100%',
    marginBottom: 40,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    color: theme.text,
    fontWeight: '500',
  },
  signupButton: {
    width: '100%',
    backgroundColor: theme.primary,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  signupButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  disclaimer: {
    fontSize: 12,
    color: theme.textTertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default EmailSignupScreen; 