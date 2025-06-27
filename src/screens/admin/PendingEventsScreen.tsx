import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  Alert, 
  TextInput,

  RefreshControl,
  StyleSheet,

  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEventStore } from '../../stores/eventStore';
import { useAuthStore } from '../../stores/authStore';
import { BookClubEvent, ApprovalFormData } from '../../types';
import { format } from 'date-fns';
import AddressAction from '../../components/common/AddressAction';
import { Button } from '../../components/common/Button';
import { BottomSheetModal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { formatDate, formatTimeRange } from '../../utils/dateTimeUtils';
import TopNavbar from '../../components/navigation/TopNavbar';

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
          <AddressAction address={event.address}>
            <Text className="text-gray-600 text-sm">{event.address}</Text>
          </AddressAction>
          {event.maxAttendees && (
            <Text className="text-gray-600">👥 Max {event.maxAttendees} attendees</Text>
          )}
        </View>

        {/* Description */}
        <Text className="text-gray-700 mb-4" numberOfLines={3}>
          {event.description}
        </Text>

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Button
            title="✓ Approve"
            onPress={() => handleEventAction(event, 'approve')}
            disabled={isApproving}
            variant="success"
            size="medium"
            style={{ flex: 1 }}
          />
          
          <Button
            title="✗ Reject"
            onPress={() => handleEventAction(event, 'reject')}
            disabled={isApproving}
            variant="error"
            size="medium"
            style={{ flex: 1 }}
          />
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
      <BottomSheetModal
        visible={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        keyboardAvoiding={true}
      >
              <Text style={styles.modalTitle} className="text-xl font-bold text-gray-900 mb-4">
                {actionType === 'approve' ? 'Approve Event' : 'Reject Event'}
              </Text>
              
              {selectedEvent && (
                <Text style={styles.modalSubtitle} className="text-gray-700 mb-4">
                  "{selectedEvent.title}" by {selectedEvent.hostName}
                </Text>
              )}

              {actionType === 'reject' && (
                <Input
                  label="Rejection Reason (optional)"
                  value={rejectionReason}
                  onChangeText={setRejectionReason}
                  placeholder="e.g., Inappropriate content, duplicate event, etc."
                  multiline
                  numberOfLines={3}
                  variant="outlined"
                />
              )}

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Button
                  title="Cancel"
                  onPress={() => setShowApprovalModal(false)}
                  disabled={isApproving}
                  variant="secondary"
                  size="large"
                  style={{ flex: 1 }}
                />
                
                <Button
                  title={isApproving ? 'Processing...' : 
                         actionType === 'approve' ? 'Approve' : 'Reject'}
                  onPress={confirmAction}
                  disabled={isApproving}
                  loading={isApproving}
                  variant={actionType === 'approve' ? 'success' : 'error'}
                  size="large"
                  style={{ flex: 1 }}
                />
              </View>
      </BottomSheetModal>
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



});

export default PendingEventsScreen; 