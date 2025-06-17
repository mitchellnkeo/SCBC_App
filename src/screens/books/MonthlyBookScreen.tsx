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
import { useTheme } from '../../contexts/ThemeContext';

type NavigationProp = StackNavigationProp<MainStackParamList>;

const MonthlyBookScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuthStore();
  const { theme } = useTheme();
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

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
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
      color: theme.primary,
      fontWeight: '600',
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.text,
      textAlign: 'center',
    },
    bookCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 24,
      marginBottom: 20,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
      borderWidth: 1,
      borderColor: theme.border,
    },
    bookCoverSection: {
      alignItems: 'center',
      marginBottom: 24,
    },
    bookCover: {
      width: 160,
      height: 240,
      borderRadius: 8,
      resizeMode: 'contain',
      backgroundColor: theme.surface,
    },
    bookCoverPlaceholder: {
      width: 160,
      height: 240,
      backgroundColor: theme.surface,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.border,
      borderStyle: 'dashed',
    },
    bookEmoji: {
      fontSize: 48,
      marginBottom: 8,
    },
    placeholderText: {
      fontSize: 14,
      color: theme.textTertiary,
      fontWeight: '500',
    },
    bookDetails: {
      alignItems: 'center',
    },
    bookTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.text,
      textAlign: 'center',
      marginBottom: 8,
      lineHeight: 32,
    },
    bookAuthor: {
      fontSize: 18,
      color: theme.textSecondary,
      marginBottom: 16,
      fontStyle: 'italic',
    },
    awardsSection: {
      marginBottom: 16,
    },
    awardBadge: {
      backgroundColor: theme.warning + '20', // Add transparency
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: theme.warning + '40',
    },
    awardText: {
      fontSize: 14,
      color: theme.warning,
      fontWeight: '600',
      textAlign: 'center',
    },
    bookDescription: {
      fontSize: 16,
      color: theme.textSecondary,
      lineHeight: 26,
      textAlign: 'center',
      marginBottom: 20,
    },
    bookInfo: {
      width: '100%',
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.borderLight,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    infoLabel: {
      fontSize: 14,
      color: theme.textSecondary,
      fontWeight: '500',
    },
    infoValue: {
      fontSize: 14,
      color: theme.text,
      fontWeight: '600',
    },
    selectionCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 24,
      marginBottom: 20,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
      borderWidth: 1,
      borderColor: theme.border,
    },
    selectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 12,
      textAlign: 'center',
    },
    selectionText: {
      fontSize: 16,
      color: theme.textSecondary,
      lineHeight: 26,
      textAlign: 'center',
    },
    discussionButton: {
      backgroundColor: theme.primary,
      borderRadius: 16,
      marginBottom: 20,
      shadowColor: theme.shadow,
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
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 24,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
      borderWidth: 1,
      borderColor: theme.border,
    },
    progressTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 12,
      textAlign: 'center',
    },
    progressText: {
      fontSize: 16,
      color: theme.textSecondary,
      lineHeight: 26,
      textAlign: 'center',
      marginBottom: 20,
    },
    progressTips: {
      backgroundColor: theme.success + '10', // Light success background
      borderRadius: 12,
      padding: 16,
      borderLeftWidth: 4,
      borderLeftColor: theme.success,
    },
    tipText: {
      fontSize: 14,
      color: theme.textSecondary,
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
      color: theme.textSecondary,
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
      color: theme.text,
      marginBottom: 12,
      textAlign: 'center',
    },
    emptyText: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 24,
    },
    addBookButton: {
      backgroundColor: theme.primary,
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
      backgroundColor: theme.surface,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      marginTop: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    editButtonText: {
      color: theme.textSecondary,
      fontSize: 14,
      fontWeight: '600',
    },
  });

  const InfoRow: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <View style={dynamicStyles.infoRow}>
      <Text style={dynamicStyles.infoLabel}>{label}:</Text>
      <Text style={dynamicStyles.infoValue}>{value}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={dynamicStyles.container}>
        <TopNavbar title="Monthly Book" />
        <View style={dynamicStyles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={dynamicStyles.loadingText}>Loading current book...</Text>
        </View>
      </View>
    );
  }

  if (!currentBook) {
    return (
      <View style={dynamicStyles.container}>
        <TopNavbar title="Monthly Book" />
        <View style={dynamicStyles.emptyContainer}>
          <Text style={dynamicStyles.emptyEmoji}>📚</Text>
          <Text style={dynamicStyles.emptyTitle}>No Book Selected</Text>
          <Text style={dynamicStyles.emptyText}>
            No monthly book has been set yet. Check back soon!
          </Text>
          {user?.role === 'admin' && (
            <TouchableOpacity
              style={dynamicStyles.addBookButton}
              onPress={() => navigation.navigate('EditMonthlyBook', { bookId: 'new' })}
              activeOpacity={0.8}
            >
              <Text style={dynamicStyles.addBookButtonText}>+ Add Monthly Book</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={dynamicStyles.container}>
      {/* Top Navigation */}
      <TopNavbar title="Monthly Book" />
      
      <ScrollView 
        style={dynamicStyles.scrollView}
        contentContainerStyle={dynamicStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={dynamicStyles.header}>
          <Text style={dynamicStyles.monthLabel}>{currentBook.month}</Text>
          <Text style={dynamicStyles.headerTitle}>Book of the Month</Text>
          {user?.role === 'admin' && (
            <TouchableOpacity
              style={dynamicStyles.editButton}
              onPress={handleEditPress}
              activeOpacity={0.8}
            >
              <Text style={dynamicStyles.editButtonText}>✏️ Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Book Card */}
        <View style={dynamicStyles.bookCard}>
          {/* Book Cover Placeholder */}
          <View style={dynamicStyles.bookCoverSection}>
            {currentBook.coverImageUrl ? (
              <Image source={{ uri: currentBook.coverImageUrl }} style={dynamicStyles.bookCover} />
            ) : (
              <View style={dynamicStyles.bookCoverPlaceholder}>
                <Text style={dynamicStyles.bookEmoji}>📖</Text>
                <Text style={dynamicStyles.placeholderText}>Book Cover</Text>
              </View>
            )}
          </View>

          {/* Book Details */}
          <View style={dynamicStyles.bookDetails}>
            <Text style={dynamicStyles.bookTitle}>{currentBook.title}</Text>
            <Text style={dynamicStyles.bookAuthor}>by {currentBook.author}</Text>
            
            {currentBook.awards && currentBook.awards.length > 0 && (
              <View style={dynamicStyles.awardsSection}>
                {currentBook.awards.map((award: string, index: number) => (
                  <View key={index} style={dynamicStyles.awardBadge}>
                    <Text style={dynamicStyles.awardText}>🏆 {award}</Text>
                  </View>
                ))}
              </View>
            )}

            <Text style={dynamicStyles.bookDescription}>{currentBook.description}</Text>

            {/* Book Info */}
            <View style={dynamicStyles.bookInfo}>
              <InfoRow label="Genre" value={currentBook.genre} />
              <InfoRow label="Pages" value={currentBook.pages} />
              <InfoRow label="Published" value={currentBook.publishedYear} />
            </View>
          </View>
        </View>

        {/* Why We Selected This Book */}
        <View style={dynamicStyles.selectionCard}>
          <Text style={dynamicStyles.selectionTitle}>Why We Selected This Book</Text>
          <Text style={dynamicStyles.selectionText}>{currentBook.whySelected}</Text>
        </View>

        {/* Discussion Sheet Button */}
        <TouchableOpacity
          style={dynamicStyles.discussionButton}
          onPress={handleDiscussionSheetPress}
          activeOpacity={0.8}
        >
          <View style={dynamicStyles.discussionButtonContent}>
            <Text style={dynamicStyles.discussionButtonIcon}>📝</Text>
            <View style={dynamicStyles.discussionButtonText}>
              <Text style={dynamicStyles.discussionButtonTitle}>Discussion Sheet</Text>
              <Text style={dynamicStyles.discussionButtonSubtitle}>
                Access our reading guide and discussion questions
              </Text>
            </View>
            <Text style={dynamicStyles.discussionButtonChevron}>›</Text>
          </View>
        </TouchableOpacity>

        {/* Reading Progress */}
        <View style={dynamicStyles.progressCard}>
          <Text style={dynamicStyles.progressTitle}>Join the Discussion</Text>
          <Text style={dynamicStyles.progressText}>
            We'll be discussing this book at our next meetup. Use the discussion sheet to guide your reading and prepare thoughtful questions for our group conversation.
          </Text>
          
          <View style={dynamicStyles.progressTips}>
            <Text style={dynamicStyles.tipText}>💡 Take notes while reading</Text>
            <Text style={dynamicStyles.tipText}>🤔 Consider the discussion questions</Text>
            <Text style={dynamicStyles.tipText}>📚 Share your thoughts with the group</Text>
          </View>
        </View>

        <View style={dynamicStyles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

export default MonthlyBookScreen;