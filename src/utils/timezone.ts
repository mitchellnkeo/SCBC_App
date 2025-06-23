import { addHours, isAfter, isBefore, addMinutes } from 'date-fns';
import { toZonedTime, format } from 'date-fns-tz';

const PST_TIMEZONE = 'America/Los_Angeles';

/**
 * Calculate event duration in minutes from startTime and endTime strings
 */
export const calculateEventDuration = (startTime: string, endTime: string): number => {
  // Quick validation - if either time is missing or doesn't look like a time string, use default
  if (!startTime || !endTime || typeof startTime !== 'string' || typeof endTime !== 'string') {
    return 240; // Default to 4 hours
  }
  
  // Check if the strings look like time formats (contain ":" and "M")
  if (!startTime.includes(':') || !startTime.includes('M') || 
      !endTime.includes(':') || !endTime.includes('M')) {
    return 240; // Default to 4 hours
  }
  
  try {
    // Parse time strings (e.g., "4:00 PM", "4:30 PM")
    const parseTime = (timeStr: string): { hours: number; minutes: number } => {
      const trimmed = timeStr.trim();
      
      // Split by any whitespace character (space, non-breaking space, etc.)
      const parts = trimmed.split(/\s+/);
      if (parts.length < 2) {
        throw new Error('Missing AM/PM indicator');
      }
      
      const [time, period] = parts;
      
      if (!time || !period) {
        throw new Error('Invalid time format');
      }
      
      // Split time by colon
      const timeParts = time.split(':');
      if (timeParts.length !== 2) {
        throw new Error('Invalid time format - missing colon');
      }
      
      const [hoursStr, minutesStr] = timeParts;
      
      if (!hoursStr || !minutesStr) {
        throw new Error('Invalid time components');
      }
      
      let hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);
      
      if (isNaN(hours) || isNaN(minutes)) {
        throw new Error('Invalid numeric values');
      }
      
      // Validate ranges
      if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) {
        throw new Error('Time values out of range');
      }
      
      // Convert to 24-hour format
      const periodUpper = period.toUpperCase();
      if (periodUpper === 'PM' && hours !== 12) {
        hours += 12;
      } else if (periodUpper === 'AM' && hours === 12) {
        hours = 0;
      } else if (periodUpper !== 'AM' && periodUpper !== 'PM') {
        throw new Error('Invalid AM/PM indicator');
      }
      
      return { hours, minutes };
    };

    const start = parseTime(startTime);
    const end = parseTime(endTime);
    
    // Convert to minutes since midnight
    const startMinutes = start.hours * 60 + start.minutes;
    const endMinutes = end.hours * 60 + end.minutes;
    
    // Calculate duration (handle next-day events)
    let duration = endMinutes - startMinutes;
    if (duration < 0) {
      duration += 24 * 60; // Add 24 hours in minutes
    }
    
    // Sanity check - events shouldn't be longer than 24 hours
    if (duration > 24 * 60) {
      throw new Error('Event duration exceeds 24 hours');
    }
    
    return duration;
  } catch (error) {
    // Only log if we actually expected this to work (has proper format)
    if (startTime.includes(':') && startTime.includes('M') && endTime.includes(':') && endTime.includes('M')) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.warn('Error calculating event duration:', errorMessage, 'Start:', startTime, 'End:', endTime);
    }
    return 240; // Default to 4 hours (240 minutes) if parsing fails
  }
};

/**
 * Get the current time in PST/PDT timezone
 */
export const getCurrentPSTTime = (): Date => {
  return toZonedTime(new Date(), PST_TIMEZONE);
};

/**
 * Convert a UTC date to PST/PDT timezone
 */
export const toPSTTime = (date: Date): Date => {
  return toZonedTime(date, PST_TIMEZONE);
};

/**
 * Check if an event has ended (considering PST timezone and actual event duration)
 */
export const hasEventEnded = (eventDate: Date, startTime?: string, endTime?: string): boolean => {
  const nowPST = getCurrentPSTTime();
  const eventPST = toPSTTime(eventDate);
  
  // Use actual event duration if available, otherwise default to 4 hours
  let eventEndTime: Date;
  if (startTime && endTime) {
    const durationMinutes = calculateEventDuration(startTime, endTime);
    eventEndTime = addMinutes(eventPST, durationMinutes);
  } else {
    eventEndTime = addHours(eventPST, 4);
  }
  
  return isAfter(nowPST, eventEndTime);
};

