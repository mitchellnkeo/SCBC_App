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
  console.log('TimePicker rendered with startTime:', JSON.stringify(startTime), 'endTime:', JSON.stringify(endTime));
  
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [tempStartTime, setTempStartTime] = useState(new Date());
  const [tempEndTime, setTempEndTime] = useState(new Date());

  // Create a proper Date object for time picker
  const createTimeDate = (timeStr: string): Date => {
    console.log('createTimeDate called with:', JSON.stringify(timeStr));
    
    const now = new Date();
    
    if (!timeStr || timeStr.trim() === '' || timeStr === 'Select time') {
      console.log('Using current time as default');
      return now;
    }
    
    try {
      const trimmed = timeStr.trim();
      const [time, period] = trimmed.split(' ');
      
      if (!time || !period) {
        console.log('Invalid time format, missing time or period');
        return now;
      }
      
      const [hoursStr, minutesStr] = time.split(':');
      
      if (!hoursStr || !minutesStr) {
        console.log('Invalid time format, missing hours or minutes');
        return now;
      }
      
      let hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);
      
      if (isNaN(hours) || isNaN(minutes)) {
        console.log('Invalid numbers in time, hours:', hours, 'minutes:', minutes);
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
      console.log('Successfully created time date:', result);
      return result;
    } catch (error) {
      console.log('Error parsing time:', JSON.stringify(timeStr), error);
      return now;
    }
  };

  // Format Date object to time string
  const formatTimeString = (date: Date): string => {
    console.log('formatTimeString called with date:', date);
    
    const result = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    
    console.log('formatTimeString result:', result);
    return result;
  };

  // Check if end time is after start time
  const isValidTimeRange = (start: string, end: string): boolean => {
    if (!start || !end) return true;
    try {
      const startDate = createTimeDate(start);
      const endDate = createTimeDate(end);
      console.log('isValidTimeRange - comparing:');
      console.log('  start:', JSON.stringify(start), '→', startDate);
      console.log('  end:', JSON.stringify(end), '→', endDate);
      console.log('  endDate > startDate:', endDate > startDate);
      console.log('  endDate.getTime():', endDate.getTime(), 'startDate.getTime():', startDate.getTime());
      return endDate > startDate;
    } catch (error) {
      console.log('isValidTimeRange error:', error);
      return true;
    }
  };

  const openStartPicker = () => {
    console.log('openStartPicker called');
    console.log('current startTime:', startTime);
    
    const initialTime = createTimeDate(startTime);
    console.log('setting tempStartTime to:', initialTime);
    
    setTempStartTime(initialTime);
    setShowStartPicker(true);
  };

  const openEndPicker = () => {
    console.log('openEndPicker called');
    console.log('current endTime:', endTime);
    
    const initialTime = createTimeDate(endTime);
    console.log('setting tempEndTime to:', initialTime);
    
    setTempEndTime(initialTime);
    setShowEndPicker(true);
  };

  const handleStartTimeChange = (event: any, selectedTime?: Date) => {
    console.log('handleStartTimeChange called');
    console.log('Platform:', Platform.OS);
    console.log('selectedTime:', selectedTime);
    
    if (Platform.OS === 'android') {
      // Android: Auto-confirm selection
      setShowStartPicker(false);
      if (selectedTime) {
        const newStartTime = formatTimeString(selectedTime);
        console.log('Android - setting start time to:', newStartTime);
        onStartTimeChange(newStartTime);
      }
    } else if (selectedTime) {
      // iOS: Just update temp time, don't auto-confirm
      console.log('iOS - updating tempStartTime to:', selectedTime);
      setTempStartTime(selectedTime);
    }
  };

  const handleEndTimeChange = (event: any, selectedTime?: Date) => {
    console.log('handleEndTimeChange called');
    console.log('Platform:', Platform.OS);
    console.log('selectedTime:', selectedTime);
    
    if (Platform.OS === 'android') {
      // Android: Auto-confirm selection
      setShowEndPicker(false);
      if (selectedTime) {
        const newEndTime = formatTimeString(selectedTime);
        console.log('Android - setting end time to:', newEndTime);
        onEndTimeChange(newEndTime);
      }
    } else if (selectedTime) {
      // iOS: Just update temp time, don't auto-confirm
      console.log('iOS - updating tempEndTime to:', selectedTime);
      setTempEndTime(selectedTime);
    }
  };

  const confirmStartTime = () => {
    console.log('confirmStartTime called');
    console.log('tempStartTime:', tempStartTime);
    
    const newStartTime = formatTimeString(tempStartTime);
    console.log('newStartTime formatted:', newStartTime);
    console.log('About to call onStartTimeChange with:', newStartTime);
    
    // Set the start time
    onStartTimeChange(newStartTime);
    console.log('onStartTimeChange called - start time should now be set');
    
    setShowStartPicker(false);
  };

  const confirmEndTime = () => {
    console.log('confirmEndTime called');
    console.log('tempEndTime:', tempEndTime);
    
    const newEndTime = formatTimeString(tempEndTime);
    console.log('newEndTime formatted:', newEndTime);
    
    onEndTimeChange(newEndTime);
    console.log('End time set to:', newEndTime);
    
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
              {(() => {
                const displayText = startTime || 'Select time';
                console.log('Rendering start time UI with:', JSON.stringify(displayText), 'from startTime prop:', JSON.stringify(startTime));
                return displayText;
              })()}
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
  pickerButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  confirmButton: {
    backgroundColor: '#ec4899',
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 16,
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default TimePicker; 