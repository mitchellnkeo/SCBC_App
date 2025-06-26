import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button } from './Button';

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

  // Create a proper Date object for time picker
  const createTimeDate = (timeStr: string): Date => {
    const now = new Date();
    
    if (!timeStr || timeStr.trim() === '' || timeStr === 'Select time') {
      return now;
    }
    
    try {
      const trimmed = timeStr.trim();
      
      // Use regex to split on any whitespace character (space, non-breaking space, etc.)
      const splitResult = trimmed.split(/\s+/);
      
      const [time, period] = splitResult;
      
      if (!time || !period) {
        return now;
      }
      
      const [hoursStr, minutesStr] = time.split(':');
      
      if (!hoursStr || !minutesStr) {
        return now;
      }
      
      let hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);
      
      if (isNaN(hours) || isNaN(minutes)) {
        return now;
      }
      
      // Convert to 24-hour format
      const periodUpper = period.toUpperCase();
      if (periodUpper === 'PM' && hours !== 12) {
        hours += 12;
      } else if (periodUpper === 'AM' && hours === 12) {
        hours = 0;
      }
      
      const result = new Date();
      result.setHours(hours, minutes, 0, 0);
      return result;
    } catch (error) {
      return now;
    }
  };

  // Format Date object to time string
  const formatTimeString = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Check if end time is after start time
  const isValidTimeRange = (start: string, end: string): boolean => {
    if (!start || !end) return true;
    try {
      const startDate = createTimeDate(start);
      const endDate = createTimeDate(end);
      return endDate > startDate;
    } catch (error) {
      return true;
    }
  };

  const openStartPicker = () => {
    const initialTime = createTimeDate(startTime);
    setTempStartTime(initialTime);
    setShowStartPicker(true);
  };

  const openEndPicker = () => {
    const initialTime = createTimeDate(endTime);
    setTempEndTime(initialTime);
    setShowEndPicker(true);
  };

  const handleStartTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      // Android: Auto-confirm selection
      setShowStartPicker(false);
      if (selectedTime) {
        const newStartTime = formatTimeString(selectedTime);
        onStartTimeChange(newStartTime);
      }
    } else if (selectedTime) {
      // iOS: Just update temp time, don't auto-confirm
      setTempStartTime(selectedTime);
    }
  };

  const handleEndTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      // Android: Auto-confirm selection
      setShowEndPicker(false);
      if (selectedTime) {
        const newEndTime = formatTimeString(selectedTime);
        onEndTimeChange(newEndTime);
      }
    } else if (selectedTime) {
      // iOS: Just update temp time, don't auto-confirm
      setTempEndTime(selectedTime);
    }
  };

  const confirmStartTime = () => {
    const newStartTime = formatTimeString(tempStartTime);
    onStartTimeChange(newStartTime);
    setShowStartPicker(false);
  };

  const confirmEndTime = () => {
    const newEndTime = formatTimeString(tempEndTime);
    onEndTimeChange(newEndTime);
    setShowEndPicker(false);
  };

  const cancelStartTime = () => {
    setTempStartTime(createTimeDate(startTime));
    setShowStartPicker(false);
  };

  const cancelEndTime = () => {
    setTempEndTime(createTimeDate(endTime));
    setShowEndPicker(false);
  };

  const hasTimeError = error || (startTime && endTime && !isValidTimeRange(startTime, endTime));

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
        <>
          {Platform.OS === 'ios' ? (
            <View style={styles.pickerOverlay}>
              <View style={styles.pickerModal}>
                <View style={styles.pickerHeader}>
                  <Text style={styles.pickerTitle}>Select Start Time</Text>
                </View>
                
                <DateTimePicker
                  value={tempStartTime}
                  mode="time"
                  display="spinner"
                  onChange={handleStartTimeChange}
                  style={styles.picker}
                  is24Hour={false}
                />
                
                <View style={styles.pickerButtons}>
                  <Button
                    title="Cancel"
                    onPress={cancelStartTime}
                    variant="secondary"
                    size="large"
                    style={{ flex: 1 }}
                  />
                  <Button
                    title="Confirm"
                    onPress={confirmStartTime}
                    variant="error"
                    size="large"
                    style={{ flex: 1 }}
                  />
                </View>
              </View>
            </View>
          ) : (
            <DateTimePicker
              value={createTimeDate(startTime)}
              mode="time"
              display="default"
              onChange={handleStartTimeChange}
              is24Hour={false}
            />
          )}
        </>
      )}

      {/* End Time Picker */}
      {showEndPicker && (
        <>
          {Platform.OS === 'ios' ? (
            <View style={styles.pickerOverlay}>
              <View style={styles.pickerModal}>
                <View style={styles.pickerHeader}>
                  <Text style={styles.pickerTitle}>Select End Time</Text>
                </View>
                
                <DateTimePicker
                  value={tempEndTime}
                  mode="time"
                  display="spinner"
                  onChange={handleEndTimeChange}
                  style={styles.picker}
                  is24Hour={false}
                />
                
                <View style={styles.pickerButtons}>
                  <Button
                    title="Cancel"
                    onPress={cancelEndTime}
                    variant="secondary"
                    size="large"
                    style={{ flex: 1 }}
                  />
                  <Button
                    title="Confirm"
                    onPress={confirmEndTime}
                    variant="error"
                    size="large"
                    style={{ flex: 1 }}
                  />
                </View>
              </View>
            </View>
          ) : (
            <DateTimePicker
              value={createTimeDate(endTime)}
              mode="time"
              display="default"
              onChange={handleEndTimeChange}
              is24Hour={false}
            />
          )}
        </>
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
    justifyContent: 'flex-end',
  },
  pickerModal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    paddingBottom: 40,
  },
  pickerHeader: {
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
    gap: 12,
  },
});

export default TimePicker; 