/**
 * Check if an event is current or upcoming (considering PST timezone and actual duration)
 */
export const isEventCurrentOrUpcoming = (eventDate: Date, startTime?: string, endTime?: string): boolean => {
  return !hasEventEnded(eventDate, startTime, endTime);
};

/**
 * Format a date for display in PST timezone
 */
export const formatPSTDate = (date: Date): string => {
  return format(toZonedTime(date, PST_TIMEZONE), 'EEE, MMM d, yyyy', { timeZone: PST_TIMEZONE });
};

/**
 * Format a time for display in PST timezone
 */
export const formatPSTTime = (date: Date): string => {
  return format(toZonedTime(date, PST_TIMEZONE), 'h:mm a', { timeZone: PST_TIMEZONE });
};

/**
 * Get event status with PST awareness and actual event duration
 */
export const getEventStatus = (eventDate: Date, startTime?: string, endTime?: string): {
  status: 'upcoming' | 'current' | 'past';
  description: string;
} => {
  const nowPST = getCurrentPSTTime();
  const eventPST = toPSTTime(eventDate);
  
  // Use actual event duration if available, otherwise default to 4 hours
  let eventEndTime: Date;
  if (startTime && endTime) {
    const durationMinutes = calculateEventDuration(startTime, endTime);
    eventEndTime = addMinutes(eventPST, durationMinutes);
  } else {
    eventEndTime = addHours(eventPST, 4);
  }
  
  if (isBefore(nowPST, eventPST)) {
    return { status: 'upcoming', description: 'Upcoming Event' };
  } else if (isBefore(nowPST, eventEndTime)) {
    return { status: 'current', description: 'Event in Progress' };
  } else {
    return { status: 'past', description: 'Past Event' };
  }
};

/**
 * Debug helper to log timezone information
 */
export const debugTimezone = (eventDate: Date, startTime?: string, endTime?: string) => {
  const nowUTC = new Date();
  const nowPST = getCurrentPSTTime();
  const eventPST = toPSTTime(eventDate);
  
  let eventEndPST: Date;
  let duration: number;
  
  if (startTime && endTime) {
    duration = calculateEventDuration(startTime, endTime);
    eventEndPST = addMinutes(eventPST, duration);
  } else {
    duration = 240; // 4 hours in minutes
    eventEndPST = addHours(eventPST, 4);
  }
  
  console.log('=== Timezone Debug ===');
  console.log('UTC Now:', nowUTC.toISOString());
  console.log('PST Now:', nowPST.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  console.log('Event UTC:', eventDate.toISOString());
  console.log('Event PST:', eventPST.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  console.log('Start Time:', startTime || 'Not specified');
  console.log('End Time:', endTime || 'Not specified');
  console.log('Duration (minutes):', duration);
  console.log('Event End PST:', eventEndPST.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  console.log('Has Ended:', hasEventEnded(eventDate, startTime, endTime));
  console.log('Status:', getEventStatus(eventDate, startTime, endTime));
  console.log('==================');
};

// Backward compatibility - keep old function signatures but with deprecation warnings
/**
 * @deprecated Use hasEventEnded(eventDate, startTime, endTime) instead
 */
export const hasEventEndedLegacy = (eventDate: Date, eventDurationHours: number = 4): boolean => {
  console.warn('hasEventEndedLegacy is deprecated. Use hasEventEnded with startTime and endTime instead.');
  return hasEventEnded(eventDate);
};

/**
 * @deprecated Use isEventCurrentOrUpcoming(eventDate, startTime, endTime) instead
 */
export const isEventCurrentOrUpcomingLegacy = (eventDate: Date, eventDurationHours: number = 4): boolean => {
  console.warn('isEventCurrentOrUpcomingLegacy is deprecated. Use isEventCurrentOrUpcoming with startTime and endTime instead.');
  return isEventCurrentOrUpcoming(eventDate);
};

/**
 * Get PST timezone offset information
 */
export const getPSTInfo = () => {
  const now = new Date();
  const pstTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
  const utcTime = new Date(now.toUTCString());
  const offsetMs = utcTime.getTime() - pstTime.getTime();
  const offsetHours = offsetMs / (1000 * 60 * 60);
  
  return {
    offsetHours,
    isDST: offsetHours === 7, // PDT (Daylight Saving Time)
    timezoneName: offsetHours === 7 ? 'PDT' : 'PST'
  };
}; 