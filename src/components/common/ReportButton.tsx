import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Alert, 
  StyleSheet,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';
import { useTheme } from '../../contexts/ThemeContext';
import { BottomSheetModal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { 
  submitReport, 
  hasUserReportedContent, 
  getReportReasonDisplay 
} from '../../services/reportService';
import { ReportType, ReportReason, CreateReportData } from '../../types';

interface ReportButtonProps {
  contentType: ReportType;
  contentId: string;
  contentOwnerId: string;
  contentOwnerName: string;
  contentPreview: string;
  eventId?: string;
  eventTitle?: string;
  size?: 'small' | 'medium';
  variant?: 'icon' | 'text' | 'menu';
  onReportSubmitted?: () => void;
}

const REPORT_REASONS: ReportReason[] = [
  'inappropriate_content',
  'harassment',
  'spam',
  'hate_speech',
  'misinformation',
  'violence',
  'other'
];

export const ReportButton: React.FC<ReportButtonProps> = ({
  contentType,
  contentId,
  contentOwnerId,
  contentOwnerName,
  contentPreview,
  eventId,
  eventTitle,
  size = 'medium',
  variant = 'icon',
  onReportSubmitted
}) => {
  const { user } = useAuthStore();
  const { theme } = useTheme();
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasReported, setHasReported] = useState(false);

  const styles = createStyles(theme);

  // Don't show report button for own content
  if (!user || user.id === contentOwnerId) {
    return null;
  }

  const checkExistingReport = async () => {
    try {
      const alreadyReported = await hasUserReportedContent(user.id, contentId, contentType);
      setHasReported(alreadyReported);
      
      if (alreadyReported) {
        Alert.alert(
          'Already Reported',
          'You have already reported this content. Our moderation team will review it shortly.',
          [{ text: 'OK' }]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error checking existing report:', error);
      return true; // Allow report if check fails
    }
  };

  const handleReportPress = async () => {
    const canReport = await checkExistingReport();
    if (canReport) {
      setShowReportModal(true);
    }
  };

  const handleSubmitReport = async () => {
    if (!selectedReason) {
      Alert.alert('Please select a reason', 'You must select a reason for reporting this content.');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Please provide details', 'Please provide additional details about why you are reporting this content.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const reportData: CreateReportData = {
        type: contentType,
        reason: selectedReason,
        description: description.trim(),
        contentId,
        contentOwnerId,
        contentOwnerName,
        contentPreview,
        eventId,
        eventTitle,
      };

      await submitReport(user.id, user.displayName, reportData);
      
      setShowReportModal(false);
      setSelectedReason(null);
      setDescription('');
      setHasReported(true);
      
      Alert.alert(
        'Report Submitted',
        'Thank you for reporting this content. Our moderation team will review it and take appropriate action.',
        [{ text: 'OK' }]
      );
      
      onReportSubmitted?.();
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderButton = () => {
    const iconSize = size === 'small' ? 16 : 20;
    const textStyle = size === 'small' ? styles.smallText : styles.mediumText;

    switch (variant) {
      case 'icon':
        return (
          <TouchableOpacity
            style={[styles.iconButton, size === 'small' && styles.smallIconButton]}
            onPress={handleReportPress}
            disabled={hasReported}
          >
            <Ionicons 
              name="flag-outline" 
              size={iconSize} 
              color={hasReported ? theme.textSecondary : theme.error} 
            />
          </TouchableOpacity>
        );

      case 'text':
        return (
          <TouchableOpacity
            style={styles.textButton}
            onPress={handleReportPress}
            disabled={hasReported}
          >
            <Ionicons 
              name="flag-outline" 
              size={iconSize} 
              color={hasReported ? theme.textSecondary : theme.error} 
            />
            <Text style={[textStyle, { color: hasReported ? theme.textSecondary : theme.error }]}>
              {hasReported ? 'Reported' : 'Report'}
            </Text>
          </TouchableOpacity>
        );

      case 'menu':
        return (
          <TouchableOpacity
            style={styles.menuButton}
            onPress={handleReportPress}
            disabled={hasReported}
          >
            <Ionicons 
              name="flag-outline" 
              size={iconSize} 
              color={hasReported ? theme.textSecondary : theme.text} 
            />
            <Text style={[styles.menuText, { color: hasReported ? theme.textSecondary : theme.text }]}>
              {hasReported ? 'Already Reported' : `Report ${contentType}`}
            </Text>
          </TouchableOpacity>
        );

      default:
        return null;
    }
  };

  const ReasonOption: React.FC<{ reason: ReportReason }> = ({ reason }) => (
    <TouchableOpacity
      style={[
        styles.reasonOption,
        selectedReason === reason && styles.selectedReasonOption
      ]}
      onPress={() => setSelectedReason(reason)}
    >
      <View style={[
        styles.radioButton,
        selectedReason === reason && styles.selectedRadioButton
      ]}>
        {selectedReason === reason && (
          <View style={styles.radioButtonInner} />
        )}
      </View>
      <Text style={[
        styles.reasonText,
        selectedReason === reason && styles.selectedReasonText
      ]}>
        {getReportReasonDisplay(reason)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <>
      {renderButton()}
      
      <BottomSheetModal
        visible={showReportModal}
        onClose={() => setShowReportModal(false)}
        keyboardAvoiding={true}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.modalTitle}>Report {contentType}</Text>
          <Text style={styles.modalSubtitle}>
            Why are you reporting this {contentType}?
          </Text>

          <View style={styles.reasonsList}>
            {REPORT_REASONS.map(reason => (
              <ReasonOption key={reason} reason={reason} />
            ))}
          </View>

          <View style={styles.descriptionInput}>
            <Input
              label="Additional Details"
              value={description}
              onChangeText={setDescription}
              placeholder={`Please provide specific details about why you are reporting this ${contentType}...`}
              multiline
              numberOfLines={4}
              variant="outlined"
            />
          </View>

          <View style={styles.buttonRow}>
            <Button
              title="Cancel"
              onPress={() => setShowReportModal(false)}
              variant="secondary"
              size="large"
              style={styles.cancelButton}
              disabled={isSubmitting}
            />
            
            <Button
              title={isSubmitting ? 'Submitting...' : 'Submit Report'}
              onPress={handleSubmitReport}
              variant="error"
              size="large"
              style={styles.submitButton}
              disabled={!selectedReason || !description.trim() || isSubmitting}
              loading={isSubmitting}
            />
          </View>
        </ScrollView>
      </BottomSheetModal>
    </>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  iconButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: theme.background,
  },
  smallIconButton: {
    padding: 6,
  },
  textButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 4,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    width: '100%',
  },
  smallText: {
    fontSize: 12,
    fontWeight: '500',
  },
  mediumText: {
    fontSize: 14,
    fontWeight: '500',
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    marginBottom: 24,
  },
  reasonsList: {
    marginBottom: 24,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: theme.background,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  selectedReasonOption: {
    backgroundColor: theme.primaryLight,
    borderColor: theme.primary,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.border,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedRadioButton: {
    borderColor: theme.primary,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.primary,
  },
  reasonText: {
    fontSize: 16,
    color: theme.text,
    flex: 1,
  },
  selectedReasonText: {
    color: theme.primary,
    fontWeight: '600',
  },
  descriptionInput: {
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
});

export default ReportButton; 