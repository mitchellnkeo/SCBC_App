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
  RefreshControl
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
            📅 {format(event.date, 'EEEE, MMMM d, yyyy')} at {event.time}
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
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-4">
        <Text className="text-2xl font-bold text-gray-900">Pending Events</Text>
        <View className="flex-row items-center mt-2">
          <Text className="text-gray-600">
            {pendingStats.totalPending} pending • {pendingStats.newThisWeek} new this week
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView 
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
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-xl font-bold text-gray-900 mb-4">
              {actionType === 'approve' ? 'Approve Event' : 'Reject Event'}
            </Text>
            
            {selectedEvent && (
              <Text className="text-gray-700 mb-4">
                "{selectedEvent.title}" by {selectedEvent.hostName}
              </Text>
            )}

            {actionType === 'reject' && (
              <View className="mb-4">
                <Text className="text-gray-700 font-medium mb-2">
                  Rejection Reason (optional):
                </Text>
                <TextInput
                  value={rejectionReason}
                  onChangeText={setRejectionReason}
                  placeholder="e.g., Inappropriate content, duplicate event, etc."
                  multiline
                  numberOfLines={3}
                  className="border border-gray-300 rounded-lg p-3 text-gray-900"
                  textAlignVertical="top"
                />
              </View>
            )}

            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => setShowApprovalModal(false)}
                className="flex-1 border border-gray-300 py-3 rounded-lg items-center"
                disabled={isApproving}
              >
                <Text className="text-gray-700 font-semibold">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={confirmAction}
                disabled={isApproving}
                className={`flex-1 py-3 rounded-lg items-center ${
                  actionType === 'approve' ? 'bg-green-500' : 'bg-red-500'
                }`}
              >
                <Text className="text-white font-semibold">
                  {isApproving ? 'Processing...' : 
                   actionType === 'approve' ? 'Approve' : 'Reject'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default PendingEventsScreen; 