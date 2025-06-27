import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  ActivityIndicator,
  ActionSheetIOS,
  Image,
  Keyboard,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { useAuthStore } from '../../stores/authStore';
import { updateUserProfile, updateProfilePicture, removeProfilePicture } from '../../services';
import ProfilePicture from '../../components/common/ProfilePicture';
import { Button } from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Form } from '../../components/common/Form';

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
  const [isUpdatingPicture, setIsUpdatingPicture] = useState(false);

  // Add refs for TextInput fields
  const displayNameRef = useRef<TextInput>(null);
  const bioRef = useRef<TextInput>(null);
  const hobbiesRef = useRef<TextInput>(null);
  const favoriteBooksRef = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<EditProfileFormData>({
    defaultValues: {
      displayName: '',
      bio: '',
      hobbies: '',
      favoriteBooks: '',
    },
  });

  // Reset form with user data when user loads or changes
  const resetFormWithUserData = useCallback(() => {
    if (user && user.displayName) {
      console.log('Resetting form with user data:', {
        displayName: user.displayName,
        bio: user.bio,
        hobbies: user.hobbies,
        favoriteBooks: user.favoriteBooks
      });
      
      reset({
        displayName: user.displayName || '',
        bio: user.bio || '',
        hobbies: Array.isArray(user.hobbies) ? user.hobbies.join(', ') : '',
        favoriteBooks: Array.isArray(user.favoriteBooks) ? user.favoriteBooks.join(', ') : '',
      });
    }
  }, [user, reset]);

  useEffect(() => {
    resetFormWithUserData();
  }, [resetFormWithUserData]);

  // Also reset form when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      resetFormWithUserData();
    }, [resetFormWithUserData])
  );

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

  const handleProfilePicturePress = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library', 'Remove Photo'],
          destructiveButtonIndex: 3,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          switch (buttonIndex) {
            case 1:
              handleUpdateProfilePicture('camera');
              break;
            case 2:
              handleUpdateProfilePicture('gallery');
              break;
            case 3:
              handleRemoveProfilePicture();
              break;
          }
        }
      );
    } else {
      // For Android, show a simple alert
      Alert.alert(
        'Profile Picture Options',
        'Choose an option',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Take Photo', onPress: () => handleUpdateProfilePicture('camera') },
          { text: 'Choose from Library', onPress: () => handleUpdateProfilePicture('gallery') },
          { text: 'Remove Photo', style: 'destructive', onPress: handleRemoveProfilePicture },
        ]
      );
    }
  };

  const handleUpdateProfilePicture = async (source: 'camera' | 'gallery') => {
    if (!user) return;

    try {
      setIsUpdatingPicture(true);
      const result = await updateProfilePicture(user.id, source);
      
      if (result.success) {
        await refreshUser();
        Alert.alert('Success', 'Profile picture updated successfully!');
      } else {
        Alert.alert('Error', result.error || 'Failed to update profile picture');
      }
    } catch (error: any) {
      console.error('Error updating profile picture:', error);
      Alert.alert('Error', error.message || 'Failed to update profile picture');
    } finally {
      setIsUpdatingPicture(false);
    }
  };

  const handleRemoveProfilePicture = async () => {
    if (!user) return;

    try {
      setIsUpdatingPicture(true);
      const result = await removeProfilePicture(user.id);
      
      if (result.success) {
        await refreshUser();
        Alert.alert('Success', 'Profile picture removed successfully!');
      } else {
        Alert.alert('Error', result.error || 'Failed to remove profile picture');
      }
    } catch (error: any) {
      console.error('Error removing profile picture:', error);
      Alert.alert('Error', error.message || 'Failed to remove profile picture');
    } finally {
      setIsUpdatingPicture(false);
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
          {/* Profile Picture */}
          <View style={styles.profilePictureSection}>
            <Text style={styles.profilePictureLabel}>Profile Picture</Text>
            <View style={styles.profilePictureContainer}>
              <TouchableOpacity 
                onPress={handleProfilePicturePress}
                disabled={isUpdatingPicture}
                style={styles.profilePictureButton}
              >
                <ProfilePicture
                  imageUrl={user?.profilePicture}
                  displayName={user?.displayName || 'User'}
                  size="xlarge"
                  showBorder
                />
                {isUpdatingPicture && (
                  <View style={styles.profilePictureOverlay}>
                    <ActivityIndicator size="large" color="#dc2626" />
                  </View>
                )}
              </TouchableOpacity>
              <Text style={styles.profilePictureHint}>
                Tap to change your profile picture
              </Text>
            </View>
          </View>

          {/* Display Name */}
          <Controller
            control={control}
            name="displayName"
            rules={{
              required: 'Display name is required',
              minLength: { value: 2, message: 'Name must be at least 2 characters' },
              maxLength: { value: 50, message: 'Name must be less than 50 characters' },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Display Name"
                placeholder="Enter your display name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="words"
                characterLimit={50}
                showCharacterCount={false}
                error={errors.displayName?.message}
                required
                ref={displayNameRef}
                returnKeyType="next"
                onSubmitEditing={() => bioRef.current?.focus()}
              />
            )}
          />

          {/* Bio */}
          <Controller
            control={control}
            name="bio"
            rules={{
              maxLength: { value: 500, message: 'Bio must be less than 500 characters' },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Bio"
                placeholder="Tell us a bit about yourself..."
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                numberOfLines={4}
                characterLimit={500}
                showCharacterCount={true}
                error={errors.bio?.message}
                ref={bioRef}
                returnKeyType="next"
                onSubmitEditing={() => hobbiesRef.current?.focus()}
              />
            )}
          />

          {/* Hobbies */}
          <Controller
            control={control}
            name="hobbies"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Hobbies & Interests"
                placeholder="e.g., reading, hiking, cooking (separate with commas)"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                helpText="Separate multiple hobbies with commas"
                ref={hobbiesRef}
                returnKeyType="next"
                onSubmitEditing={() => favoriteBooksRef.current?.focus()}
              />
            )}
          />

          {/* Favorite Books */}
          <Controller
            control={control}
            name="favoriteBooks"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Favorite Books"
                placeholder="e.g., 1984, To Kill a Mockingbird (separate with commas)"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                helpText="Separate multiple books with commas"
                ref={favoriteBooksRef}
                returnKeyType="done"
                onSubmitEditing={() => Keyboard.dismiss()}
              />
            )}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            title="Cancel"
            onPress={handleCancel}
            disabled={isSubmitting}
            variant="secondary"
            size="large"
            style={{ flex: 1 }}
          />

          <Button
            title={isSubmitting ? 'Saving...' : 'Save Changes'}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            loading={isSubmitting}
            variant="error"
            size="large"
            style={{ flex: 1 }}
          />
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
  profilePictureSection: {
    marginBottom: 24,
  },
  profilePictureLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    padding: 24,
    gap: 12,
  },
  profilePictureContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  profilePictureButton: {
    position: 'relative',
  },
  profilePictureOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePictureHint: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
}); 