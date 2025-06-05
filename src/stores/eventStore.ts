import { create } from 'zustand';
import { 
  BookClubEvent, 
  PopulatedEvent, 
  CreateEventFormData, 
  CreateCommentFormData 
} from '../types';
import * as eventService from '../services/eventService';

interface EventState {
  // State
  events: BookClubEvent[];
  currentEvent: PopulatedEvent | null;
  isLoading: boolean;
  isCreating: boolean;
  isCommenting: boolean;
  isRsvping: boolean;
  error: string | null;
  
  // Actions
  loadEvents: () => Promise<void>;
  loadEvent: (eventId: string, userId?: string) => Promise<void>;
  createEvent: (eventData: CreateEventFormData, userId: string, userName: string, userProfilePicture?: string) => Promise<string>;
  updateEvent: (eventId: string, eventData: Partial<CreateEventFormData>) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  updateRSVP: (eventId: string, userId: string, userName: string, status: 'going' | 'maybe' | 'not-going', userProfilePicture?: string) => Promise<void>;
  createComment: (eventId: string, userId: string, userName: string, commentData: CreateCommentFormData, userProfilePicture?: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  clearError: () => void;
  clearCurrentEvent: () => void;
  
  // Real-time subscriptions
  subscribeToEvents: () => () => void;
  subscribeToEventDetails: (eventId: string, userId?: string) => () => void;
}

export const useEventStore = create<EventState>((set, get) => ({
  // Initial state
  events: [],
  currentEvent: null,
  isLoading: false,
  isCreating: false,
  isCommenting: false,
  isRsvping: false,
  error: null,
  
  // Load all events
  loadEvents: async () => {
    set({ isLoading: true, error: null });
    try {
      const events = await eventService.getAllEvents();
      set({ events, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load events';
      set({ error: errorMessage, isLoading: false });
    }
  },
  
  // Load single event with all details
  loadEvent: async (eventId: string, userId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const event = await eventService.getPopulatedEvent(eventId, userId);
      set({ currentEvent: event, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load event';
      set({ error: errorMessage, isLoading: false, currentEvent: null });
    }
  },
  
  // Create new event
  createEvent: async (eventData: CreateEventFormData, userId: string, userName: string, userProfilePicture?: string) => {
    set({ isCreating: true, error: null });
    try {
      const eventId = await eventService.createEvent(eventData, userId, userName, userProfilePicture);
      
      // Refresh events list
      const events = await eventService.getAllEvents();
      set({ events, isCreating: false });
      
      return eventId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create event';
      set({ error: errorMessage, isCreating: false });
      throw error;
    }
  },
  
  // Update event
  updateEvent: async (eventId: string, eventData: Partial<CreateEventFormData>) => {
    set({ isLoading: true, error: null });
    try {
      await eventService.updateEvent(eventId, eventData);
      
      // Refresh events list and current event if it's the one being updated
      const events = await eventService.getAllEvents();
      set({ events });
      
      const { currentEvent } = get();
      if (currentEvent && currentEvent.id === eventId) {
        const updatedEvent = await eventService.getPopulatedEvent(eventId, undefined);
        set({ currentEvent: updatedEvent });
      }
      
      set({ isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update event';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },
  
  // Delete event
  deleteEvent: async (eventId: string) => {
    set({ isLoading: true, error: null });
    try {
      await eventService.deleteEvent(eventId);
      
      // Remove from events list and clear current event if it was deleted
      const { events, currentEvent } = get();
      const updatedEvents = events.filter(event => event.id !== eventId);
      const updatedCurrentEvent = currentEvent?.id === eventId ? null : currentEvent;
      
      set({ 
        events: updatedEvents, 
        currentEvent: updatedCurrentEvent, 
        isLoading: false 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete event';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },
  
  // Update RSVP
  updateRSVP: async (eventId: string, userId: string, userName: string, status: 'going' | 'maybe' | 'not-going', userProfilePicture?: string) => {
    set({ isRsvping: true, error: null });
    try {
      await eventService.createOrUpdateRSVP(eventId, userId, userName, status, userProfilePicture);
      
      // Refresh current event if it's the one being RSVP'd to
      const { currentEvent } = get();
      if (currentEvent && currentEvent.id === eventId) {
        const updatedEvent = await eventService.getPopulatedEvent(eventId, userId);
        set({ currentEvent: updatedEvent });
      }
      
      set({ isRsvping: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update RSVP';
      set({ error: errorMessage, isRsvping: false });
      throw error;
    }
  },
  
  // Create comment
  createComment: async (eventId: string, userId: string, userName: string, commentData: CreateCommentFormData, userProfilePicture?: string) => {
    set({ isCommenting: true, error: null });
    try {
      await eventService.createComment(eventId, userId, userName, commentData, userProfilePicture);
      
      // Refresh current event to show new comment
      const { currentEvent } = get();
      if (currentEvent && currentEvent.id === eventId) {
        const updatedEvent = await eventService.getPopulatedEvent(eventId, userId);
        set({ currentEvent: updatedEvent });
      }
      
      set({ isCommenting: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create comment';
      set({ error: errorMessage, isCommenting: false });
      throw error;
    }
  },
  
  // Delete comment
  deleteComment: async (commentId: string) => {
    set({ isLoading: true, error: null });
    try {
      await eventService.deleteComment(commentId);
      
      // Refresh current event to remove deleted comment
      const { currentEvent } = get();
      if (currentEvent) {
        const updatedEvent = await eventService.getPopulatedEvent(currentEvent.id, undefined);
        set({ currentEvent: updatedEvent });
      }
      
      set({ isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete comment';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },
  
  // Utility actions
  clearError: () => set({ error: null }),
  clearCurrentEvent: () => set({ currentEvent: null }),
  
  // Real-time subscriptions
  subscribeToEvents: () => {
    return eventService.subscribeToEvents((events) => {
      set({ events });
    });
  },
  
  subscribeToEventDetails: (eventId: string, userId?: string) => {
    return eventService.subscribeToEventDetails(eventId, userId, (event) => {
      set({ currentEvent: event });
    });
  },
})); 