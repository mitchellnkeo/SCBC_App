import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  Alert, 
  TextInput,
  Modal,
  RefreshControl,
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEventStore } from '../../stores/eventStore';
import { useAuthStore } from '../../stores/authStore';
import { BookClubEvent, ApprovalFormData } from '../../types';
import { format } from 'date-fns';

const PendingEventsScreen: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    pendingEvents, 
    pendingStats,
    isLoading, 
    isApproving,
    error,
    loadPendingEvents,
    loadPendingStats,
    approveEvent,
    subscribeToPendingEvents,
    clearError 
  } = useEventStore();

  const [selectedEvent, setSelectedEvent] = useState<BookClubEvent | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');

  useEffect(() => {
    loadPendingEvents();
    loadPendingStats();
    
    // Set up real-time subscription
    const unsubscribe = subscribeToPendingEvents();
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      clearError();
    }
  }, [error]);

  const handleEventAction = (event: BookClubEvent, action: 'approve' | 'reject') => {
    setSelectedEvent(event);
    setActionType(action);
    setRejectionReason('');
    setShowApprovalModal(true);
  };

  const confirmAction = async () => {
    if (!selectedEvent || !user) return;

    const approvalData: ApprovalFormData = {
      action: actionType,
      rejectionReason: actionType === 'reject' ? rejectionReason : undefined,
    };

    try {
      await approveEvent(selectedEvent.id, user.id, approvalData);
      setShowApprovalModal(false);
      setSelectedEvent(null);
      
      Alert.alert(
        'Success', 
        `Event ${actionType === 'approve' ? 'approved' : 'rejected'} successfully!`
      );
    } catch (error) {
      console.error('Error processing approval:', error);
    }
  };

  const renderEventCard = (event: BookClubEvent) => (
    <View key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4 overflow-hidden">
      {/* Header Image */}
      {event.headerPhoto && (
        <Image 
          source={{ uri: event.headerPhoto }}
          className="w-full h-48"
          resizeMode="cover"
        />
      )}
      
      {/* Event Content */}
      <View className="p-4">
        {/* Status Badge */}
        <View className="flex-row items-center mb-3">
          <View className="bg-yellow-100 px-3 py-1 rounded-full">
            <Text className="text-yellow-800 text-sm font-medium">Pending Approval</Text>
          </View>
          <Text className="text-gray-500 text-sm ml-auto">
            {format(event.createdAt, 'MMM d, h:mm a')}
          </Text>
        </View>

        {/* Title */}
        <Text className="text-xl font-bold text-gray-900 mb-2">{event.title}</Text>
        
        {/* Host Info */}
        <View className="flex-row items-center mb-3">
          {event.hostProfilePicture ? (
            <Image 
              source={{ uri: event.hostProfilePicture }}
              className="w-8 h-8 rounded-full mr-2"
            />
          ) : (
            <View className="w-8 h-8 rounded-full bg-pink-500 mr-2 items-center justify-center">
              <Text className="text-white text-sm font-bold">
                {event.hostName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <Text className="text-gray-700 font-medium">Hosted by {event.hostName}</Text>
        </View>

        {/* Event Details */}
        <View className="space-y-2 mb-4">
          <Text className="text-gray-600">
            📅 {format(event.date, 'EEEE, MMMM d, yyyy')} at {
              event.startTime && event.endTime 
                ? `${event.startTime} - ${event.endTime}`
                : event.startTime || 'Time TBD'
            }
          </Text>
          <Text className="text-gray-600">📍 {event.location}</Text>
          <Text className="text-gray-600 text-sm">{event.address}</Text>
          {event.maxAttendees && (
            <Text className="text-gray-600">👥 Max {event.maxAttendees} attendees</Text>
          )}
        </View>

        {/* Description */}
        <Text className="text-gray-700 mb-4" numberOfLines={3}>
          {event.description}
        </Text>

        {/* Action Buttons */}
        <View className="flex-row space-x-3">
          <TouchableOpacity
            onPress={() => handleEventAction(event, 'approve')}
            disabled={isApproving}
            className="flex-1 bg-green-500 py-3 rounded-lg items-center"
          >
            <Text className="text-white font-semibold">✓ Approve</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => handleEventAction(event, 'reject')}
            disabled={isApproving}
            className="flex-1 bg-red-500 py-3 rounded-lg items-center"
          >
            <Text className="text-white font-semibold">✗ Reject</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center px-6 py-12">
      <Text className="text-6xl mb-4">✅</Text>
      <Text className="text-xl font-semibold text-gray-900 mb-2">All Caught Up!</Text>
      <Text className="text-gray-600 text-center">
        No pending events to review. All submissions have been processed.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} className="flex-1 bg-gray-50">
      {/* Header */}
      <View style={styles.header} className="bg-white border-b border-gray-200 px-4 py-4">
        <Text style={styles.headerTitle} className="text-2xl font-bold text-gray-900">Pending Events</Text>
        <View className="flex-row items-center mt-2">
          <Text style={styles.headerSubtitle} className="text-gray-600">
            {pendingStats.totalPending} pending • {pendingStats.newThisWeek} new this week
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl 
            refreshing={isLoading} 
            onRefresh={() => {
              loadPendingEvents();
              loadPendingStats();
            }}
          />
        }
      >
        {pendingEvents.length === 0 ? renderEmptyState() : (
          pendingEvents.map(renderEventCard)
        )}
      </ScrollView>

      {/* Approval Modal */}
      <Modal
        visible={showApprovalModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowApprovalModal(false)}
      >
        <View style={styles.modalOverlay} className="flex-1 bg-black/50 justify-end">
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingView}
          >
            <View style={styles.modalContent} className="bg-white rounded-t-3xl p-6">
              <Text style={styles.modalTitle} className="text-xl font-bold text-gray-900 mb-4">
                {actionType === 'approve' ? 'Approve Event' : 'Reject Event'}
              </Text>
              
              {selectedEvent && (
                <Text style={styles.modalSubtitle} className="text-gray-700 mb-4">
                  "{selectedEvent.title}" by {selectedEvent.hostName}
                </Text>
              )}

              {actionType === 'reject' && (
                <View className="mb-4">
                  <Text style={styles.inputLabel} className="text-gray-700 font-medium mb-2">
                    Rejection Reason (optional):
                  </Text>
                  <TextInput
                    value={rejectionReason}
                    onChangeText={setRejectionReason}
                    placeholder="e.g., Inappropriate content, duplicate event, etc."
                    multiline
                    numberOfLines={3}
                    style={styles.textInput}
                    className="border border-gray-300 rounded-lg p-3 text-gray-900"
                    textAlignVertical="top"
                  />
                </View>
              )}

              <View className="flex-row space-x-3">
                <TouchableOpacity
                  onPress={() => setShowApprovalModal(false)}
                  style={styles.cancelButton}
                  className="flex-1 border border-gray-300 py-3 rounded-lg items-center"
                  disabled={isApproving}
                >
                  <Text style={styles.cancelButtonText} className="text-gray-700 font-semibold">Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={confirmAction}
                  disabled={isApproving}
                  style={[styles.actionButton, actionType === 'approve' ? styles.approveButton : styles.rejectButton]}
                  className={`flex-1 py-3 rounded-lg items-center ${
                    actionType === 'approve' ? 'bg-green-500' : 'bg-red-500'
                  }`}
                >
                  <Text style={styles.actionButtonText} className="text-white font-semibold">
                    {isApproving ? 'Processing...' : 
                     actionType === 'approve' ? 'Approve' : 'Reject'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb', // gray-50
  },
  header: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb', // gray-200
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827', // gray-900
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280', // gray-600
  },
  scrollView: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827', // gray-900
    marginBottom: 16,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#374151', // gray-700
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151', // gray-700
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db', // gray-300
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827', // gray-900
    backgroundColor: 'white',
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db', // gray-300
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#374151', // gray-700
    fontWeight: '600',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: '#10b981', // green-500
  },
  rejectButton: {
    backgroundColor: '#ef4444', // red-500
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
});

export default PendingEventsScreen; 