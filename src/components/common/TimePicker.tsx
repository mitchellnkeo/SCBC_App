import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface TimePickerProps {
  startTime: string;
  endTime: string;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  error?: string;
  eventDate?: Date;
}

const TimePicker: React.FC<TimePickerProps> = ({
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  error,
  eventDate,
}) => {
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [tempStartTime, setTempStartTime] = useState(new Date());
  const [tempEndTime, setTempEndTime] = useState(new Date());

  // Helper function to convert time string to Date object
  const timeStringToDate = (timeStr: string): Date => {
    const now = new Date();
    
    if (!timeStr || timeStr.trim() === '') {
      // Default to 7:00 PM
      now.setHours(19, 0, 0, 0);
      return now;
    }
    
    try {
      const [time, period] = timeStr.trim().split(' ');
      const [hours, minutes] = time.split(':').map(num => parseInt(num, 10));
      
      let hour24 = hours;
      if (period?.toUpperCase() === 'PM' && hours !== 12) {
        hour24 += 12;
      } else if (period?.toUpperCase() === 'AM' && hours === 12) {
        hour24 = 0;
      }
      
      now.setHours(hour24, minutes || 0, 0, 0);
      return now;
    } catch (error) {
      console.log('Error parsing time:', timeStr, error);
      // Fallback to 7:00 PM
      now.setHours(19, 0, 0, 0);
      return now;
    }
  };

  // Helper function to convert Date to time string
  const dateToTimeString = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Helper function to add hours to a time
  const addHoursToTime = (timeStr: string, hoursToAdd: number): string => {
    const date = timeStringToDate(timeStr);
    const newDate = new Date(date);
    newDate.setHours(newDate.getHours() + hoursToAdd);
    return dateToTimeString(newDate);
  };

  // Helper function to check if a time is in the past for the event date
  const isTimeInPast = (timeStr: string): boolean => {
    if (!eventDate) return false;
    
    const now = new Date();
    const isToday = eventDate.toDateString() === now.toDateString();
    
    if (!isToday) return false; // Only check for today's events
    
    const timeDate = timeStringToDate(timeStr);
    const eventDateTime = new Date(eventDate);
    eventDateTime.setHours(timeDate.getHours(), timeDate.getMinutes(), 0, 0);
    
    return eventDateTime <= now;
  };

  // Get minimum time for today's events
  const getMinimumTime = (): Date => {
    if (!eventDate) return new Date();
    
    const now = new Date();
    const isToday = eventDate.toDateString() === now.toDateString();
    
    if (isToday) {
      // For today's events, minimum time is current time + 15 minutes buffer
      const minTime = new Date(now);
      minTime.setMinutes(now.getMinutes() + 15);
      return minTime;
    }
    
    // For future dates, any time is allowed
    const futureTime = new Date();
    futureTime.setHours(0, 0, 0, 0);
    return futureTime;
  };

  // Validate that end time is after start time
  const isEndTimeAfterStartTime = (start: string, end: string): boolean => {
    if (!start || !end) return true;
    const startDate = timeStringToDate(start);
    const endDate = timeStringToDate(end);
    return endDate > startDate;
  };

  const openStartPicker = () => {
    setTempStartTime(timeStringToDate(startTime));
    setShowStartPicker(true);
  };

  const openEndPicker = () => {
    setTempEndTime(timeStringToDate(endTime));
    setShowEndPicker(true);
  };

  const handleStartTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartPicker(false);
      if (selectedTime) {
        const newStartTime = dateToTimeString(selectedTime);
        onStartTimeChange(newStartTime);
        
        // Auto-suggest end time if not set or invalid
        if (!endTime || !isEndTimeAfterStartTime(newStartTime, endTime)) {
          const suggestedEndTime = addHoursToTime(newStartTime, 2);
          onEndTimeChange(suggestedEndTime);
        }
      }
    } else if (selectedTime) {
      // iOS: just update temp time for preview
      setTempStartTime(selectedTime);
    }
  };

  const handleEndTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowEndPicker(false);
      if (selectedTime) {
        onEndTimeChange(dateToTimeString(selectedTime));
      }
    } else if (selectedTime) {
      // iOS: just update temp time for preview
      setTempEndTime(selectedTime);
    }
  };

  const confirmStartTime = () => {
    const newStartTime = dateToTimeString(tempStartTime);
    onStartTimeChange(newStartTime);
    
    // Auto-suggest end time if needed
    if (!endTime || !isEndTimeAfterStartTime(newStartTime, endTime)) {
      const suggestedEndTime = addHoursToTime(newStartTime, 2);
      onEndTimeChange(suggestedEndTime);
    }
    
    setShowStartPicker(false);
  };

  const confirmEndTime = () => {
    onEndTimeChange(dateToTimeString(tempEndTime));
    setShowEndPicker(false);
  };

  const cancelStartTime = () => {
    setTempStartTime(timeStringToDate(startTime));
    setShowStartPicker(false);
  };

  const cancelEndTime = () => {
    setTempEndTime(timeStringToDate(endTime));
    setShowEndPicker(false);
  };

  const hasTimeError = error || (startTime && endTime && !isEndTimeAfterStartTime(startTime, endTime));

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Event Time</Text>
      
      <View style={styles.timeRow}>
        {/* Start Time */}
        <View style={styles.timeContainer}>
          <Text style={styles.timeLabel}>Start</Text>
          <TouchableOpacity
            onPress={openStartPicker}
            style={[styles.timeButton, hasTimeError && styles.timeButtonError]}
          >
            <Text style={[styles.timeText, !startTime && styles.placeholderText]}>
              {startTime || 'Select time'}
            </Text>
            <Text style={styles.clockIcon}>🕐</Text>
          </TouchableOpacity>
        </View>

        {/* Separator */}
        <View style={styles.separator}>
          <Text style={styles.separatorText}>to</Text>
        </View>

        {/* End Time */}
        <View style={styles.timeContainer}>
          <Text style={styles.timeLabel}>End</Text>
          <TouchableOpacity
            onPress={openEndPicker}
            style={[styles.timeButton, hasTimeError && styles.timeButtonError]}
          >
            <Text style={[styles.timeText, !endTime && styles.placeholderText]}>
              {endTime || 'Select time'}
            </Text>
            <Text style={styles.clockIcon}>🕐</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Error Message */}
      {hasTimeError && (
        <Text style={styles.errorText}>
          {error || 'End time must be after start time'}
        </Text>
      )}

      {/* Start Time Picker */}
      {showStartPicker && (
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerModal}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Start Time</Text>
            </View>
            
            <DateTimePicker
              value={tempStartTime}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleStartTimeChange}
              style={styles.picker}
            />
            
            {Platform.OS === 'ios' && (
              <View style={styles.pickerButtons}>
                <TouchableOpacity 
                  style={[styles.pickerButton, styles.cancelButton]}
                  onPress={cancelStartTime}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.pickerButton, styles.confirmButton]}
                  onPress={confirmStartTime}
                >
                  <Text style={styles.confirmButtonText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}

      {/* End Time Picker */}
      {showEndPicker && (
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerModal}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select End Time</Text>
            </View>
            
            <DateTimePicker
              value={tempEndTime}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleEndTimeChange}
              style={styles.picker}
            />
            
            {Platform.OS === 'ios' && (
              <View style={styles.pickerButtons}>
                <TouchableOpacity 
                  style={[styles.pickerButton, styles.cancelButton]}
                  onPress={cancelEndTime}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.pickerButton, styles.confirmButton]}
                  onPress={confirmEndTime}
                >
                  <Text style={styles.confirmButtonText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeContainer: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 4,
  },
  timeButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeButtonError: {
    borderColor: '#ef4444',
  },
  timeText: {
    fontSize: 16,
    color: '#111827',
  },
  placeholderText: {
    color: '#9ca3af',
  },
  clockIcon: {
    fontSize: 16,
  },
  separator: {
    paddingHorizontal: 12,
    paddingTop: 20,
  },
  separatorText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 4,
  },
  pickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  pickerModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  picker: {
    width: '100%',
    height: 200,
  },
  pickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  pickerButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  confirmButton: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default TimePicker; 