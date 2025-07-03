import { create } from 'zustand';
import { 
  BookClubEvent, 
  PopulatedEvent, 
  CreateEventFormData, 
  CreateCommentFormData,
  ApprovalFormData,
  PendingEventStats
} from '../types';
import * as eventService from '../services/eventService';
import { logger } from '../utils/logger';

interface EventState {
  // State
  events: BookClubEvent[];
  pastEvents: BookClubEvent[];
  pendingEvents: BookClubEvent[];
  pendingStats: PendingEventStats;
  currentEvent: PopulatedEvent | null;
  isLoading: boolean;
  isPastLoading: boolean;
  isCreating: boolean;
  isCommenting: boolean;
  isRsvping: boolean;
  isApproving: boolean;
  error: string | null;
  pastError: string | null;
  lastVisible: any;
  hasMore: boolean;
  
  // Actions
  loadEvents: (refresh?: boolean) => Promise<void>;
  loadMoreEvents: () => Promise<void>;
  loadPastEvents: () => Promise<void>;
  loadPendingEvents: () => Promise<void>;
  loadPendingStats: () => Promise<void>;
  loadEvent: (eventId: string, userId?: string) => Promise<void>;
  createEvent: (eventData: CreateEventFormData, userId: string, userName: string, userRole: 'admin' | 'member', userProfilePicture?: string) => Promise<string>;
  updateEvent: (eventId: string, eventData: Partial<CreateEventFormData>, updaterUserId?: string, updaterUserName?: string, updaterProfilePicture?: string) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  approveEvent: (eventId: string, adminUserId: string, approvalData: ApprovalFormData) => Promise<void>;
  updateRSVP: (eventId: string, userId: string, userName: string, status: 'going' | 'maybe' | 'not-going', userProfilePicture?: string) => Promise<void>;
  createComment: (eventId: string, userId: string, userName: string, commentData: CreateCommentFormData, userProfilePicture?: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  clearError: () => void;
  clearPastError: () => void;
  clearCurrentEvent: () => void;
  
  // Real-time subscriptions
  subscribeToEvents: () => () => void;
  subscribeToPastEvents: () => () => void;
  subscribeToPendingEvents: () => () => void;
  subscribeToEventDetails: (eventId: string, userId?: string) => () => void;
}

export const useEventStore = create<EventState>((set, get) => ({
  // Initial state
  events: [],
  pastEvents: [],
  pendingEvents: [],
  pendingStats: { totalPending: 0, newThisWeek: 0 },
  currentEvent: null,
  isLoading: false,
  isPastLoading: false,
  isCreating: false,
  isCommenting: false,
  isRsvping: false,
  isApproving: false,
  error: null,
  pastError: null,
  lastVisible: null,
  hasMore: true,
  
  // Load all approved events with pagination
  loadEvents: async (refresh = false) => {
    logger.debug('Loading events:', { refresh, currentCount: get().events.length });
    set({ isLoading: true, error: null });
    
    try {
      if (refresh) {
        logger.debug('Refreshing events from start');
        set({ lastVisible: null });
      }
      
      const result = await eventService.getAllEvents({
        limitCount: 20,
        lastVisible: refresh ? null : get().lastVisible
      });
      
      const newEvents = refresh ? result.events : [...get().events, ...result.events];
      
      logger.debug('Events loaded:', {
        newCount: result.events.length,
        totalCount: newEvents.length,
        hasMore: result.hasMore
      });
      
      set({ 
        events: newEvents,
        lastVisible: result.lastVisible,
        hasMore: result.hasMore,
        isLoading: false 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load events';
      logger.error('Failed to load events:', { error: errorMessage });
      set({ error: errorMessage, isLoading: false });
    }
  },

  // Load more events (pagination)
  loadMoreEvents: async () => {
    const state = get();
    if (!state.hasMore || state.isLoading) {
      logger.debug('Skipping loadMoreEvents:', {
        hasMore: state.hasMore,
        isLoading: state.isLoading
      });
      return;
    }
    
    logger.debug('Loading more events:', {
      currentCount: state.events.length
    });
    
    await state.loadEvents(false);
  },
  
  // Load past events
  loadPastEvents: async () => {
    set({ isPastLoading: true, error: null });
    try {
      const pastEvents = await eventService.getPastEvents();
      set({ pastEvents, isPastLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load past events';
      set({ error: errorMessage, isPastLoading: false });
    }
  },
  
  // Load pending events (admin only)
  loadPendingEvents: async () => {
    set({ isLoading: true, error: null });
    try {
      const pendingEvents = await eventService.getPendingEvents();
      set({ pendingEvents, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load pending events';
      set({ error: errorMessage, isLoading: false });
    }
  },
  
  // Load pending event statistics
  loadPendingStats: async () => {
    try {
      const pendingStats = await eventService.getPendingEventStats();
      set({ pendingStats });
    } catch (error) {
      console.error('Failed to load pending stats:', error);
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
  
  // Create new event (with approval system)
  createEvent: async (eventData: CreateEventFormData, userId: string, userName: string, userRole: 'admin' | 'member', userProfilePicture?: string) => {
    set({ isCreating: true, error: null });
    try {
      const eventId = await eventService.createEvent(eventData, userId, userName, userRole, userProfilePicture);
      
      // Refresh events list (only shows approved events)
      const result = await eventService.getAllEvents();
      set({ events: result.events });
      
      // If admin, also refresh pending events to show immediately
      if (userRole === 'admin') {
        const pendingEvents = await eventService.getPendingEvents();
        const pendingStats = await eventService.getPendingEventStats();
        set({ pendingEvents, pendingStats });
      }
      
      set({ isCreating: false });
      return eventId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create event';
      set({ error: errorMessage, isCreating: false });
      throw error;
    }
  },
  
  // Approve or reject event (admin only)
  approveEvent: async (eventId: string, adminUserId: string, approvalData: ApprovalFormData) => {
    set({ isApproving: true, error: null });
    try {
      await eventService.approveEvent(eventId, adminUserId, approvalData);
      
      // Refresh all relevant lists
      const [eventsResult, pendingEvents, pendingStats] = await Promise.all([
        eventService.getAllEvents(),
        eventService.getPendingEvents(),
        eventService.getPendingEventStats()
      ]);
      
      set({ 
        events: eventsResult.events, 
        pendingEvents, 
        pendingStats, 
        isApproving: false 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process approval';
      set({ error: errorMessage, isApproving: false });
      throw error;
    }
  },
  
  // Update event
  updateEvent: async (eventId: string, eventData: Partial<CreateEventFormData>, updaterUserId?: string, updaterUserName?: string, updaterProfilePicture?: string) => {
    set({ isLoading: true, error: null });
    try {
      await eventService.updateEvent(eventId, eventData, updaterUserId, updaterUserName, updaterProfilePicture);
      
      // Refresh events list and current event if it's the one being updated
      const result = await eventService.getAllEvents();
      set({ events: result.events });
      
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
      
      // Remove from all event lists and clear current event if it was deleted
      const { events, pendingEvents, currentEvent } = get();
      const updatedEvents = events.filter(event => event.id !== eventId);
      const updatedPendingEvents = pendingEvents.filter(event => event.id !== eventId);
      const updatedCurrentEvent = currentEvent?.id === eventId ? null : currentEvent;
      
      // Refresh pending stats
      const pendingStats = await eventService.getPendingEventStats();
      
      set({ 
        events: updatedEvents, 
        pendingEvents: updatedPendingEvents,
        pendingStats,
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
  clearPastError: () => set({ pastError: null }),
  clearCurrentEvent: () => set({ currentEvent: null }),
  
  // Real-time subscriptions
  subscribeToEvents: () => {
    return eventService.subscribeToEvents((events) => {
      set({ events });
    });
  },
  
  subscribeToPastEvents: () => {
    return eventService.subscribeToPastEvents((pastEvents) => {
      set({ pastEvents });
    });
  },
  
  subscribeToPendingEvents: () => {
    return eventService.subscribeToPendingEvents((pendingEvents) => {
      set({ pendingEvents });
      // Update stats when pending events change
      eventService.getPendingEventStats().then(pendingStats => {
        set({ pendingStats });
      });
    });
  },
  
  subscribeToEventDetails: (eventId: string, userId?: string) => {
    return eventService.subscribeToEventDetails(eventId, userId, (event) => {
      set({ currentEvent: event });
    });
  },
})); 