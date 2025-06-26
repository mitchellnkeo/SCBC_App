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
  TextInput,
  Modal,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../../navigation/MainNavigator';
import TopNavbar from '../../components/navigation/TopNavbar';
import { monthlyBookService, MonthlyBook } from '../../services/monthlyBookService';
import { useAuthStore } from '../../stores/authStore';
import { useTheme } from '../../contexts/ThemeContext';
import LoadingState from '../../components/common/LoadingState';

type NavigationProp = StackNavigationProp<MainStackParamList>;

const MonthlyBookScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuthStore();
  const { theme } = useTheme();
  const [currentBook, setCurrentBook] = useState<MonthlyBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingMeeting, setEditingMeeting] = useState<'inPerson' | 'virtual' | null>(null);
  const [meetingFormData, setMeetingFormData] = useState({
    inPerson: { location: '', day: '', time: '' },
    virtual: { zoomLink: '', day: '', time: '' },
  });

  const loadCurrentBook = async () => {
    try {
      setLoading(true);
      const book = await monthlyBookService.getCurrentMonthlyBook();
      setCurrentBook(book);
      
      // Populate meeting form data
      if (book) {
        setMeetingFormData({
          inPerson: book.inPersonMeeting || { location: '', day: '', time: '' },
          virtual: book.virtualMeeting || { zoomLink: '', day: '', time: '' },
        });
      }
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
                Clipboard.setString(currentBook.discussionSheetUrl);
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

  const handleMeetingEdit = (type: 'inPerson' | 'virtual') => {
    setEditingMeeting(type);
  };

  const handleMeetingSave = async () => {
    if (!currentBook || !editingMeeting) return;

    try {
      const updateData: any = {};
      
      if (editingMeeting === 'inPerson') {
        updateData.inPersonMeeting = meetingFormData.inPerson;
      } else {
        updateData.virtualMeeting = meetingFormData.virtual;
      }

      await monthlyBookService.updateMonthlyBook(currentBook.id, updateData);
      
      // Update local state
      setCurrentBook({
        ...currentBook,
        ...updateData,
      });
      
      setEditingMeeting(null);
      Alert.alert('Success', 'Meeting details updated successfully!');
    } catch (error) {
      console.error('Error updating meeting details:', error);
      Alert.alert('Error', 'Failed to update meeting details.');
    }
  };

  const handleMeetingCancel = () => {
    // Reset form data to current book data
    if (currentBook) {
      setMeetingFormData({
        inPerson: currentBook.inPersonMeeting || { location: '', day: '', time: '' },
        virtual: currentBook.virtualMeeting || { zoomLink: '', day: '', time: '' },
      });
    }
    setEditingMeeting(null);
  };

  const handleZoomLinkPress = (zoomLink: string) => {
    Alert.alert(
      'Join Virtual Meeting',
      'How would you like to access the meeting?',
      [
        {
          text: 'Email Link to Myself',
          onPress: () => handleEmailZoomLink(zoomLink),
        },
        {
          text: 'Join from Phone',
          onPress: () => handleJoinFromPhone(zoomLink),
        },
        {
          text: 'Copy Link',
          onPress: () => handleCopyZoomLink(zoomLink),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const handleEmailZoomLink = async (zoomLink: string) => {
    if (!user?.email) {
      Alert.alert('Error', 'No email address found in your profile.');
      return;
    }

    const subject = encodeURIComponent('SCBC Virtual Meeting Link');
    const body = encodeURIComponent(
      `Hi,\n\nHere's the Zoom link for the Seattle Chinatown Book Club virtual meeting:\n\n${zoomLink}\n\nSee you there!\n\nBest regards,\nSCBC App`
    );
    const emailUrl = `mailto:${user.email}?subject=${subject}&body=${body}`;

    try {
      const supported = await Linking.canOpenURL(emailUrl);
      if (supported) {
        await Linking.openURL(emailUrl);
      } else {
        Alert.alert('Unable to open email', 'Please copy the Zoom link manually.');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to open email app.');
    }
  };

  const handleJoinFromPhone = async (zoomLink: string) => {
    try {
      const supported = await Linking.canOpenURL(zoomLink);
      if (supported) {
        await Linking.openURL(zoomLink);
      } else {
        Alert.alert('Unable to open link', 'Please copy the Zoom link manually.');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to open Zoom link.');
    }
  };

  const handleCopyZoomLink = async (zoomLink: string) => {
    try {
      await Clipboard.setStringAsync(zoomLink);
      Alert.alert('Link Copied', 'The Zoom meeting link has been copied to your clipboard.');
    } catch (error) {
      Alert.alert('Error', 'Unable to copy link to clipboard.');
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
    // Meeting cards
    meetingCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
      borderWidth: 1,
      borderColor: theme.border,
    },
    meetingHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    meetingTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
    },
    meetingEditButton: {
      backgroundColor: theme.primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
    },
    meetingEditButtonText: {
      color: 'white',
      fontSize: 12,
      fontWeight: '600',
    },
    meetingDetails: {
      gap: 12,
    },
    meetingDetailRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    meetingDetailLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.textSecondary,
      width: 80,
    },
    meetingDetailValue: {
      fontSize: 14,
      color: theme.text,
      flex: 1,
    },
    zoomLink: {
      fontSize: 14,
      color: theme.primary,
      textDecorationLine: 'underline',
      flex: 1,
    },
    emptyMeetingText: {
      fontSize: 14,
      color: theme.textTertiary,
      fontStyle: 'italic',
      textAlign: 'center',
    },
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 24,
      width: '90%',
      maxWidth: 400,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 20,
      textAlign: 'center',
    },
    inputGroup: {
      marginBottom: 16,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
    },
    textInput: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: theme.text,
      backgroundColor: theme.surface,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 20,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    saveButton: {
      backgroundColor: theme.primary,
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    cancelButtonText: {
      color: theme.textSecondary,
    },
    saveButtonText: {
      color: 'white',
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
        <TopNavbar title="Monthly Meeting Details" />
        <LoadingState text="Loading current book..." />
      </View>
    );
  }

  if (!currentBook) {
    return (
      <View style={dynamicStyles.container}>
        <TopNavbar title="Monthly Meeting Details" />
        <View style={dynamicStyles.emptyContainer}>
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
      <TopNavbar title="Monthly Meeting Details" />
      
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
              <Text style={dynamicStyles.editButtonText}>Edit</Text>
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
                    <Text style={dynamicStyles.awardText}>Award: {award}</Text>
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
            <View style={dynamicStyles.discussionButtonText}>
              <Text style={dynamicStyles.discussionButtonTitle}>Discussion Sheet</Text>
              <Text style={dynamicStyles.discussionButtonSubtitle}>
                Access our reading guide and discussion questions
              </Text>
            </View>
            <Text style={dynamicStyles.discussionButtonChevron}>›</Text>
          </View>
        </TouchableOpacity>

        {/* In-Person Meeting Details */}
        <View style={dynamicStyles.meetingCard}>
          <View style={dynamicStyles.meetingHeader}>
            <Text style={dynamicStyles.meetingTitle}>In-Person Meeting Details</Text>
            {user?.role === 'admin' && (
              <TouchableOpacity
                style={dynamicStyles.meetingEditButton}
                onPress={() => handleMeetingEdit('inPerson')}
                activeOpacity={0.8}
              >
                <Text style={dynamicStyles.meetingEditButtonText}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {currentBook.inPersonMeeting && 
           (currentBook.inPersonMeeting.location || currentBook.inPersonMeeting.day || currentBook.inPersonMeeting.time) ? (
            <View style={dynamicStyles.meetingDetails}>
              {currentBook.inPersonMeeting.location && (
                <View style={dynamicStyles.meetingDetailRow}>
                  <Text style={dynamicStyles.meetingDetailLabel}>Location:</Text>
                  <Text style={dynamicStyles.meetingDetailValue}>{currentBook.inPersonMeeting.location}</Text>
                </View>
              )}
              {currentBook.inPersonMeeting.day && (
                <View style={dynamicStyles.meetingDetailRow}>
                  <Text style={dynamicStyles.meetingDetailLabel}>Day:</Text>
                  <Text style={dynamicStyles.meetingDetailValue}>{currentBook.inPersonMeeting.day}</Text>
                </View>
              )}
              {currentBook.inPersonMeeting.time && (
                <View style={dynamicStyles.meetingDetailRow}>
                  <Text style={dynamicStyles.meetingDetailLabel}>Time:</Text>
                  <Text style={dynamicStyles.meetingDetailValue}>{currentBook.inPersonMeeting.time}</Text>
                </View>
              )}
            </View>
          ) : (
            <Text style={dynamicStyles.emptyMeetingText}>
              {user?.role === 'admin' ? 'No in-person meeting details set. Tap Edit to add details.' : 'In-person meeting details will be announced soon.'}
            </Text>
          )}
        </View>

        {/* Virtual Meeting Details */}
        <View style={dynamicStyles.meetingCard}>
          <View style={dynamicStyles.meetingHeader}>
            <Text style={dynamicStyles.meetingTitle}>Virtual Meeting Details</Text>
            {user?.role === 'admin' && (
              <TouchableOpacity
                style={dynamicStyles.meetingEditButton}
                onPress={() => handleMeetingEdit('virtual')}
                activeOpacity={0.8}
              >
                <Text style={dynamicStyles.meetingEditButtonText}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {currentBook.virtualMeeting && 
           (currentBook.virtualMeeting.zoomLink || currentBook.virtualMeeting.day || currentBook.virtualMeeting.time) ? (
            <View style={dynamicStyles.meetingDetails}>
              {currentBook.virtualMeeting.zoomLink && (
                <View style={dynamicStyles.meetingDetailRow}>
                  <Text style={dynamicStyles.meetingDetailLabel}>Zoom:</Text>
                  <TouchableOpacity onPress={() => handleZoomLinkPress(currentBook.virtualMeeting!.zoomLink)}>
                    <Text style={dynamicStyles.zoomLink}>Join Meeting</Text>
                  </TouchableOpacity>
                </View>
              )}
              {currentBook.virtualMeeting.day && (
                <View style={dynamicStyles.meetingDetailRow}>
                  <Text style={dynamicStyles.meetingDetailLabel}>Day:</Text>
                  <Text style={dynamicStyles.meetingDetailValue}>{currentBook.virtualMeeting.day}</Text>
                </View>
              )}
              {currentBook.virtualMeeting.time && (
                <View style={dynamicStyles.meetingDetailRow}>
                  <Text style={dynamicStyles.meetingDetailLabel}>Time:</Text>
                  <Text style={dynamicStyles.meetingDetailValue}>{currentBook.virtualMeeting.time}</Text>
                </View>
              )}
            </View>
          ) : (
            <Text style={dynamicStyles.emptyMeetingText}>
              {user?.role === 'admin' ? 'No virtual meeting details set. Tap Edit to add details.' : 'Virtual meeting details will be announced soon.'}
            </Text>
          )}
        </View>

        {/* Edit Meeting Modal */}
        <Modal
          visible={editingMeeting !== null}
          transparent={true}
          animationType="fade"
          onRequestClose={handleMeetingCancel}
        >
          <View style={dynamicStyles.modalOverlay}>
            <View style={dynamicStyles.modalContent}>
              <Text style={dynamicStyles.modalTitle}>
                {editingMeeting === 'inPerson' ? 'Edit In-Person Meeting' : 'Edit Virtual Meeting'}
              </Text>
              
              {editingMeeting === 'inPerson' ? (
                <>
                  <View style={dynamicStyles.inputGroup}>
                    <Text style={dynamicStyles.inputLabel}>Location</Text>
                    <TextInput
                      style={dynamicStyles.textInput}
                      value={meetingFormData.inPerson.location}
                      onChangeText={(text) => setMeetingFormData({
                        ...meetingFormData,
                        inPerson: { ...meetingFormData.inPerson, location: text }
                      })}
                      placeholder="e.g., Central Library, Room 204"
                      placeholderTextColor={theme.textTertiary}
                    />
                  </View>
                  <View style={dynamicStyles.inputGroup}>
                    <Text style={dynamicStyles.inputLabel}>Day</Text>
                    <TextInput
                      style={dynamicStyles.textInput}
                      value={meetingFormData.inPerson.day}
                      onChangeText={(text) => setMeetingFormData({
                        ...meetingFormData,
                        inPerson: { ...meetingFormData.inPerson, day: text }
                      })}
                      placeholder="e.g., Saturday, January 15th"
                      placeholderTextColor={theme.textTertiary}
                    />
                  </View>
                  <View style={dynamicStyles.inputGroup}>
                    <Text style={dynamicStyles.inputLabel}>Time</Text>
                    <TextInput
                      style={dynamicStyles.textInput}
                      value={meetingFormData.inPerson.time}
                      onChangeText={(text) => setMeetingFormData({
                        ...meetingFormData,
                        inPerson: { ...meetingFormData.inPerson, time: text }
                      })}
                      placeholder="e.g., 2:00 PM - 4:00 PM"
                      placeholderTextColor={theme.textTertiary}
                    />
                  </View>
                </>
              ) : (
                <>
                  <View style={dynamicStyles.inputGroup}>
                    <Text style={dynamicStyles.inputLabel}>Zoom Link</Text>
                    <TextInput
                      style={dynamicStyles.textInput}
                      value={meetingFormData.virtual.zoomLink}
                      onChangeText={(text) => setMeetingFormData({
                        ...meetingFormData,
                        virtual: { ...meetingFormData.virtual, zoomLink: text }
                      })}
                      placeholder="https://zoom.us/j/..."
                      placeholderTextColor={theme.textTertiary}
                      autoCapitalize="none"
                    />
                  </View>
                  <View style={dynamicStyles.inputGroup}>
                    <Text style={dynamicStyles.inputLabel}>Day</Text>
                    <TextInput
                      style={dynamicStyles.textInput}
                      value={meetingFormData.virtual.day}
                      onChangeText={(text) => setMeetingFormData({
                        ...meetingFormData,
                        virtual: { ...meetingFormData.virtual, day: text }
                      })}
                      placeholder="e.g., Sunday, January 16th"
                      placeholderTextColor={theme.textTertiary}
                    />
                  </View>
                  <View style={dynamicStyles.inputGroup}>
                    <Text style={dynamicStyles.inputLabel}>Time</Text>
                    <TextInput
                      style={dynamicStyles.textInput}
                      value={meetingFormData.virtual.time}
                      onChangeText={(text) => setMeetingFormData({
                        ...meetingFormData,
                        virtual: { ...meetingFormData.virtual, time: text }
                      })}
                      placeholder="e.g., 7:00 PM - 9:00 PM"
                      placeholderTextColor={theme.textTertiary}
                    />
                  </View>
                </>
              )}
              
              <View style={dynamicStyles.modalButtons}>
                <TouchableOpacity
                  style={[dynamicStyles.modalButton, dynamicStyles.cancelButton]}
                  onPress={handleMeetingCancel}
                  activeOpacity={0.8}
                >
                  <Text style={[dynamicStyles.modalButtonText, dynamicStyles.cancelButtonText]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[dynamicStyles.modalButton, dynamicStyles.saveButton]}
                  onPress={handleMeetingSave}
                  activeOpacity={0.8}
                >
                  <Text style={[dynamicStyles.modalButtonText, dynamicStyles.saveButtonText]}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <View style={dynamicStyles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

export default MonthlyBookScreen;