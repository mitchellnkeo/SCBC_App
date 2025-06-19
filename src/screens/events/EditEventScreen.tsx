import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert, 
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEventStore } from '../../stores/eventStore';
import { useAuthStore } from '../../stores/authStore';
import { CreateEventFormData } from '../../types';
import { handleError } from '../../utils/errorHandler';
import ImagePicker from '../../components/common/ImagePicker';

type RouteParams = {
  EditEvent: {
    eventId: string;
  };
};

// Move InputField outside the main component to prevent re-creation on each render
const InputField: React.FC<{
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: 'default' | 'numeric' | 'url';
  error?: string;
}> = ({ label, value, onChangeText, placeholder, multiline, numberOfLines, keyboardType, error }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && styles.textArea, error && styles.inputError]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#9ca3af"
      multiline={multiline}
      numberOfLines={numberOfLines}
      keyboardType={keyboardType}
    />
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

const EditEventScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'EditEvent'>>();
  const { eventId } = route.params;
  
  const { user } = useAuthStore();
  const { currentEvent, updateEvent, loadEvent, isLoading } = useEventStore();

  const [formData, setFormData] = useState<CreateEventFormData>({
    title: '',
    description: '',
    date: new Date(),
    time: '',
    location: '',
    address: '',
    maxAttendees: undefined,
    headerPhoto: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date()); // Temporary date for browsing
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load event data when component mounts
  useEffect(() => {
    if (eventId && user) {
      loadEvent(eventId, user.id);
    }
  }, [eventId, user?.id]);

  // Populate form when event data loads
  useEffect(() => {
    if (currentEvent) {
      // Check if user has permission to edit
      const canEdit = user?.id === currentEvent.createdBy || user?.role === 'admin';
      if (!canEdit) {
        Alert.alert(
          'Permission Denied',
          'You can only edit events that you created.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
        return;
      }

      const newFormData = {
        title: currentEvent.title,
        description: currentEvent.description,
        date: currentEvent.date,
        time: currentEvent.time,
        location: currentEvent.location,
        address: currentEvent.address,
        maxAttendees: currentEvent.maxAttendees,
        headerPhoto: currentEvent.headerPhoto || '',
      };
      
      setFormData(newFormData);
      setTempDate(currentEvent.date); // Initialize tempDate with event date
    }
  }, [currentEvent, user, navigation]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.time.trim()) {
      newErrors.time = 'Time is required';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !user || !currentEvent) return;

    setIsSubmitting(true);
    try {
      await updateEvent(eventId, formData, user.id, user.displayName, user.profilePicture);
      
      Alert.alert(
        'Event Updated!',
        'Your changes have been saved successfully.',
        [
          {
            text: 'Great!',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      await handleError(error, {
        showAlert: true,
        logError: true,
        autoRetry: false,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    // On Android, auto-close on selection. On iOS, keep open for browsing
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (selectedDate) {
        setFormData({ ...formData, date: selectedDate });
      }
    } else if (selectedDate) {
      // On iOS, just update the temp date for browsing
      setTempDate(selectedDate);
    }
  };

  const confirmDateSelection = () => {
    setFormData({ ...formData, date: tempDate });
    setShowDatePicker(false);
  };

  const cancelDateSelection = () => {
    setTempDate(formData.date); // Reset to original date
    setShowDatePicker(false);
  };

  const openDatePicker = () => {
    setTempDate(formData.date); // Initialize temp date with current form date
    setShowDatePicker(true);
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading event...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentEvent) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Event not found</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Text style={styles.headerButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Edit Event</Text>
        
        <TouchableOpacity 
          onPress={handleSubmit}
          style={[styles.headerButton, styles.saveButton]}
          disabled={isSubmitting}
        >
          <Text style={[styles.headerButtonText, styles.saveButtonText]}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Move ImagePicker to the top */}
          <ImagePicker
            value={formData.headerPhoto || ''}
            onImageSelected={(uri) => setFormData({ ...formData, headerPhoto: uri })}
            onImageRemoved={() => setFormData({ ...formData, headerPhoto: '' })}
            label="Event Header Photo (Optional)"
            placeholder="Add or change the event photo"
          />

          <InputField
            label="Event Title"
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
            placeholder="Enter event title"
            error={errors.title}
          />

          <InputField
            label="Description"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            placeholder="Describe your event..."
            multiline
            numberOfLines={4}
            error={errors.description}
          />

          {/* Date Picker - Direct Calendar Selection */}
          <View style={styles.inputContainer} className="mb-4">
            <Text style={styles.label} className="text-gray-700 font-medium mb-2">Date</Text>
            <TouchableOpacity
              onPress={openDatePicker}
              style={styles.dateButton}
              className="border border-gray-300 rounded-lg p-3"
            >
              <View style={styles.dateButtonContent}>
                <Text style={styles.dateText} className="text-gray-900">{formatDate(formData.date)}</Text>
                <Text style={styles.calendarIcon}>📅</Text>
              </View>
            </TouchableOpacity>
            
            {/* Calendar Picker - Shows directly when tapped */}
            {showDatePicker && (
              <View style={styles.datePickerOverlay}>
                <View style={styles.datePickerModal}>
                  <View style={styles.datePickerHeader}>
                    <Text style={styles.datePickerTitle}>Select Event Date</Text>
                  </View>
                  
                  <DateTimePicker
                    value={tempDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
                    onChange={onDateChange}
                    minimumDate={new Date()}
                    style={styles.datePicker}
                  />
                  
                  {Platform.OS === 'ios' && (
                    <View style={styles.datePickerButtons}>
                      <TouchableOpacity 
                        style={[styles.dateActionButton, styles.cancelButton]}
                        onPress={cancelDateSelection}
                      >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.dateActionButton, styles.confirmButton]}
                        onPress={confirmDateSelection}
                      >
                        <Text style={styles.confirmButtonText}>Confirm</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>

          <InputField
            label="Time"
            value={formData.time}
            onChangeText={(text) => setFormData({ ...formData, time: text })}
            placeholder="e.g., 7:00 PM"
            error={errors.time}
          />

          <InputField
            label="Location Name"
            value={formData.location}
            onChangeText={(text) => setFormData({ ...formData, location: text })}
            placeholder="e.g., Central Library"
            error={errors.location}
          />

          <InputField
            label="Address"
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
            placeholder="e.g., 1000 4th Ave, Seattle, WA 98104"
            error={errors.address}
          />

          <InputField
            label="Max Attendees (Optional)"
            value={formData.maxAttendees?.toString() || ''}
            onChangeText={(text) => setFormData({ 
              ...formData, 
              maxAttendees: text ? parseInt(text) : undefined 
            })}
            placeholder="e.g., 25"
            keyboardType="numeric"
          />

          {/* Edit Notice */}
          <View style={styles.editNotice}>
            <Text style={styles.editNoticeTitle}>📝 Editing Event</Text>
            <Text style={styles.editNoticeText}>
              Changes to your event will be visible immediately to all attendees. 
              Be sure to notify attendees of any significant changes.
            </Text>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    minWidth: 60,
  },
  headerButtonText: {
    fontSize: 16,
    color: '#6b7280',
  },
  saveButton: {
    backgroundColor: '#ec4899',
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  inputContainer: {
    marginBottom: 20,
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
    height: 120,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 4,
  },
  dateButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 16,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#1f2937',
  },
  editNotice: {
    backgroundColor: '#dbeafe',
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    borderRadius: 8,
    padding: 16,
    marginVertical: 16,
  },
  editNoticeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
  },
  editNoticeText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  backButton: {
    backgroundColor: '#ec4899',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  datePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ef4444',
  },
  confirmButton: {
    backgroundColor: '#3b82f6',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  dateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#1f2937',
  },
  calendarIcon: {
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 8,
  },
  datePickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  datePickerModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  datePicker: {
    width: '100%',
    height: 300,
  },
  datePickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  dateActionButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
  },
});

export default EditEventScreen; 