import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { useAuthStore } from '../../stores/authStore';
import { updateUserProfile } from '../../services';

interface EditProfileFormData {
  displayName: string;
  bio: string;
  hobbies: string;
  favoriteBooks: string;
}

export const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, setLoading, refreshUser } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<EditProfileFormData>({
    defaultValues: {
      displayName: user?.displayName || '',
      bio: user?.bio || '',
      hobbies: Array.isArray(user?.hobbies) ? user.hobbies.join(', ') : '',
      favoriteBooks: Array.isArray(user?.favoriteBooks) ? user.favoriteBooks.join(', ') : '',
    },
  });

  const onSubmit = async (data: EditProfileFormData) => {
    if (!user) return;

    try {
      setIsSubmitting(true);
      setLoading(true);

      // Process hobbies and favorite books from comma-separated strings to arrays
      const hobbies = data.hobbies
        .split(',')
        .map(hobby => hobby.trim())
        .filter(hobby => hobby.length > 0);

      const favoriteBooks = data.favoriteBooks
        .split(',')
        .map(book => book.trim())
        .filter(book => book.length > 0);

      const updateData = {
        displayName: data.displayName.trim(),
        bio: data.bio.trim(),
        hobbies,
        favoriteBooks,
      };

      await updateUserProfile(user.id, updateData);
      
      // Refresh user data in the store
      await refreshUser();

      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      Alert.alert(
        'Discard Changes',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Edit Profile</Text>
          <Text style={styles.subtitle}>Update your book club profile information</Text>
        </View>

        <View style={styles.form}>
          {/* Display Name */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Display Name *</Text>
            <Controller
              control={control}
              name="displayName"
              rules={{
                required: 'Display name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' },
                maxLength: { value: 50, message: 'Name must be less than 50 characters' },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.displayName && styles.inputError]}
                  placeholder="Enter your display name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="words"
                  maxLength={50}
                />
              )}
            />
            {errors.displayName && (
              <Text style={styles.errorText}>{errors.displayName.message}</Text>
            )}
          </View>

          {/* Bio */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Bio</Text>
            <Controller
              control={control}
              name="bio"
              rules={{
                maxLength: { value: 500, message: 'Bio must be less than 500 characters' },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.textArea, errors.bio && styles.inputError]}
                  placeholder="Tell us a bit about yourself..."
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={500}
                />
              )}
            />
            {errors.bio && (
              <Text style={styles.errorText}>{errors.bio.message}</Text>
            )}
            <Text style={styles.characterCount}>
              {control._formValues.bio?.length || 0}/500
            </Text>
          </View>

          {/* Hobbies */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Hobbies & Interests</Text>
            <Controller
              control={control}
              name="hobbies"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="e.g., reading, hiking, cooking (separate with commas)"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                />
              )}
            />
            <Text style={styles.helpText}>
              Separate multiple hobbies with commas
            </Text>
          </View>

          {/* Favorite Books */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Favorite Books</Text>
            <Controller
              control={control}
              name="favoriteBooks"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 1984, To Kill a Mockingbird (separate with commas)"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                />
              )}
            />
            <Text style={styles.helpText}>
              Separate multiple books with commas
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            disabled={isSubmitting}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, isSubmitting && styles.disabledButton]}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            <Text style={styles.saveButtonText}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  form: {
    paddingHorizontal: 24,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#1f2937',
  },
  textArea: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#1f2937',
    minHeight: 100,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 4,
  },
  helpText: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 4,
  },
  characterCount: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    padding: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#ec4899',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
}); 