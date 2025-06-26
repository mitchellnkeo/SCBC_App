import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../stores/authStore';
import TopNavbar from '../../components/navigation/TopNavbar';
import { useTheme } from '../../contexts/ThemeContext';
import {
  FAQ,
  CreateFAQData,
  EditFAQData,
  getPublishedFAQs,
  getAllFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  getFAQStats,
  createDefaultFAQs
} from '../../services/faqService';
import LoadingState from '../../components/common/LoadingState';

interface FAQStats {
  totalFAQs: number;
  publishedFAQs: number;
}

const FAQScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { theme } = useTheme();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [faqStats, setFaqStats] = useState<FAQStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(user?.role === 'admin');
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [questionText, setQuestionText] = useState('');
  const [answerText, setAnswerText] = useState('');
  const [isPublished, setIsPublished] = useState(true);

  const styles = createStyles(theme);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    loadFAQs();
  }, [isAdminMode]);

  const loadFAQs = async () => {
    try {
      setIsLoading(true);
      const [allFaqs, stats] = await Promise.all([
        getAllFAQs(),
        getFAQStats()
      ]);
      setFaqs(allFaqs);
      setFaqStats(stats);
    } catch (error) {
      console.error('Error loading FAQs:', error);
      Alert.alert('Error', 'Failed to load FAQs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadFAQs();
    setIsRefreshing(false);
  };

  const toggleFAQ = (faqId: string) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  const openEditModal = (faq?: FAQ) => {
    if (faq) {
      setEditingFAQ(faq);
      setQuestionText(faq.question);
      setAnswerText(faq.answer);
      setIsPublished(faq.isPublished);
    } else {
      setEditingFAQ(null);
      setQuestionText('');
      setAnswerText('');
      setIsPublished(true);
    }
    setIsEditModalVisible(true);
  };

  const closeEditModal = () => {
    setIsEditModalVisible(false);
    setEditingFAQ(null);
    setQuestionText('');
    setAnswerText('');
    setIsPublished(true);
  };

  const handleSaveFAQ = async () => {
    if (!questionText.trim() || !answerText.trim()) {
      Alert.alert('Error', 'Please fill in both question and answer.');
      return;
    }

    try {
      if (editingFAQ) {
        // Update existing FAQ (always published)
        const updates: EditFAQData = {
          question: questionText.trim(),
          answer: answerText.trim(),
          isPublished: true,
        };
        await updateFAQ(editingFAQ.id, updates);
        
        // Update local state
        setFaqs(prev => prev.map(faq =>
          faq.id === editingFAQ.id
            ? { ...faq, ...updates, updatedAt: new Date() }
            : faq
        ));
        
        Alert.alert('Success', 'FAQ updated successfully');
      } else {
        // Create new FAQ (automatically published)
        const newFAQData: CreateFAQData = {
          question: questionText.trim(),
          answer: answerText.trim(),
          isPublished: true,
        };
        
        await createFAQ(newFAQData, user!.id, user!.displayName);
        Alert.alert('Success', 'FAQ created successfully');
        
        // Reload FAQs to get the new one
        await loadFAQs();
      }
      
      closeEditModal();
    } catch (error) {
      console.error('Error saving FAQ:', error);
      Alert.alert('Error', 'Failed to save FAQ. Please try again.');
    }
  };

  const handleDeleteFAQ = (faq: FAQ) => {
    Alert.alert(
      'Delete FAQ',
      `Are you sure you want to delete this FAQ?\n\n"${faq.question}"`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteFAQ(faq.id);
              setFaqs(prev => prev.filter(f => f.id !== faq.id));
              Alert.alert('Success', 'FAQ deleted successfully');
            } catch (error) {
              console.error('Error deleting FAQ:', error);
              Alert.alert('Error', 'Failed to delete FAQ. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleCreateDefaultFAQs = async () => {
    Alert.alert(
      'Create Default FAQs',
      'This will create 8 sample FAQs about the book club. This is helpful for getting started. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create',
          onPress: async () => {
            try {
              await createDefaultFAQs(user!.id, user!.displayName);
              Alert.alert('Success', 'Default FAQs created successfully!');
              await loadFAQs(); // Reload to show the new FAQs
            } catch (error) {
              console.error('Error creating default FAQs:', error);
              Alert.alert('Error', 'Failed to create default FAQs. Please try again.');
            }
          }
        }
      ]
    );
  };

  const FAQItem: React.FC<{ faq: FAQ; index: number }> = ({ faq, index }) => {
    const isExpanded = expandedFAQ === faq.id;
    
    return (
      <View style={styles.faqCard}>
        <TouchableOpacity
          style={styles.faqHeader}
          onPress={() => toggleFAQ(faq.id)}
          activeOpacity={0.7}
        >
          <View style={styles.faqQuestionContainer}>
            <Text style={styles.faqNumber}>{index + 1}.</Text>
            <Text style={styles.faqQuestion}>{faq.question}</Text>
          </View>
          <Text style={[
            styles.expandIcon,
            isExpanded && styles.expandIconRotated
          ]}>
            ▼
          </Text>
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.faqContent}>
            <Text style={styles.faqAnswer}>{faq.answer}</Text>
            
            {isAdminMode && isAdmin && (
              <View style={styles.adminActions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => openEditModal(faq)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteFAQ(faq)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {isAdminMode && (
              <Text style={styles.faqMeta}>
                Created by {faq.createdByName} on {faq.createdAt.toLocaleDateString()}
              </Text>
            )}
          </View>
        )}
      </View>
    );
  };

  if (isLoading && !faqs.length) {
    return (
      <View style={styles.container}>
        <TopNavbar title="Frequently Asked Questions" />
        <LoadingState text="Loading FAQs..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopNavbar title="Frequently Asked Questions" />
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>Frequently Asked Questions</Text>
          <Text style={styles.subtitle}>
            Find answers to common questions about the Seattle Chinatown Book Club
          </Text>
          
          {/* Admin Controls */}
          {isAdmin && (
            <View style={styles.adminControls}>
              <TouchableOpacity
                style={[
                  styles.modeToggle,
                  isAdminMode && styles.modeToggleActive
                ]}
                onPress={() => setIsAdminMode(!isAdminMode)}
              >
                <Text style={styles.toggleButtonText}>
                  {isAdminMode ? 'Public View' : 'Admin Mode'}
                </Text>
              </TouchableOpacity>
              
              {isAdminMode && (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => openEditModal()}
                >
                  <Text style={styles.addButtonText}>Add FAQ</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* FAQs List */}
        <View style={styles.faqsSection}>
          {faqs.length > 0 ? (
            faqs.map((faq, index) => (
              <FAQItem key={faq.id} faq={faq} index={index} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                {isAdminMode ? 'No FAQs created yet.' : 'No FAQs available at this time.'}
              </Text>
              {isAdminMode && isAdmin && (
                <View style={styles.emptyStateButtons}>
                  <TouchableOpacity
                    style={styles.addFirstButton}
                    onPress={() => openEditModal()}
                  >
                    <Text style={styles.addFirstButtonText}>Create First FAQ</Text>
                  </TouchableOpacity>
                  <Text style={styles.emptyStateOr}>or</Text>
                  <TouchableOpacity
                    style={styles.defaultButton}
                    onPress={handleCreateDefaultFAQs}
                  >
                    <Text style={styles.defaultButtonText}>Create Sample FAQs</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Edit/Create FAQ Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeEditModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={closeEditModal}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingFAQ ? 'Edit FAQ' : 'Create FAQ'}
            </Text>
            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={handleSaveFAQ}
            >
              <Text style={styles.modalSaveText}>
                {editingFAQ ? 'Save' : 'Publish'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Text style={styles.inputLabel}>Question</Text>
            <TextInput
              style={styles.questionInput}
              value={questionText}
              onChangeText={setQuestionText}
              placeholder="Enter the question..."
              placeholderTextColor={theme.textSecondary}
              multiline
              returnKeyType="next"
            />
            
            <Text style={styles.inputLabel}>Answer</Text>
            <TextInput
              style={styles.answerInput}
              value={answerText}
              onChangeText={setAnswerText}
              placeholder="Enter the answer..."
              placeholderTextColor={theme.textSecondary}
              multiline
              returnKeyType="done"
            />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollView: {
    flex: 1,
  },

  headerSection: {
    padding: 20,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    lineHeight: 22,
  },
  adminControls: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  modeToggle: {
    backgroundColor: theme.background,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  modeToggleActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
  },
  addButton: {
    backgroundColor: theme.success,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  faqsSection: {
    padding: 16,
  },
  faqCard: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestionContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  faqNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.primary,
    marginRight: 8,
    minWidth: 24,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    flex: 1,
    marginRight: 8,
  },
  expandIcon: {
    fontSize: 14,
    color: theme.textSecondary,
    transform: [{ rotate: '0deg' }],
  },
  expandIconRotated: {
    transform: [{ rotate: '180deg' }],
  },
  faqContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  faqAnswer: {
    fontSize: 15,
    color: theme.text,
    lineHeight: 22,
    marginBottom: 12,
  },
  adminActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  editButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  deleteButton: {
    backgroundColor: theme.error,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  faqMeta: {
    fontSize: 12,
    color: theme.textSecondary,
    fontStyle: 'italic',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyStateButtons: {
    alignItems: 'center',
    gap: 12,
  },
  addFirstButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFirstButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  emptyStateOr: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  defaultButton: {
    backgroundColor: theme.success,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  defaultButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalCloseText: {
    fontSize: 16,
    color: theme.textSecondary,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
  },
  modalSaveButton: {
    padding: 4,
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.primary,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
  },
  questionInput: {
    backgroundColor: theme.surface,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: theme.text,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 20,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  answerInput: {
    backgroundColor: theme.surface,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: theme.text,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 20,
    minHeight: 120,
    textAlignVertical: 'top',
  },
});

export default FAQScreen; 