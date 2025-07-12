import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../stores/authStore';
import { announcementService } from '../services/announcementService';
import Card from '../components/common/Card';
import { Button } from '../components/common/Button';
import LoadingState from '../components/common/LoadingState';
import ErrorMessage from '../components/common/ErrorMessage';
import { formatFullDate } from '../utils/dateTimeUtils';
import TopNavbar from '../components/navigation/TopNavbar';

interface Announcement {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: any;
}

const AnnouncementsScreen: React.FC = () => {
  const { user } = useAuthStore();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = user?.role === 'admin';

  const loadAnnouncements = async (showRefresh = false) => {
    try {
      setError(null);
      if (!showRefresh) {
        setIsLoading(true);
      }
      
      const result = await announcementService.getAnnouncements();
      setAnnouncements(result.announcements);
    } catch (err: any) {
      console.error('Error loading announcements:', err);
      setError(err.message || 'Failed to load announcements');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadAnnouncements(true);
  };

  const handleSubmitAnnouncement = async () => {
    if (!newAnnouncement.trim()) {
      Alert.alert('Error', 'Please enter an announcement');
      return;
    }

    try {
      setIsSubmitting(true);
      await announcementService.createAnnouncement(newAnnouncement.trim());
      setNewAnnouncement('');
      await loadAnnouncements(true);
      Alert.alert('Success', 'Announcement posted successfully');
    } catch (err: any) {
      console.error('Error creating announcement:', err);
      Alert.alert('Error', err.message || 'Failed to post announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    Alert.alert(
      'Delete Announcement',
      'Are you sure you want to delete this announcement?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await announcementService.deleteAnnouncement(announcementId);
              await loadAnnouncements(true);
              Alert.alert('Success', 'Announcement deleted successfully');
            } catch (err: any) {
              console.error('Error deleting announcement:', err);
              Alert.alert('Error', err.message || 'Failed to delete announcement');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return <LoadingState text="Loading announcements..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <TopNavbar title="Announcements" />
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Announcements</Text>
          <Text style={styles.subtitle}>Stay updated with the latest news</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
        >
          {error && <ErrorMessage error={error} onRetry={() => loadAnnouncements()} />}

          {/* Admin Announcement Form */}
          {isAdmin && (
            <Card style={styles.adminForm}>
              <Text style={styles.adminFormTitle}>Post New Announcement</Text>
              <TextInput
                style={styles.announcementInput}
                placeholder="Enter your announcement..."
                value={newAnnouncement}
                onChangeText={setNewAnnouncement}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <Button
                title={isSubmitting ? 'Posting...' : 'Post Announcement'}
                onPress={handleSubmitAnnouncement}
                disabled={isSubmitting || !newAnnouncement.trim()}
                style={styles.submitButton}
              />
            </Card>
          )}

          {/* Announcements List */}
          {announcements.length === 0 ? (
            <Card style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No announcements yet</Text>
              <Text style={styles.emptyStateSubtext}>
                {isAdmin ? 'Be the first to post an announcement!' : 'Check back later for updates'}
              </Text>
            </Card>
          ) : (
            announcements.map((announcement) => (
              <Card key={announcement.id} style={styles.announcementCard}>
                <View style={styles.announcementHeader}>
                  <View style={styles.authorInfo}>
                    <Text style={styles.authorName}>{announcement.authorName}</Text>
                    <Text style={styles.timestamp}>
                      {formatFullDate(announcement.createdAt)}
                    </Text>
                  </View>
                  {isAdmin && (
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteAnnouncement(announcement.id)}
                    >
                      <Text style={styles.deleteButtonText}>×</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.announcementContent}>{announcement.content}</Text>
              </Card>
            ))
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 0,
  },
  adminForm: {
    marginBottom: 24,
  },
  adminFormTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  announcementInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#ffffff',
    minHeight: 100,
    marginBottom: 16,
  },
  submitButton: {
    alignSelf: 'flex-end',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  announcementCard: {
    marginBottom: 16,
  },
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 14,
    color: '#6b7280',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  announcementContent: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
});

export default AnnouncementsScreen; 