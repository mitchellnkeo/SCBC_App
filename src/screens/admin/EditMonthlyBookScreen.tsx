import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import { MainStackParamList } from '../../navigation/MainNavigator';
import TopNavbar from '../../components/navigation/TopNavbar';
import { 
  monthlyBookService, 
  MonthlyBook, 
  CreateMonthlyBookData,
  UpdateMonthlyBookData 
} from '../../services/monthlyBookService';
import { useAuthStore } from '../../stores/authStore';

type NavigationProp = StackNavigationProp<MainStackParamList>;
type RouteProps = RouteProp<MainStackParamList, 'EditMonthlyBook'>;

interface FormData {
  month: string;
  title: string;
  author: string;
  description: string;
  genre: string;
  pages: string;
  publishedYear: string;
  awards: string;
  whySelected: string;
  discussionSheetUrl: string;
  // Meeting details
  inPersonLocation: string;
  inPersonDay: string;
  inPersonTime: string;
  virtualZoomLink: string;
  virtualDay: string;
  virtualTime: string;
}

const EditMonthlyBookScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { user } = useAuthStore();
  const { bookId } = route.params;
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [currentBook, setCurrentBook] = useState<MonthlyBook | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    month: '',
    title: '',
    author: '',
    description: '',
    genre: '',
    pages: '',
    publishedYear: '',
    awards: '',
    whySelected: '',
    discussionSheetUrl: '',
    // Meeting details
    inPersonLocation: '',
    inPersonDay: '',
    inPersonTime: '',
    virtualZoomLink: '',
    virtualDay: '',
    virtualTime: '',
  });

  const isNewBook = bookId === 'new';

  useEffect(() => {
    if (!isNewBook) {
      loadBook();
    }
  }, [bookId]);

  const loadBook = async () => {
    try {
      setLoading(true);
      const book = await monthlyBookService.getMonthlyBook(bookId);
      if (book) {
        setCurrentBook(book);
        setFormData({
          month: book.month,
          title: book.title,
          author: book.author,
          description: book.description,
          genre: book.genre,
          pages: book.pages.toString(),
          publishedYear: book.publishedYear.toString(),
          awards: book.awards.join(', '),
          whySelected: book.whySelected,
          discussionSheetUrl: book.discussionSheetUrl,
          // Meeting details
          inPersonLocation: book.inPersonMeeting?.location || '',
          inPersonDay: book.inPersonMeeting?.day || '',
          inPersonTime: book.inPersonMeeting?.time || '',
          virtualZoomLink: book.virtualMeeting?.zoomLink || '',
          virtualDay: book.virtualMeeting?.day || '',
          virtualTime: book.virtualMeeting?.time || '',
        });
      }
    } catch (error) {
      console.error('Error loading book:', error);
      Alert.alert('Error', 'Unable to load book details.');
    } finally {
      setLoading(false);
    }
  };

  const handleImagePicker = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Unable to select image.');
    }
  };

  const handleSave = async () => {
    // Validate required fields
    if (!formData.title.trim() || !formData.author.trim() || !formData.month.trim()) {
      Alert.alert('Validation Error', 'Please fill in all required fields (Title, Author, Month).');
      return;
    }

    try {
      setSaving(true);

      const bookData: CreateMonthlyBookData = {
        month: formData.month.trim(),
        title: formData.title.trim(),
        author: formData.author.trim(),
        description: formData.description.trim(),
        genre: formData.genre.trim(),
        pages: parseInt(formData.pages) || 0,
        publishedYear: parseInt(formData.publishedYear) || new Date().getFullYear(),
        awards: formData.awards.split(',').map(award => award.trim()).filter(award => award.length > 0),
        whySelected: formData.whySelected.trim(),
        discussionSheetUrl: formData.discussionSheetUrl.trim(),
        // Meeting details
        inPersonMeeting: {
          location: formData.inPersonLocation.trim(),
          day: formData.inPersonDay.trim(),
          time: formData.inPersonTime.trim(),
        },
        virtualMeeting: {
          zoomLink: formData.virtualZoomLink.trim(),
          day: formData.virtualDay.trim(),
          time: formData.virtualTime.trim(),
        },
      };

      let savedBookId: string;

      if (isNewBook) {
        savedBookId = await monthlyBookService.createMonthlyBook(bookData);
      } else {
        await monthlyBookService.updateMonthlyBook(bookId, bookData);
        savedBookId = bookId;
      }

      // Upload image if selected
      if (selectedImage) {
        setUploadingImage(true);
        await monthlyBookService.uploadBookCover(savedBookId, selectedImage);
      }

      Alert.alert(
        'Success',
        `Monthly book ${isNewBook ? 'created' : 'updated'} successfully!`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error saving book:', error);
      Alert.alert('Error', 'Unable to save book. Please try again.');
    } finally {
      setSaving(false);
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!currentBook?.coverImageUrl) return;

    Alert.alert(
      'Delete Cover Image',
      'Are you sure you want to delete the current cover image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await monthlyBookService.deleteBookCover(currentBook.id);
              setCurrentBook({ ...currentBook, coverImageUrl: undefined });
              Alert.alert('Success', 'Cover image deleted successfully.');
            } catch (error) {
              console.error('Error deleting image:', error);
              Alert.alert('Error', 'Unable to delete image.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <TopNavbar title={isNewBook ? 'Add Monthly Book' : 'Edit Monthly Book'} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ec4899" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TopNavbar title={isNewBook ? 'Add Monthly Book' : 'Edit Monthly Book'} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Cover Image Section */}
        <View style={styles.imageSection}>
          <Text style={styles.sectionTitle}>Book Cover</Text>
          
          <View style={styles.imageContainer}>
            {selectedImage || currentBook?.coverImageUrl ? (
              <Image 
                source={{ uri: selectedImage || currentBook?.coverImageUrl }} 
                style={styles.coverImage} 
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>No Cover Image</Text>
              </View>
            )}
          </View>

          <View style={styles.imageButtons}>
            <TouchableOpacity
              style={styles.imageButton}
              onPress={handleImagePicker}
              activeOpacity={0.8}
            >
              <Text style={styles.imageButtonText}>
                {selectedImage || currentBook?.coverImageUrl ? 'Change Image' : 'Add Image'}
              </Text>
            </TouchableOpacity>

            {currentBook?.coverImageUrl && !selectedImage && (
              <TouchableOpacity
                style={[styles.imageButton, styles.deleteButton]}
                onPress={handleDeleteImage}
                activeOpacity={0.8}
              >
                <Text style={styles.deleteButtonText}>Delete Image</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Book Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Month/Year *</Text>
            <TextInput
              style={styles.input}
              value={formData.month}
              onChangeText={(text) => setFormData({ ...formData, month: text })}
              placeholder="e.g., January 2024"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Book Title *</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder="Enter book title"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Author *</Text>
            <TextInput
              style={styles.input}
              value={formData.author}
              onChangeText={(text) => setFormData({ ...formData, author: text })}
              placeholder="Enter author name"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="Enter book description"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Genre</Text>
              <TextInput
                style={styles.input}
                value={formData.genre}
                onChangeText={(text) => setFormData({ ...formData, genre: text })}
                placeholder="e.g., Fiction"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Pages</Text>
              <TextInput
                style={styles.input}
                value={formData.pages}
                onChangeText={(text) => setFormData({ ...formData, pages: text })}
                placeholder="e.g., 300"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Published Year</Text>
            <TextInput
              style={styles.input}
              value={formData.publishedYear}
              onChangeText={(text) => setFormData({ ...formData, publishedYear: text })}
              placeholder="e.g., 2023"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Awards</Text>
            <TextInput
              style={styles.input}
              value={formData.awards}
              onChangeText={(text) => setFormData({ ...formData, awards: text })}
              placeholder="Separate multiple awards with commas"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Why We Selected This Book</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.whySelected}
              onChangeText={(text) => setFormData({ ...formData, whySelected: text })}
              placeholder="Explain why this book was chosen for the book club"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Discussion Sheet URL</Text>
            <TextInput
              style={styles.input}
              value={formData.discussionSheetUrl}
              onChangeText={(text) => setFormData({ ...formData, discussionSheetUrl: text })}
              placeholder="https://docs.google.com/document/..."
              placeholderTextColor="#9ca3af"
              keyboardType="url"
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={() => Keyboard.dismiss()}
            />
          </View>
        </View>

        {/* Meeting Details */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Meeting Details</Text>

          {/* In-Person Meeting */}
          <Text style={styles.label}>In-Person Meeting</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              value={formData.inPersonLocation}
              onChangeText={(text) => setFormData({ ...formData, inPersonLocation: text })}
              placeholder="e.g., Central Library, Room 204"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Day</Text>
              <TextInput
                style={styles.input}
                value={formData.inPersonDay}
                onChangeText={(text) => setFormData({ ...formData, inPersonDay: text })}
                placeholder="e.g., Saturday, Jan 15th"
                placeholderTextColor="#9ca3af"
              />
            </View>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Time</Text>
              <TextInput
                style={styles.input}
                value={formData.inPersonTime}
                onChangeText={(text) => setFormData({ ...formData, inPersonTime: text })}
                placeholder="e.g., 2:00 PM - 4:00 PM"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          {/* Virtual Meeting */}
          <Text style={styles.label}>Virtual Meeting</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Zoom Link</Text>
            <TextInput
              style={styles.input}
              value={formData.virtualZoomLink}
              onChangeText={(text) => setFormData({ ...formData, virtualZoomLink: text })}
              placeholder="https://zoom.us/j/..."
              placeholderTextColor="#9ca3af"
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Day</Text>
              <TextInput
                style={styles.input}
                value={formData.virtualDay}
                onChangeText={(text) => setFormData({ ...formData, virtualDay: text })}
                placeholder="e.g., Sunday, Jan 16th"
                placeholderTextColor="#9ca3af"
              />
            </View>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Time</Text>
              <TextInput
                style={styles.input}
                value={formData.virtualTime}
                onChangeText={(text) => setFormData({ ...formData, virtualTime: text })}
                placeholder="e.g., 7:00 PM - 9:00 PM"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, (saving || uploadingImage) && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving || uploadingImage}
          activeOpacity={0.8}
        >
          {saving || uploadingImage ? (
            <View style={styles.savingContainer}>
              <ActivityIndicator size="small" color="white" />
              <Text style={styles.saveButtonText}>
                {uploadingImage ? 'Uploading Image...' : 'Saving...'}
              </Text>
            </View>
          ) : (
            <Text style={styles.saveButtonText}>
              {isNewBook ? 'Create Monthly Book' : 'Update Monthly Book'}
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
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
  scrollContent: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  // Image Section
  imageSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  coverImage: {
    width: 160,
    height: 240,
    borderRadius: 8,
    resizeMode: 'contain', // Changed from 'cover' to 'contain' for proportional display
    backgroundColor: '#f9fafb', // Add background color for letterboxing
  },
  imagePlaceholder: {
    width: 160,
    height: 240,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
  imageButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  imageButton: {
    backgroundColor: '#ec4899',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  imageButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  // Form Section
  formSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: 'white',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  // Save Button
  saveButton: {
    backgroundColor: '#ec4899',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  savingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bottomSpacer: {
    height: 32,
  },
});

export default EditMonthlyBookScreen; 