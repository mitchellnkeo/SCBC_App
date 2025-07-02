import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../stores/authStore';
import TopNavbar from '../../components/navigation/TopNavbar';
import { Button } from '../../components/common/Button';
import { BottomSheetModal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import {
  getReports,
  getReportStats,
  updateReportStatus,
  subscribeToReports,
  getReportReasonDisplay,
  getReportTypeDisplay
} from '../../services/reportService';
import { Report, ReportStats, ReportStatus, ReportType } from '../../types';

interface FilterOptions {
  status: ReportStatus | 'all';
  type: ReportType | 'all';
}

const ContentModerationScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { theme } = useTheme();
  
  const [reports, setReports] = useState<Report[]>([]);
  const [reportStats, setReportStats] = useState<ReportStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    type: 'all'
  });
  
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [newStatus, setNewStatus] = useState<ReportStatus>('pending');
  const [adminNotes, setAdminNotes] = useState('');
  const [resolutionAction, setResolutionAction] = useState('');

  const styles = createStyles(theme);

  useEffect(() => {
    loadData();
    
    // Set up real-time subscription
    const unsubscribe = subscribeToReports(
      (updatedReports) => {
        setReports(updatedReports);
      },
      {
        status: filters.status !== 'all' ? filters.status : undefined,
        type: filters.type !== 'all' ? filters.type : undefined,
        limitCount: 50
      }
    );

    return unsubscribe;
  }, [filters]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [reportsData, statsData] = await Promise.all([
        getReports({
          status: filters.status !== 'all' ? filters.status : undefined,
          type: filters.type !== 'all' ? filters.type : undefined,
          limitCount: 50
        }),
        getReportStats()
      ]);
      
      setReports(reportsData.reports);
      setReportStats(statsData);
    } catch (error) {
      console.error('Error loading moderation data:', error);
      Alert.alert('Error', 'Failed to load reports. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const handleReportPress = (report: Report) => {
    setSelectedReport(report);
    setShowDetailModal(true);
  };

  const handleUpdateStatus = () => {
    if (!selectedReport) return;
    
    setNewStatus(selectedReport.status);
    setAdminNotes(selectedReport.adminNotes || '');
    setResolutionAction(selectedReport.resolutionAction || '');
    setShowDetailModal(false);
    setShowUpdateModal(true);
  };

  const submitStatusUpdate = async () => {
    if (!selectedReport || !user) return;

    // Validate required fields for resolution
    if ((newStatus === 'resolved' || newStatus === 'dismissed') && !resolutionAction.trim()) {
      Alert.alert('Resolution Required', 'Please provide details about the resolution action.');
      return;
    }

    setIsUpdating(true);
    
    try {
      await updateReportStatus(
        selectedReport.id,
        newStatus,
        user.id,
        user.displayName,
        adminNotes.trim() || undefined,
        resolutionAction.trim() || undefined
      );
      
      setShowUpdateModal(false);
      setSelectedReport(null);
      
      Alert.alert('Success', 'Report status updated successfully.');
    } catch (error) {
      console.error('Error updating report status:', error);
      Alert.alert('Error', 'Failed to update report status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: ReportStatus): string => {
    switch (status) {
      case 'pending':
        return '#f59e0b'; // amber-500
      case 'investigating':
        return '#3b82f6'; // blue-500
      case 'resolved':
        return '#10b981'; // emerald-500
      case 'dismissed':
        return '#6b7280'; // gray-500
      default:
        return '#6b7280';
    }
  };

  const getStatusDisplay = (status: ReportStatus): string => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const FilterButton: React.FC<{
    active: boolean;
    onPress: () => void;
    children: React.ReactNode;
  }> = ({ active, onPress, children }) => (
    <TouchableOpacity
      style={[styles.filterButton, active && styles.activeFilterButton]}
      onPress={onPress}
    >
      <Text style={[styles.filterButtonText, active && styles.activeFilterButtonText]}>
        {children}
      </Text>
    </TouchableOpacity>
  );

  const ReportCard: React.FC<{ report: Report }> = ({ report }) => (
    <TouchableOpacity style={styles.reportCard} onPress={() => handleReportPress(report)}>
      <View style={styles.reportHeader}>
        <View style={styles.reportType}>
          <Ionicons name="flag" size={16} color={getStatusColor(report.status)} />
          <Text style={styles.reportTypeText}>
            {getReportTypeDisplay(report.type)}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) }]}>
          <Text style={styles.statusBadgeText}>
            {getStatusDisplay(report.status)}
          </Text>
        </View>
      </View>

      <Text style={styles.reportReason}>
        {getReportReasonDisplay(report.reason)}
      </Text>
      
      <Text style={styles.reportContent} numberOfLines={2}>
        "{report.contentPreview}"
      </Text>
      
      <View style={styles.reportFooter}>
        <Text style={styles.reportMeta}>
          Reported by {report.reporterName}
        </Text>
        <Text style={styles.reportDate}>
          {report.createdAt.toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const StatsCard: React.FC<{
    title: string;
    value: number;
    color: string;
  }> = ({ title, value, color }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  if (isLoading && !reports.length) {
    return (
      <View style={styles.container}>
        <TopNavbar title="Content Moderation" />
        <LoadingState text="Loading reports..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopNavbar title="Content Moderation" />
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Section */}
        {reportStats && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Report Statistics</Text>
            <View style={styles.statsGrid}>
              <StatsCard
                title="Total Reports"
                value={reportStats.totalReports}
                color="#6b7280"
              />
              <StatsCard
                title="Pending"
                value={reportStats.pendingReports}
                color="#f59e0b"
              />
              <StatsCard
                title="Investigating"
                value={reportStats.investigatingReports}
                color="#3b82f6"
              />
              <StatsCard
                title="This Week"
                value={reportStats.reportsThisWeek}
                color="#ec4899"
              />
            </View>
          </View>
        )}

        {/* Filters Section */}
        <View style={styles.filtersSection}>
          <Text style={styles.sectionTitle}>Filter Reports</Text>
          
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Status:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterRow}>
                <FilterButton
                  active={filters.status === 'all'}
                  onPress={() => setFilters({ ...filters, status: 'all' })}
                >
                  All
                </FilterButton>
                <FilterButton
                  active={filters.status === 'pending'}
                  onPress={() => setFilters({ ...filters, status: 'pending' })}
                >
                  Pending
                </FilterButton>
                <FilterButton
                  active={filters.status === 'investigating'}
                  onPress={() => setFilters({ ...filters, status: 'investigating' })}
                >
                  Investigating
                </FilterButton>
                <FilterButton
                  active={filters.status === 'resolved'}
                  onPress={() => setFilters({ ...filters, status: 'resolved' })}
                >
                  Resolved
                </FilterButton>
                <FilterButton
                  active={filters.status === 'dismissed'}
                  onPress={() => setFilters({ ...filters, status: 'dismissed' })}
                >
                  Dismissed
                </FilterButton>
              </View>
            </ScrollView>
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Type:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterRow}>
                <FilterButton
                  active={filters.type === 'all'}
                  onPress={() => setFilters({ ...filters, type: 'all' })}
                >
                  All
                </FilterButton>
                <FilterButton
                  active={filters.type === 'profile'}
                  onPress={() => setFilters({ ...filters, type: 'profile' })}
                >
                  Profiles
                </FilterButton>
                <FilterButton
                  active={filters.type === 'comment'}
                  onPress={() => setFilters({ ...filters, type: 'comment' })}
                >
                  Comments
                </FilterButton>
                <FilterButton
                  active={filters.type === 'event'}
                  onPress={() => setFilters({ ...filters, type: 'event' })}
                >
                  Events
                </FilterButton>
              </View>
            </ScrollView>
          </View>
        </View>

        {/* Reports List */}
        <View style={styles.reportsSection}>
          <Text style={styles.sectionTitle}>
            Reports ({reports.length})
          </Text>
          
          {reports.length > 0 ? (
            reports.map(report => (
              <ReportCard key={report.id} report={report} />
            ))
          ) : (
            <EmptyState
              emoji="🚩"
              title="No Reports Found"
              subtitle="No reports match your current filters."
            />
          )}
        </View>
      </ScrollView>

      {/* Report Detail Modal */}
      <BottomSheetModal
        visible={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      >
        {selectedReport && (
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>Report Details</Text>
            
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Type:</Text>
              <Text style={styles.detailValue}>
                {getReportTypeDisplay(selectedReport.type)}
              </Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Reason:</Text>
              <Text style={styles.detailValue}>
                {getReportReasonDisplay(selectedReport.reason)}
              </Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Status:</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedReport.status) }]}>
                <Text style={styles.statusBadgeText}>
                  {getStatusDisplay(selectedReport.status)}
                </Text>
              </View>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Reported Content:</Text>
              <Text style={styles.detailContent}>
                "{selectedReport.contentPreview}"
              </Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Reporter Description:</Text>
              <Text style={styles.detailContent}>
                {selectedReport.description}
              </Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Reporter:</Text>
              <Text style={styles.detailValue}>
                {selectedReport.reporterName}
              </Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Content Owner:</Text>
              <Text style={styles.detailValue}>
                {selectedReport.contentOwnerName}
              </Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Reported On:</Text>
              <Text style={styles.detailValue}>
                {selectedReport.createdAt.toLocaleDateString()} at {selectedReport.createdAt.toLocaleTimeString()}
              </Text>
            </View>

            {selectedReport.assignedAdminName && (
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Assigned Admin:</Text>
                <Text style={styles.detailValue}>
                  {selectedReport.assignedAdminName}
                </Text>
              </View>
            )}

            {selectedReport.adminNotes && (
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Admin Notes:</Text>
                <Text style={styles.detailContent}>
                  {selectedReport.adminNotes}
                </Text>
              </View>
            )}

            {selectedReport.resolutionAction && (
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Resolution Action:</Text>
                <Text style={styles.detailContent}>
                  {selectedReport.resolutionAction}
                </Text>
              </View>
            )}

            <View style={styles.modalButtons}>
              <Button
                title="Update Status"
                onPress={handleUpdateStatus}
                variant="primary"
                size="large"
              />
            </View>
          </ScrollView>
        )}
      </BottomSheetModal>

      {/* Update Status Modal */}
      <BottomSheetModal
        visible={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        keyboardAvoiding={true}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.modalTitle}>Update Report Status</Text>
          
          <View style={styles.statusOptions}>
            <Text style={styles.inputLabel}>Status:</Text>
            {(['pending', 'investigating', 'resolved', 'dismissed'] as ReportStatus[]).map(status => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusOption,
                  newStatus === status && styles.selectedStatusOption
                ]}
                onPress={() => setNewStatus(status)}
              >
                <View style={[
                  styles.radioButton,
                  newStatus === status && styles.selectedRadioButton
                ]}>
                  {newStatus === status && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
                <Text style={[
                  styles.statusOptionText,
                  newStatus === status && styles.selectedStatusOptionText
                ]}>
                  {getStatusDisplay(status)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="Admin Notes (optional)"
            value={adminNotes}
            onChangeText={setAdminNotes}
            placeholder="Add internal notes about this report..."
            multiline
            numberOfLines={3}
            variant="outlined"
          />

          {(newStatus === 'resolved' || newStatus === 'dismissed') && (
            <Input
              label="Resolution Action *"
              value={resolutionAction}
              onChangeText={setResolutionAction}
              placeholder="Describe what action was taken or why it was dismissed..."
              multiline
              numberOfLines={3}
              variant="outlined"
            />
          )}

          <View style={styles.modalButtons}>
            <Button
              title="Cancel"
              onPress={() => setShowUpdateModal(false)}
              variant="secondary"
              size="large"
              style={styles.cancelButton}
              disabled={isUpdating}
            />
            
            <Button
              title={isUpdating ? 'Updating...' : 'Update Status'}
              onPress={submitStatusUpdate}
              variant="primary"
              size="large"
              style={styles.submitButton}
              disabled={isUpdating}
              loading={isUpdating}
            />
          </View>
        </ScrollView>
      </BottomSheetModal>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.backgroundSecondary,
  },
  scrollView: {
    flex: 1,
  },
  
  // Stats
  statsSection: {
    padding: 16,
    backgroundColor: theme.background,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: 80,
    backgroundColor: theme.backgroundSecondary,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: theme.textSecondary,
    textAlign: 'center',
  },
  
  // Filters
  filtersSection: {
    padding: 16,
    backgroundColor: theme.background,
    marginBottom: 8,
  },
  filterGroup: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.border,
  },
  activeFilterButton: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: theme.text,
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: 'white',
  },
  
  // Reports
  reportsSection: {
    padding: 16,
  },
  reportCard: {
    backgroundColor: theme.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reportType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reportTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  reportReason: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
  },
  reportContent: {
    fontSize: 14,
    color: theme.textSecondary,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportMeta: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  reportDate: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  
  // Modal
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 20,
  },
  detailSection: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: theme.text,
  },
  detailContent: {
    fontSize: 16,
    color: theme.text,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
  
  // Status Update
  statusOptions: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 12,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: theme.backgroundSecondary,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  selectedStatusOption: {
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
  statusOptionText: {
    fontSize: 16,
    color: theme.text,
  },
  selectedStatusOptionText: {
    color: theme.primary,
    fontWeight: '600',
  },
});

export default ContentModerationScreen; 