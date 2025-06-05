import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { useEventStore } from '../../stores/eventStore';
import { useAuthStore } from '../../stores/authStore';
import { CreateEventFormData } from '../../types';

const CreateEventScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { createEvent, isCreating } = useEventStore();

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
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    if (!validateForm() || !user) return;

    try {
      const eventId = await createEvent(
        formData,
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
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData({ ...formData, date: selectedDate });
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const InputField: React.FC<{
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    multiline?: boolean;
    numberOfLines?: number;
    error?: string;
    keyboardType?: 'default' | 'numeric' | 'url';
  }> = ({ label, value, onChangeText, placeholder, multiline, numberOfLines, error, keyboardType = 'default' }) => (
    <View className="mb-4">
      <Text className="text-gray-700 font-medium mb-2">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline={multiline}
        numberOfLines={numberOfLines}
        keyboardType={keyboardType}
        className={`border rounded-lg p-3 text-gray-900 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
      {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-4 flex-row items-center">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mr-4 p-2"
        >
          <Text className="text-pink-500 text-lg">✕</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900 flex-1">Create Event</Text>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isCreating}
          className={`px-4 py-2 rounded-lg ${
            isCreating ? 'bg-gray-300' : 'bg-pink-500'
          }`}
        >
          <Text className="text-white font-semibold">
            {isCreating ? 'Submitting...' : 'Submit'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-4">
        <InputField
          label="Event Title"
          value={formData.title}
          onChangeText={(text) => setFormData({ ...formData, title: text })}
          placeholder="e.g., Book Discussion: Pride and Prejudice"
          error={errors.title}
        />

        <InputField
          label="Description"
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
          placeholder="Tell us about your event..."
          multiline
          numberOfLines={4}
          error={errors.description}
        />

        {/* Date Picker */}
        <View className="mb-4">
          <Text className="text-gray-700 font-medium mb-2">Date</Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="border border-gray-300 rounded-lg p-3"
          >
            <Text className="text-gray-900">{formatDate(formData.date)}</Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={formData.date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            minimumDate={new Date()}
          />
        )}

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

        <InputField
          label="Header Photo URL (Optional)"
          value={formData.headerPhoto || ''}
          onChangeText={(text) => setFormData({ ...formData, headerPhoto: text })}
          placeholder="https://example.com/image.jpg"
          keyboardType="url"
        />

        {/* Approval Notice for Non-Admin Users */}
        {user?.role !== 'admin' && (
          <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <Text className="text-yellow-800 font-medium mb-1">📋 Admin Approval Required</Text>
            <Text className="text-yellow-700 text-sm">
              Your event will be reviewed by our team before being published. You'll receive a notification once it's approved.
            </Text>
          </View>
        )}

        <View className="pb-8" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateEventScreen; 