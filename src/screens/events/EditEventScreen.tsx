import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Alert,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import { useAuthStore } from '../../stores/authStore';
import { useEventStore } from '../../stores/eventStore';
import { CreateEventFormData } from '../../types';
import { formatFullDate } from '../../utils/dateTimeUtils';
import { handleError } from '../../utils/errorHandler';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button } from '../../components/common/Button';
import TimePicker from '../../components/common/TimePicker';
import ImagePicker from '../../components/common/ImagePicker';
import LoadingState from '../../components/common/LoadingState';
import { Input } from '../../components/common/Input';
import { Form, FormSection } from '../../components/common/Form';
import { createCommonStyles } from '../../styles/commonStyles';
import { useTheme } from '../../contexts/ThemeContext';
import TopNavbar from '../../components/navigation/TopNavbar';

type RouteParams = {
  EditEvent: {
    eventId: string;
  };
};

const EditEventScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'EditEvent'>>();
  const { eventId } = route.params;
  
  const { user } = useAuthStore();
  const { currentEvent, updateEvent, loadEvent, isLoading } = useEventStore();
  const { theme } = useTheme();
  const commonStyles = createCommonStyles(theme);

  const [formData, setFormData] = useState<CreateEventFormData>({
    title: '',
    description: '',
    date: new Date(),
    startTime: '',
    endTime: '',
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
        startTime: currentEvent.startTime,
        endTime: currentEvent.endTime,
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
    const now = new Date();

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.startTime.trim()) {
      newErrors.startTime = 'Start time is required';
    }
    if (!formData.endTime.trim()) {
      newErrors.endTime = 'End time is required';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    // Validate that event date/time is not in the past
    if (formData.startTime && formData.endTime) {
      const isToday = formData.date.toDateString() === now.toDateString();
      
      if (isToday) {
        // For today's events, check if start time is in the past
        const startDateTime = createDateTime(formData.date, formData.startTime);
        const endDateTime = createDateTime(formData.date, formData.endTime);
        
        if (startDateTime <= now) {
          newErrors.startTime = 'Start time cannot be in the past';
        }
        if (endDateTime <= now) {
          newErrors.endTime = 'End time cannot be in the past';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper function to combine date and time into a single DateTime
  const createDateTime = (date: Date, timeString: string): Date => {
    const [time, period] = timeString.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    
    let hour24 = hours;
    if (period === 'PM' && hours !== 12) {
      hour24 += 12;
    } else if (period === 'AM' && hours === 12) {
      hour24 = 0;
    }
    
    const dateTime = new Date(date);
    dateTime.setHours(hour24, minutes, 0, 0);
    return dateTime;
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

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingState text="Loading event..." />
      </SafeAreaView>
    );
  }

  if (!currentEvent) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={commonStyles.errorText}>Event not found</Text>
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
      <TopNavbar
        title="Edit Event"
        variant="modal"
        showMenu={false}
        showProfile={false}
        onBackPress={() => navigation.goBack()}
        actionButton={{
          title: isSubmitting ? 'Saving...' : 'Save',
          onPress: handleSubmit,
          disabled: isSubmitting,
          loading: isSubmitting,
          variant: 'primary',
          size: 'small'
        }}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Form>
            <FormSection title="Event Details">
              <ImagePicker
                value={formData.headerPhoto || ''}
                onImageSelected={(uri: string) => setFormData({ ...formData, headerPhoto: uri })}
                onImageRemoved={() => setFormData({ ...formData, headerPhoto: '' })}
                label="Event Header Photo (Optional)"
                placeholder="Add or change the event photo"
              />

              <Input
                label="Event Title"
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholder="Enter event title"
                error={errors.title}
                variant="outlined"
              />

              <Input
                label="Description"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Describe your event..."
                multiline
                numberOfLines={4}
                error={errors.description}
                variant="outlined"
              />
            </FormSection>

            <FormSection title="Date & Time">
              {/* Date Selection */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Event Date</Text>
                <TouchableOpacity
                  onPress={openDatePicker}
                  style={styles.dateButton}
                >
                  <View style={styles.dateButtonContent}>
                    <Text style={styles.dateText}>{formatFullDate(formData.date)}</Text>
                    <Text style={styles.calendarIcon}>📅</Text>
                  </View>
                </TouchableOpacity>
              </View>
                
              {/* Calendar Picker - Shows directly when tapped */}
              {showDatePicker && (
                <View style={styles.datePickerContainer}>
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
                        <Button
                          title="Cancel"
                          onPress={cancelDateSelection}
                          variant="error"
                          size="medium"
                          style={{ flex: 1 }}
                        />
                        <Button
                          title="Confirm"
                          onPress={confirmDateSelection}
                          variant="primary"
                          size="medium"
                          style={{ flex: 1, marginLeft: 12 }}
                        />
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* Time Selection */}
              <TimePicker
                startTime={formData.startTime}
                endTime={formData.endTime}
                onStartTimeChange={(time: string) => setFormData({ ...formData, startTime: time })}
                onEndTimeChange={(time: string) => setFormData({ ...formData, endTime: time })}
                error={errors.startTime || errors.endTime}
                eventDate={formData.date}
              />
            </FormSection>

            <FormSection title="Location">
              <Input
                label="Location Name"
                value={formData.location}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
                placeholder="e.g., Central Library"
                error={errors.location}
                variant="outlined"
              />

              <Input
                label="Address"
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
                placeholder="e.g., 1000 4th Ave, Seattle, WA 98104"
                error={errors.address}
                variant="outlined"
              />
            </FormSection>

            <FormSection title="Capacity">
              <Input
                label="Max Attendees (Optional)"
                value={formData.maxAttendees?.toString() || ''}
                onChangeText={(text) => setFormData({ 
                  ...formData, 
                  maxAttendees: text ? parseInt(text) : undefined 
                })}
                placeholder="e.g., 25"
                keyboardType="numeric"
                variant="outlined"
              />
            </FormSection>
          </Form>

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
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
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

  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151', // gray-700
    marginBottom: 8,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#d1d5db', // gray-300
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
  },
  dateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#111827', // gray-900
  },
  calendarIcon: {
    marginLeft: 8,
  },
  datePickerContainer: {
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  datePickerModal: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
  },
  datePickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827', // gray-900
  },
  datePicker: {
    width: '100%',
    height: 200,
  },
  datePickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
  },
  });

export default EditEventScreen; 