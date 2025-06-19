import { addHours, isAfter, isBefore } from 'date-fns';
import { toZonedTime, format } from 'date-fns-tz';

const PST_TIMEZONE = 'America/Los_Angeles';

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
 * Check if an event has ended (considering PST timezone)
 */
export const hasEventEnded = (eventDate: Date, eventDurationHours: number = 4): boolean => {
  const nowPST = getCurrentPSTTime();
  const eventPST = toPSTTime(eventDate);
  const eventEndTime = addHours(eventPST, eventDurationHours);
  
  return isAfter(nowPST, eventEndTime);
};

/**
 * Check if an event is current or upcoming (considering PST timezone)
 */
export const isEventCurrentOrUpcoming = (eventDate: Date, eventDurationHours: number = 4): boolean => {
  return !hasEventEnded(eventDate, eventDurationHours);
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
 * Get event status with PST awareness
 */
export const getEventStatus = (eventDate: Date): {
  status: 'upcoming' | 'current' | 'past';
  description: string;
} => {
  const nowPST = getCurrentPSTTime();
  const eventPST = toPSTTime(eventDate);
  const eventEndTime = addHours(eventPST, 4);
  
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
export const debugTimezone = (eventDate: Date) => {
  const nowUTC = new Date();
  const nowPST = getCurrentPSTTime();
  const eventPST = toPSTTime(eventDate);
  const eventEndPST = addHours(eventPST, 4);
  
  console.log('=== Timezone Debug ===');
  console.log('UTC Now:', nowUTC.toISOString());
  console.log('PST Now:', nowPST.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  console.log('Event UTC:', eventDate.toISOString());
  console.log('Event PST:', eventPST.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  console.log('Event End PST:', eventEndPST.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  console.log('Has Ended:', hasEventEnded(eventDate));
  console.log('Status:', getEventStatus(eventDate));
  console.log('==================');
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