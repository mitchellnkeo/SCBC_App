import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../../navigation/MainNavigator';
import TopNavbar from '../../components/navigation/TopNavbar';
import { monthlyBookService, MonthlyBook } from '../../services/monthlyBookService';
import { useAuthStore } from '../../stores/authStore';

type NavigationProp = StackNavigationProp<MainStackParamList>;

const MonthlyBookScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuthStore();
  const [currentBook, setCurrentBook] = useState<MonthlyBook | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCurrentBook = async () => {
    try {
      setLoading(true);
      const book = await monthlyBookService.getCurrentMonthlyBook();
      setCurrentBook(book);
    } catch (error) {
      console.error('Error loading current book:', error);
      Alert.alert('Error', 'Unable to load current book.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadCurrentBook();
    }, [])
  );

  const handleDiscussionSheetPress = async () => {
    if (!currentBook?.discussionSheetUrl) {
      Alert.alert('Error', 'Discussion sheet URL not available.');
      return;
    }

    try {
      const supported = await Linking.canOpenURL(currentBook.discussionSheetUrl);
      if (supported) {
        await Linking.openURL(currentBook.discussionSheetUrl);
      } else {
        Alert.alert(
          'Unable to open link',
          'Please copy the discussion sheet URL manually.',
          [
            {
              text: 'Copy URL',
              onPress: () => {
                // In a real app, you'd use Clipboard API here
                Alert.alert('URL', currentBook.discussionSheetUrl);
              },
            },
            { text: 'OK' },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to open discussion sheet.');
    }
  };

  const handleEditPress = () => {
    if (currentBook) {
      navigation.navigate('EditMonthlyBook', { bookId: currentBook.id });
    }
  };

  const InfoRow: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <TopNavbar title="Monthly Book" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ec4899" />
          <Text style={styles.loadingText}>Loading current book...</Text>
        </View>
      </View>
    );
  }

  if (!currentBook) {
    return (
      <View style={styles.container}>
        <TopNavbar title="Monthly Book" />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📚</Text>
          <Text style={styles.emptyTitle}>No Book Selected</Text>
          <Text style={styles.emptyText}>
            No monthly book has been set yet. Check back soon!
          </Text>
          {user?.role === 'admin' && (
            <TouchableOpacity
              style={styles.addBookButton}
              onPress={() => navigation.navigate('EditMonthlyBook', { bookId: 'new' })}
              activeOpacity={0.8}
            >
              <Text style={styles.addBookButtonText}>+ Add Monthly Book</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Navigation */}
      <TopNavbar title="Monthly Book" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.monthLabel}>{currentBook.month}</Text>
          <Text style={styles.headerTitle}>Book of the Month</Text>
          {user?.role === 'admin' && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditPress}
              activeOpacity={0.8}
            >
              <Text style={styles.editButtonText}>✏️ Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Book Card */}
        <View style={styles.bookCard}>
          {/* Book Cover Placeholder */}
          <View style={styles.bookCoverSection}>
            {currentBook.coverImageUrl ? (
              <Image source={{ uri: currentBook.coverImageUrl }} style={styles.bookCover} />
            ) : (
              <View style={styles.bookCoverPlaceholder}>
                <Text style={styles.bookEmoji}>📖</Text>
                <Text style={styles.placeholderText}>Book Cover</Text>
              </View>
            )}
          </View>

          {/* Book Details */}
          <View style={styles.bookDetails}>
            <Text style={styles.bookTitle}>{currentBook.title}</Text>
            <Text style={styles.bookAuthor}>by {currentBook.author}</Text>
            
            {currentBook.awards && currentBook.awards.length > 0 && (
              <View style={styles.awardsSection}>
                {currentBook.awards.map((award: string, index: number) => (
                  <View key={index} style={styles.awardBadge}>
                    <Text style={styles.awardText}>🏆 {award}</Text>
                  </View>
                ))}
              </View>
            )}

            <Text style={styles.bookDescription}>{currentBook.description}</Text>

            {/* Book Info */}
            <View style={styles.bookInfo}>
              <InfoRow label="Genre" value={currentBook.genre} />
              <InfoRow label="Pages" value={currentBook.pages} />
              <InfoRow label="Published" value={currentBook.publishedYear} />
            </View>
          </View>
        </View>

        {/* Why We Selected This Book */}
        <View style={styles.selectionCard}>
          <Text style={styles.selectionTitle}>Why We Selected This Book</Text>
          <Text style={styles.selectionText}>{currentBook.whySelected}</Text>
        </View>

        {/* Discussion Sheet Button */}
        <TouchableOpacity
          style={styles.discussionButton}
          onPress={handleDiscussionSheetPress}
          activeOpacity={0.8}
        >
          <View style={styles.discussionButtonContent}>
            <Text style={styles.discussionButtonIcon}>📝</Text>
            <View style={styles.discussionButtonText}>
              <Text style={styles.discussionButtonTitle}>Discussion Sheet</Text>
              <Text style={styles.discussionButtonSubtitle}>
                Access our reading guide and discussion questions
              </Text>
            </View>
            <Text style={styles.discussionButtonChevron}>›</Text>
          </View>
        </TouchableOpacity>

        {/* Reading Progress */}
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Join the Discussion</Text>
          <Text style={styles.progressText}>
            We'll be discussing this book at our next meetup. Use the discussion sheet to guide your reading and prepare thoughtful questions for our group conversation.
          </Text>
          
          <View style={styles.progressTips}>
            <Text style={styles.tipText}>💡 Take notes while reading</Text>
            <Text style={styles.tipText}>🤔 Consider the discussion questions</Text>
            <Text style={styles.tipText}>📚 Share your thoughts with the group</Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 20,
  },
  monthLabel: {
    fontSize: 16,
    color: '#ec4899',
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
  },
  bookCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  bookCoverSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  bookCover: {
    width: 160,
    height: 240,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  bookCoverPlaceholder: {
    width: 160,
    height: 240,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  bookEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
  bookDetails: {
    alignItems: 'center',
  },
  bookTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 32,
  },
  bookAuthor: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  awardsSection: {
    marginBottom: 16,
  },
  awardBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  awardText: {
    fontSize: 14,
    color: '#92400e',
    fontWeight: '600',
    textAlign: 'center',
  },
  bookDescription: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 26,
    textAlign: 'center',
    marginBottom: 20,
  },
  bookInfo: {
    width: '100%',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
  },
  selectionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  selectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  selectionText: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 26,
    textAlign: 'center',
  },
  discussionButton: {
    backgroundColor: '#ec4899',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  discussionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  discussionButtonIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  discussionButtonText: {
    flex: 1,
  },
  discussionButtonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  discussionButtonSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  discussionButtonChevron: {
    fontSize: 24,
    color: 'white',
    marginLeft: 8,
  },
  progressCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  progressText: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 26,
    textAlign: 'center',
    marginBottom: 20,
  },
  progressTips: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  tipText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 32,
  },
  // Loading states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
  },
  // Empty states
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  addBookButton: {
    backgroundColor: '#ec4899',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addBookButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Edit button
  editButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
  },
  editButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default MonthlyBookScreen; 