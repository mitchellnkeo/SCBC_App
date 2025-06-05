import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
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
      style={[styles.adminCard, bgColor === 'bg-yellow-50' && styles.adminCardHighlight]}
      className={`${bgColor} rounded-xl p-6 shadow-sm border border-gray-100 mb-4`}
    >
      <View style={styles.cardContent} className="flex-row items-start justify-between">
        <View style={styles.cardMain} className="flex-1">
          <View style={styles.cardHeader} className="flex-row items-center mb-2">
            <Text style={styles.cardIcon} className="text-2xl mr-3">{icon}</Text>
            <Text style={styles.cardTitle} className="text-lg font-semibold text-gray-900">{title}</Text>
            {badge && (
              <View style={styles.badge} className="bg-red-500 rounded-full px-2 py-1 ml-2">
                <Text style={styles.badgeText} className="text-white text-xs font-bold">{badge}</Text>
              </View>
            )}
          </View>
          <Text style={styles.cardDescription} className="text-gray-600">{description}</Text>
        </View>
        <Text style={styles.chevron} className="text-gray-400 text-xl">›</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} className="flex-1 bg-gray-50">
      {/* Header */}
      <View style={styles.header} className="bg-white border-b border-gray-200 px-6 py-6">
        <Text style={styles.headerTitle} className="text-3xl font-bold text-gray-900">Admin Panel</Text>
        <Text style={styles.headerSubtitle} className="text-gray-600 mt-2">
          Welcome back, {user?.displayName || 'Admin'}
        </Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} className="flex-1 p-6">
        {/* Stats Overview */}
        <View style={styles.section} className="mb-6">
          <Text style={styles.sectionTitle} className="text-xl font-bold text-gray-900 mb-4">Quick Stats</Text>
          <View style={styles.statsCard} className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl p-6">
            <Text style={styles.statsLabel} className="text-white text-lg font-semibold mb-2">Event Approvals</Text>
            <View style={styles.statsRow} className="flex-row items-baseline">
              <Text style={styles.statsNumber} className="text-white text-3xl font-bold mr-2">
                {pendingStats.totalPending}
              </Text>
              <Text style={styles.statsUnit} className="text-pink-100">pending events</Text>
            </View>
            <Text style={styles.statsDetail} className="text-pink-100 mt-1">
              {pendingStats.newThisWeek} new this week
            </Text>
          </View>
        </View>

        {/* Admin Actions */}
        <View style={styles.section} className="mb-6">
          <Text style={styles.sectionTitle} className="text-xl font-bold text-gray-900 mb-4">Admin Actions</Text>
          
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
        <View style={styles.section} className="mb-6">
          <Text style={styles.sectionTitle} className="text-xl font-bold text-gray-900 mb-4">Recent Activity</Text>
          <View style={styles.activityCard} className="bg-white rounded-xl p-6 border border-gray-100">
            <Text style={styles.activityPlaceholder} className="text-gray-600 text-center">
              📈 Activity feed coming soon...
            </Text>
          </View>
        </View>
      </ScrollView>
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
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827', // gray-900
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280', // gray-600
    marginTop: 8,
  },
  scrollView: {
    flex: 1,
    padding: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827', // gray-900
    marginBottom: 16,
  },
  statsCard: {
    backgroundColor: '#ec4899', // pink-500 fallback
    borderRadius: 12,
    padding: 24,
  },
  statsLabel: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statsNumber: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginRight: 8,
  },
  statsUnit: {
    color: '#fbcfe8', // pink-100
    fontSize: 16,
  },
  statsDetail: {
    color: '#fbcfe8', // pink-100
    fontSize: 14,
    marginTop: 4,
  },
  adminCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6', // gray-100
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  adminCardHighlight: {
    backgroundColor: '#fefce8', // yellow-50
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardMain: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827', // gray-900
  },
  badge: {
    backgroundColor: '#ef4444', // red-500
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardDescription: {
    fontSize: 16,
    color: '#6b7280', // gray-600
    lineHeight: 22,
  },
  chevron: {
    fontSize: 20,
    color: '#9ca3af', // gray-400
  },
  activityCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: '#f3f4f6', // gray-100
  },
  activityPlaceholder: {
    fontSize: 16,
    color: '#6b7280', // gray-600
    textAlign: 'center',
  },
});

export default AdminScreen; 