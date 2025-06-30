import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useForm, Controller } from 'react-hook-form';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import {
  sendPasswordReset,
} from '../../services/authService';
import { handleError } from '../../utils/errorHandler';
import { Button } from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Form } from '../../components/common/Form';

type AccountRecoveryScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'AccountRecovery'>;

interface PasswordResetForm {
  email: string;
}

const AccountRecoveryScreen: React.FC = () => {
  const navigation = useNavigation<AccountRecoveryScreenNavigationProp>();
  const [isLoading, setIsLoading] = useState(false);
  const [passwordResetSent, setPasswordResetSent] = useState(false);

  // Form controls
  const {
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
  } = useForm<PasswordResetForm>();

  // Refs
  const emailRef = useRef<TextInput>(null);

  const handlePasswordReset = async (data: PasswordResetForm) => {
    try {
      setIsLoading(true);

      // Send password reset email directly - Firebase will handle email validation
      await sendPasswordReset(data.email);
      setPasswordResetSent(true);

      Alert.alert(
        'Password Reset Email Sent',
        `If an account with ${data.email} exists, a password reset link has been sent. Please check your email (including spam folder) and follow the instructions to reset your password.`,
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
      // Handle specific Firebase errors
      if (error.message?.includes('user-not-found') || error.message?.includes('invalid-email')) {
        Alert.alert(
          'Invalid Email',
          'Please enter a valid email address.',
          [{ text: 'OK' }]
        );
      } else {
        await handleError(error, {
          showAlert: true,
          logError: true,
          autoRetry: false,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Enter your email address to reset your password
        </Text>

        {/* Password Reset Form */}
        <Form style={styles.form}>
          <Text style={styles.description}>
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
  form: {
    gap: 20,
  },
  description: {
    color: '#6b7280',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
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