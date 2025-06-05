import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useEventStore } from '../../stores/eventStore';
import { useAuthStore } from '../../stores/authStore';

const AdminScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { 
    pendingStats, 
    loadPendingStats,
    error,
    clearError 
  } = useEventStore();

  useEffect(() => {
    loadPendingStats();
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      clearError();
    }
  }, [error]);

  const navigateToPendingEvents = () => {
    navigation.navigate('PendingEvents' as never);
  };

  const AdminCard: React.FC<{
    title: string;
    description: string;
    icon: string;
    badge?: string;
    onPress: () => void;
    bgColor?: string;
  }> = ({ title, description, icon, badge, onPress, bgColor = 'bg-white' }) => (
    <TouchableOpacity
      onPress={onPress}
      className={`${bgColor} rounded-xl p-6 shadow-sm border border-gray-100 mb-4`}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <View className="flex-row items-center mb-2">
            <Text className="text-2xl mr-3">{icon}</Text>
            <Text className="text-lg font-semibold text-gray-900">{title}</Text>
            {badge && (
              <View className="bg-red-500 rounded-full px-2 py-1 ml-2">
                <Text className="text-white text-xs font-bold">{badge}</Text>
              </View>
            )}
          </View>
          <Text className="text-gray-600">{description}</Text>
        </View>
        <Text className="text-gray-400 text-xl">›</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-6 py-6">
        <Text className="text-3xl font-bold text-gray-900">Admin Panel</Text>
        <Text className="text-gray-600 mt-2">
          Welcome back, {user?.displayName || 'Admin'}
        </Text>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 p-6">
        {/* Stats Overview */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">Quick Stats</Text>
          <View className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl p-6">
            <Text className="text-white text-lg font-semibold mb-2">Event Approvals</Text>
            <View className="flex-row items-baseline">
              <Text className="text-white text-3xl font-bold mr-2">
                {pendingStats.totalPending}
              </Text>
              <Text className="text-pink-100">pending events</Text>
            </View>
            <Text className="text-pink-100 mt-1">
              {pendingStats.newThisWeek} new this week
            </Text>
          </View>
        </View>

        {/* Admin Actions */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">Admin Actions</Text>
          
          <AdminCard
            title="Pending Events"
            description="Review and approve user-submitted events"
            icon="📋"
            badge={pendingStats.totalPending > 0 ? pendingStats.totalPending.toString() : undefined}
            onPress={navigateToPendingEvents}
            bgColor={pendingStats.totalPending > 0 ? 'bg-yellow-50' : 'bg-white'}
          />

          <AdminCard
            title="User Management"
            description="Manage user accounts and permissions"
            icon="👥"
            onPress={() => Alert.alert('Coming Soon', 'User management features will be available soon!')}
          />

          <AdminCard
            title="Content Moderation"
            description="Review flagged comments and content"
            icon="🛡️"
            onPress={() => Alert.alert('Coming Soon', 'Content moderation tools will be available soon!')}
          />

          <AdminCard
            title="Analytics"
            description="View app usage and engagement metrics"
            icon="📊"
            onPress={() => Alert.alert('Coming Soon', 'Analytics dashboard will be available soon!')}
          />

          <AdminCard
            title="App Settings"
            description="Configure app-wide settings and features"
            icon="⚙️"
            onPress={() => Alert.alert('Coming Soon', 'App settings will be available soon!')}
          />
        </View>

        {/* Recent Activity */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">Recent Activity</Text>
          <View className="bg-white rounded-xl p-6 border border-gray-100">
            <Text className="text-gray-600 text-center">
              📈 Activity feed coming soon...
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminScreen; 