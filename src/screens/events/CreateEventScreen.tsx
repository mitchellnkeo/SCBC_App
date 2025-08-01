import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  StyleSheet,
  KeyboardAvoidingView,
  Keyboard,
  SafeAreaView,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../stores/authStore';
import { useEventStore } from '../../stores/eventStore';
import { CreateEventFormData } from '../../types';
import DateTimePicker from '@react-native-community/datetimepicker';
import ImagePicker from '../../components/common/ImagePicker';
import TimePicker from '../../components/common/TimePicker';
import { formatFullDate } from '../../utils/dateTimeUtils';
import { Button } from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Form } from '../../components/common/Form';
import TopNavbar from '../../components/navigation/TopNavbar';
import { cleanObject } from '../../utils/objectCleaner';

const CreateEventScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { createEvent, isCreating } = useEventStore();

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

  // Add refs for form fields
  const titleRef = useRef<TextInput>(null);
  const descriptionRef = useRef<TextInput>(null);
  const locationRef = useRef<TextInput>(null);
  const addressRef = useRef<TextInput>(null);
  const maxAttendeesRef = useRef<TextInput>(null);

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
    if (!validateForm() || !user) return;

    const cleanedPayload = cleanObject(formData);

    try {
      const eventId = await createEvent(
        cleanedPayload as CreateEventFormData,
        user.id,
        user.displayName || 'Unknown User',
        user.role || 'member',
        user.profilePicture
      );

      const isAdmin = user.role === 'admin';
      Alert.alert(
        'Event Submitted!',
        isAdmin 
          ? 'Your event has been created and is live immediately.'
          : 'Your event has been submitted for approval. You\'ll be notified once it\'s reviewed by our team.',
        [
          {
            text: 'Great!',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating event:', error);
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

  return (
    <SafeAreaView style={styles.container} className="flex-1 bg-gray-50">
      <TopNavbar
        title="Create Event"
        variant="modal"
        showMenu={false}
        showProfile={false}
        onBackPress={() => navigation.goBack()}
        actionButton={{
          title: isCreating ? 'Submitting...' : 'Submit',
          onPress: handleSubmit,
          disabled: isCreating,
          loading: isCreating,
          variant: 'primary',
          size: 'medium'
        }}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={styles.scrollView} 
          className="flex-1 p-4"
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Move ImagePicker to the top */}
          <ImagePicker
            value={formData.headerPhoto || ''}
            onImageSelected={(uri) => setFormData({ ...formData, headerPhoto: uri })}
            onImageRemoved={() => setFormData({ ...formData, headerPhoto: '' })}
            label="Event Header Photo (Optional)"
            placeholder="Add a photo to make your event stand out!"
          />

          <Input
            label="Event Title"
            value={formData.title}
            onChangeText={(text: string) => setFormData({ ...formData, title: text })}
            placeholder="e.g., Book Discussion: Pride and Prejudice"
            error={errors.title}
            ref={titleRef}
            returnKeyType="next"
            onSubmitEditing={() => descriptionRef.current?.focus()}
            required
          />

          <Input
            label="Description"
            value={formData.description}
            onChangeText={(text: string) => setFormData({ ...formData, description: text })}
            placeholder="Tell us about your event..."
            multiline
            numberOfLines={4}
            error={errors.description}
            ref={descriptionRef}
            returnKeyType="next"
            onSubmitEditing={() => locationRef.current?.focus()}
            required
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
                <Text style={styles.dateText} className="text-gray-900">{formatFullDate(formData.date)}</Text>
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
          </View>

          <TimePicker
            startTime={formData.startTime}
            endTime={formData.endTime}
            onStartTimeChange={(time) => setFormData({ ...formData, startTime: time })}
            onEndTimeChange={(time) => setFormData({ ...formData, endTime: time })}
            error={errors.startTime || errors.endTime}
            eventDate={formData.date}
          />

          <Input
            label="Location Name"
            value={formData.location}
            onChangeText={(text: string) => setFormData({ ...formData, location: text })}
            placeholder="e.g., Central Library"
            error={errors.location}
            ref={locationRef}
            returnKeyType="next"
            onSubmitEditing={() => addressRef.current?.focus()}
            required
          />

          <Input
            label="Address"
            value={formData.address}
            onChangeText={(text: string) => setFormData({ ...formData, address: text })}
            placeholder="e.g., 1000 4th Ave, Seattle, WA 98104"
            error={errors.address}
            ref={addressRef}
            returnKeyType="next"
            onSubmitEditing={() => maxAttendeesRef.current?.focus()}
            required
          />

          <Input
            label="Max Attendees (Optional)"
            value={formData.maxAttendees?.toString() || ''}
            onChangeText={(text: string) => setFormData({ 
              ...formData, 
              maxAttendees: text ? parseInt(text) : undefined 
            })}
            placeholder="e.g., 25"
            keyboardType="numeric"
            ref={maxAttendeesRef}
            returnKeyType="done"
            onSubmitEditing={() => Keyboard.dismiss()}
          />

          {/* Approval Notice for Non-Admin Users */}
          {user?.role !== 'admin' && (
            <View style={styles.approvalNotice} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <Text style={styles.approvalTitle} className="text-yellow-800 font-medium mb-1">📋 Admin Approval Required</Text>
              <Text style={styles.approvalText} className="text-yellow-700 text-sm">
                Your event will be reviewed by our team before being published. You'll receive a notification once it's approved.
              </Text>
            </View>
          )}

          <View style={styles.bottomSpacer} className="pb-8" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb', // gray-50
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  scrollViewContent: {
    flexGrow: 1,
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
    padding: 16,
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

  approvalNotice: {
    backgroundColor: '#fefce8', // yellow-50
    borderWidth: 1,
    borderColor: '#fde047', // yellow-200
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  approvalTitle: {
    color: '#92400e', // yellow-800
    fontWeight: '500',
    marginBottom: 4,
  },
  approvalText: {
    color: '#a16207', // yellow-700
    fontSize: 14,
    lineHeight: 20,
  },
  bottomSpacer: {
    paddingBottom: 32,
  },

});

export default CreateEventScreen; 