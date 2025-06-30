import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Keyboard,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useForm, Controller } from 'react-hook-form';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import {
  sendPasswordReset,
  checkEmailExists,
  findUserByDisplayName,
  searchUsersByDisplayName,
} from '../../services/authService';
import { handleError } from '../../utils/errorHandler';
import { Button } from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Form } from '../../components/common/Form';

type AccountRecoveryScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'AccountRecovery'>;

interface PasswordResetForm {
  email: string;
}

interface UsernameRecoveryForm {
  displayName: string;
}

interface UserMatch {
  displayName: string;
  email: string;
}

const AccountRecoveryScreen: React.FC = () => {
  const navigation = useNavigation<AccountRecoveryScreenNavigationProp>();
  const [activeTab, setActiveTab] = useState<'password' | 'username'>('password');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordResetSent, setPasswordResetSent] = useState(false);
  const [userMatches, setUserMatches] = useState<UserMatch[]>([]);
  const [searchPerformed, setSearchPerformed] = useState(false);

  // Form controls
  const {
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
  } = useForm<PasswordResetForm>();

  const {
    control: usernameControl,
    handleSubmit: handleUsernameSubmit,
    formState: { errors: usernameErrors },
    watch: watchUsername,
    reset: resetUsernameForm,
  } = useForm<UsernameRecoveryForm>();

  // Refs
  const emailRef = useRef<TextInput>(null);
  const displayNameRef = useRef<TextInput>(null);

  const handlePasswordReset = async (data: PasswordResetForm) => {
    try {
      setIsLoading(true);

      // First check if email exists
      const emailExists = await checkEmailExists(data.email);
      if (!emailExists) {
        Alert.alert(
          'Email Not Found',
          'No account found with this email address. Please check your email or register for a new account.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Send password reset email
      await sendPasswordReset(data.email);
      setPasswordResetSent(true);

      Alert.alert(
        'Password Reset Email Sent',
        `A password reset link has been sent to ${data.email}. Please check your email and follow the instructions to reset your password.`,
        [
          {
            text: 'OK',
            onPress: () => {
              resetPasswordForm();
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error: any) {
      await handleError(error, {
        showAlert: true,
        logError: true,
        autoRetry: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUsernameRecovery = async (data: UsernameRecoveryForm) => {
    try {
      setIsLoading(true);
      setSearchPerformed(true);

      // Search for exact match first
      const exactMatches = await findUserByDisplayName(data.displayName);
      
      if (exactMatches.length > 0) {
        const matchesWithNames = exactMatches.map(email => ({
          displayName: data.displayName,
          email,
        }));
        setUserMatches(matchesWithNames);
      } else {
        // If no exact match, search for partial matches
        const partialMatches = await searchUsersByDisplayName(data.displayName);
        setUserMatches(partialMatches);
      }
    } catch (error: any) {
      await handleError(error, {
        showAlert: true,
        logError: true,
        autoRetry: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendPasswordResetToFoundEmail = async (email: string) => {
    try {
      setIsLoading(true);
      await sendPasswordReset(email);

      Alert.alert(
        'Password Reset Email Sent',
        `A password reset link has been sent to ${email}. Please check your email and follow the instructions.`,
        [
          {
            text: 'OK',
            onPress: () => {
              resetUsernameForm();
              setUserMatches([]);
              setSearchPerformed(false);
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error: any) {
      await handleError(error, {
        showAlert: true,
        logError: true,
        autoRetry: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderUserMatch = ({ item }: { item: UserMatch }) => (
    <View style={styles.userMatchContainer}>
      <View style={styles.userMatchInfo}>
        <Text style={styles.userMatchName}>{item.displayName}</Text>
        <Text style={styles.userMatchEmail}>{item.email}</Text>
      </View>
      <Button
        title="Send Reset Email"
        onPress={() => handleSendPasswordResetToFoundEmail(item.email)}
        variant="primary"
        size="small"
        disabled={isLoading}
      />
    </View>
  );

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Account Recovery</Text>
        <Text style={styles.subtitle}>
          Recover your Seattle Chinatown Book Club account
        </Text>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'password' && styles.activeTab]}
            onPress={() => {
              setActiveTab('password');
              setUserMatches([]);
              setSearchPerformed(false);
              setPasswordResetSent(false);
            }}
          >
            <Text style={[styles.tabText, activeTab === 'password' && styles.activeTabText]}>
              Reset Password
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'username' && styles.activeTab]}
            onPress={() => {
              setActiveTab('username');
              setPasswordResetSent(false);
            }}
          >
            <Text style={[styles.tabText, activeTab === 'username' && styles.activeTabText]}>
              Find Username
            </Text>
          </TouchableOpacity>
        </View>

        {/* Password Reset Tab */}
        {activeTab === 'password' && (
          <Form style={styles.form}>
            <Text style={styles.tabDescription}>
              Enter your email address and we'll send you a link to reset your password.
            </Text>

            <Controller
              control={passwordControl}
              name="email"
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Please enter a valid email address',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email Address"
                  placeholder="Enter your email"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    Keyboard.dismiss();
                    handlePasswordSubmit(handlePasswordReset)();
                  }}
                  ref={emailRef}
                  error={passwordErrors.email?.message}
                  required
                />
              )}
            />

            <Button
              title={isLoading ? 'Sending...' : 'Send Reset Email'}
              onPress={handlePasswordSubmit(handlePasswordReset)}
              disabled={isLoading}
              loading={isLoading}
              variant="error"
              size="large"
              fullWidth
            />
          </Form>
        )}

        {/* Username Recovery Tab */}
        {activeTab === 'username' && (
          <Form style={styles.form}>
            <Text style={styles.tabDescription}>
              Enter your display name to find your account and send a password reset email.
            </Text>

            <Controller
              control={usernameControl}
              name="displayName"
              rules={{
                required: 'Display name is required',
                minLength: {
                  value: 2,
                  message: 'Display name must be at least 2 characters',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Display Name"
                  placeholder="Enter your display name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="search"
                  onSubmitEditing={() => {
                    Keyboard.dismiss();
                    handleUsernameSubmit(handleUsernameRecovery)();
                  }}
                  ref={displayNameRef}
                  error={usernameErrors.displayName?.message}
                  required
                />
              )}
            />

            <Button
              title={isLoading ? 'Searching...' : 'Find Account'}
              onPress={handleUsernameSubmit(handleUsernameRecovery)}
              disabled={isLoading}
              loading={isLoading}
              variant="error"
              size="large"
              fullWidth
            />

            {/* Search Results */}
            {searchPerformed && (
              <View style={styles.searchResults}>
                {userMatches.length > 0 ? (
                  <>
                    <Text style={styles.searchResultsTitle}>
                      {userMatches.length === 1 ? 'Account Found:' : 'Matching Accounts:'}
                    </Text>
                    <FlatList
                      data={userMatches}
                      renderItem={renderUserMatch}
                      keyExtractor={(item, index) => `${item.email}-${index}`}
                      scrollEnabled={false}
                      style={styles.matchList}
                    />
                  </>
                ) : (
                  <View style={styles.noResultsContainer}>
                    <Text style={styles.noResultsTitle}>No Accounts Found</Text>
                    <Text style={styles.noResultsText}>
                      No accounts found with that display name. Try:
                    </Text>
                    <Text style={styles.noResultsText}>• Checking your spelling</Text>
                    <Text style={styles.noResultsText}>• Using a partial name</Text>
                    <Text style={styles.noResultsText}>• Contacting support if you need help</Text>
                  </View>
                )}
              </View>
            )}
          </Form>
        )}

        {/* Back to Login */}
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.linkText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#6b7280',
    marginBottom: 32,
    textAlign: 'center',
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    color: '#6b7280',
    fontWeight: '500',
    fontSize: 16,
  },
  activeTabText: {
    color: '#1f2937',
    fontWeight: '600',
  },
  form: {
    gap: 20,
  },
  tabDescription: {
    color: '#6b7280',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  searchResults: {
    marginTop: 24,
  },
  searchResultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  matchList: {
    maxHeight: 300,
  },
  userMatchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  userMatchInfo: {
    flex: 1,
    marginRight: 12,
  },
  userMatchName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  userMatchEmail: {
    fontSize: 14,
    color: '#6b7280',
  },
  noResultsContainer: {
    backgroundColor: '#fef3c7',
    borderColor: '#fbbf24',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
  },
  noResultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 8,
  },
  noResultsText: {
    color: '#92400e',
    fontSize: 14,
    marginBottom: 4,
  },
  linkButton: {
    marginTop: 32,
    alignItems: 'center',
  },
  linkText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default AccountRecoveryScreen; 