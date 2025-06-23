import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useEventStore } from '../../stores/eventStore';
import { useAuthStore } from '../../stores/authStore';
import TopNavbar from '../../components/navigation/TopNavbar';
import { useTheme } from '../../contexts/ThemeContext';

const AdminScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { theme } = useTheme();
  const { 
    pendingStats, 
    loadPendingStats,
    error,
    clearError 
  } = useEventStore();

  const styles = createStyles(theme);

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
      style={[
        styles.adminCard, 
        bgColor === 'bg-yellow-50' && styles.adminCardHighlight
      ]}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardMain}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>{icon}</Text>
            <Text style={styles.cardTitle}>{title}</Text>
            {badge && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            )}
          </View>
          <Text style={styles.cardDescription}>{description}</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Top Navigation */}
      <TopNavbar title="Admin Panel" />
      
      {/* Sub Header */}
      <View style={styles.subHeader}>
        <Text style={styles.headerSubtitle}>
          Welcome back, {user?.displayName || 'Admin'}
        </Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView}>
        {/* Stats Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.statsCard}>
            <Text style={styles.statsLabel}>Event Approvals</Text>
            <View style={styles.statsRow}>
              <Text style={styles.statsNumber}>
                {pendingStats.totalPending}
              </Text>
              <Text style={styles.statsUnit}>pending events</Text>
            </View>
            <Text style={styles.statsDetail}>
              {pendingStats.newThisWeek} new this week
            </Text>
          </View>
        </View>

        {/* Admin Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Admin Actions</Text>
          
          <AdminCard
            title="Pending Events"
            description="Review and approve user-submitted events"
            icon=""
            badge={pendingStats.totalPending > 0 ? pendingStats.totalPending.toString() : undefined}
            onPress={navigateToPendingEvents}
            bgColor={pendingStats.totalPending > 0 ? 'bg-yellow-50' : 'bg-white'}
          />

          <AdminCard
            icon=""
            title="Monthly Meeting Details"
            description="Manage the current monthly book and meeting details"
            onPress={() => navigation.navigate('MonthlyBook' as never)}
          />

          <AdminCard
            title="WhatsApp Community Chat"
            description="Manage the WhatsApp community invitation link"
            icon=""
            onPress={() => navigation.navigate('WhatsAppCommunity' as never)}
          />

          <AdminCard
            title="User Management"
            description="Manage user accounts and permissions"
            icon=""
            onPress={() => navigation.navigate('UserManagement' as never)}
          />

          <AdminCard
            title="Content Moderation"
            description="Review flagged comments and content"
            icon=""
            onPress={() => Alert.alert('Coming Soon', 'Content moderation tools will be available soon!')}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  subHeader: {
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  headerSubtitle: {
    fontSize: 16,
    color: theme.textSecondary,
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
    color: theme.text,
    marginBottom: 16,
  },
  statsCard: {
    backgroundColor: theme.primary,
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
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
  },
  statsDetail: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 4,
  },
  adminCard: {
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  adminCardHighlight: {
    backgroundColor: theme.warning + '20', // 20% opacity
    borderColor: theme.warning,
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
    color: theme.text,
  },
  badge: {
    backgroundColor: theme.error,
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
    color: theme.textSecondary,
    lineHeight: 22,
  },
  chevron: {
    fontSize: 20,
    color: theme.textTertiary,
  },
});

export default AdminScreen; 