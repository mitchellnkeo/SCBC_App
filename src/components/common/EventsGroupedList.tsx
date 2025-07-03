import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  ScrollView,
  RefreshControl,
  Modal,
  FlatList,
  ActivityIndicator,
  SectionList,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { BookClubEvent } from '../../types';
import { formatFullDate } from '../../utils/dateTimeUtils';
import { Button } from './Button';
import EmptyState from './EmptyState';
import LoadingState from './LoadingState';

interface EventsGroupedListProps {
  events: BookClubEvent[];
  isLoading: boolean;
  isRefreshing: boolean;
  hasMore: boolean;
  viewMode: 'card' | 'list';
  onViewModeChange: (mode: 'card' | 'list') => void;
  onRefresh: () => void;
  onEndReached: () => void;
  renderEventCard: (event: BookClubEvent) => React.ReactElement;
  renderEventListItem: (event: BookClubEvent) => React.ReactElement;
  emptyStateMessage?: string;
}

interface GroupedEvents {
  [year: string]: {
    [month: string]: BookClubEvent[];
  };
}

interface EventSection {
  title: string;
  data: BookClubEvent[];
  year: string;
  month?: string;
}

const EventsGroupedList: React.FC<EventsGroupedListProps> = ({
  events,
  isLoading,
  isRefreshing,
  hasMore,
  viewMode,
  onViewModeChange,
  onRefresh,
  onEndReached,
  renderEventCard,
  renderEventListItem,
  emptyStateMessage = 'No events found'
}) => {
  const { theme } = useTheme();
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerStep, setPickerStep] = useState<'year' | 'month'>('year');

  // Get all available years and months from events
  const { years, monthsByYear } = useMemo(() => {
    const yearsSet = new Set<string>();
    const monthsMap = new Map<string, Set<string>>();
    
    events.forEach(event => {
      const date = new Date(event.date);
      const year = date.getFullYear().toString();
      const month = date.toLocaleString('en-US', { month: 'long' });
      
      yearsSet.add(year);
      
      if (!monthsMap.has(year)) {
        monthsMap.set(year, new Set());
      }
      monthsMap.get(year)?.add(month);
    });

    return {
      years: Array.from(yearsSet).sort((a, b) => Number(b) - Number(a)),
      monthsByYear: monthsMap
    };
  }, [events]);

  // Filter events based on selection
  const filteredEvents = useMemo(() => {
    if (!selectedYear) return events;
    
    return events.filter(event => {
      const date = new Date(event.date);
      const eventYear = date.getFullYear().toString();
      const eventMonth = date.toLocaleString('en-US', { month: 'long' });
      
      if (selectedYear && eventYear !== selectedYear) return false;
      if (selectedMonth && eventMonth !== selectedMonth) return false;
      
      return true;
    });
  }, [events, selectedYear, selectedMonth]);

  // Group events by year and month
  const sections = useMemo(() => {
    const grouped: GroupedEvents = {};
    
    filteredEvents.forEach(event => {
      const date = new Date(event.date);
      const year = date.getFullYear().toString();
      const month = date.toLocaleString('en-US', { month: 'long' });
      
      if (!grouped[year]) {
        grouped[year] = {};
      }
      if (!grouped[year][month]) {
        grouped[year][month] = [];
      }
      
      grouped[year][month].push(event);
    });

    const eventSections: EventSection[] = [];
    
    const sortedYears = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));
    
    sortedYears.forEach(year => {
      const months = Object.keys(grouped[year]).sort((a, b) => {
        const monthOrder = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return monthOrder.indexOf(a) - monthOrder.indexOf(b);
      });

      months.forEach(month => {
        eventSections.push({
          title: `${month} ${year}`,
          data: grouped[year][month].sort((a, b) => 
            new Date(a.date).getTime() - new Date(b.date).getTime()
          ),
          year,
          month
        });
      });
    });

    return eventSections;
  }, [filteredEvents]);

  const handleYearSelect = (year: string | null) => {
    setSelectedYear(year);
    if (year) {
      setPickerStep('month');
    } else {
      setSelectedMonth(null);
      setShowPicker(false);
    }
  };

  const handleMonthSelect = (month: string | null) => {
    setSelectedMonth(month);
    setShowPicker(false);
  };

  const handleOpenPicker = () => {
    setPickerStep('year');
    setShowPicker(true);
  };

  const handleBack = () => {
    setPickerStep('year');
    setSelectedMonth(null);
  };

  const handleClear = () => {
    setSelectedYear(null);
    setSelectedMonth(null);
    setShowPicker(false);
    setPickerStep('year');
  };

  const renderPicker = () => (
    <Modal
      visible={showPicker}
      transparent
      animationType="fade"
      onRequestClose={() => setShowPicker(false)}
    >
      <TouchableOpacity
        style={dynamicStyles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowPicker(false)}
      >
        <View style={dynamicStyles.pickerModal}>
          <View style={dynamicStyles.pickerHeader}>
            {pickerStep === 'month' && (
              <TouchableOpacity
                style={dynamicStyles.backButton}
                onPress={handleBack}
              >
                <Text style={dynamicStyles.backButtonText}>← Back</Text>
              </TouchableOpacity>
            )}
            <Text style={dynamicStyles.pickerTitle}>
              {pickerStep === 'year' ? 'Select Year' : `Select Month (${selectedYear})`}
            </Text>
            <TouchableOpacity
              style={dynamicStyles.clearButton}
              onPress={handleClear}
            >
              <Text style={dynamicStyles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={dynamicStyles.pickerContent}>
            {pickerStep === 'year' ? (
              years.map(year => (
                <TouchableOpacity
                  key={year}
                  style={[
                    dynamicStyles.pickerItem,
                    selectedYear === year && dynamicStyles.pickerItemSelected
                  ]}
                  onPress={() => handleYearSelect(year)}
                >
                  <Text style={[
                    dynamicStyles.pickerItemText,
                    selectedYear === year && dynamicStyles.pickerItemTextSelected
                  ]}>
                    {year}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              Array.from(monthsByYear.get(selectedYear!) || [])
                .sort((a, b) => {
                  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                                'July', 'August', 'September', 'October', 'November', 'December'];
                  return months.indexOf(a) - months.indexOf(b);
                })
                .map(month => (
                  <TouchableOpacity
                    key={month}
                    style={[
                      dynamicStyles.pickerItem,
                      selectedMonth === month && dynamicStyles.pickerItemSelected
                    ]}
                    onPress={() => handleMonthSelect(month)}
                  >
                    <Text style={[
                      dynamicStyles.pickerItemText,
                      selectedMonth === month && dynamicStyles.pickerItemTextSelected
                    ]}>
                      {month}
                    </Text>
                  </TouchableOpacity>
                ))
            )}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const getFilterDisplayText = () => {
    if (!selectedYear) {
      return 'Organize by Year/Month';
    }
    if (!selectedMonth) {
      return selectedYear;
    }
    return `${selectedMonth} ${selectedYear}`;
  };

  const renderFilters = () => (
    <View style={dynamicStyles.filtersContainer}>
      <TouchableOpacity
        style={[
          dynamicStyles.filterButton,
          (selectedYear || selectedMonth) && dynamicStyles.filterButtonActive
        ]}
        onPress={handleOpenPicker}
      >
        <Text style={[
          dynamicStyles.filterButtonText,
          (selectedYear || selectedMonth) && dynamicStyles.filterButtonTextActive
        ]}>
          {getFilterDisplayText()}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderViewModeToggle = () => (
    <View style={dynamicStyles.viewModeContainer}>
      <TouchableOpacity
        style={[
          dynamicStyles.viewModeButton,
          viewMode === 'card' && dynamicStyles.viewModeButtonActive,
        ]}
        onPress={() => onViewModeChange('card')}
      >
        <Text
          style={[
            dynamicStyles.viewModeText,
            viewMode === 'card' && dynamicStyles.viewModeTextActive,
          ]}
        >
          Cards
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          dynamicStyles.viewModeButton,
          viewMode === 'list' && dynamicStyles.viewModeButtonActive,
        ]}
        onPress={() => onViewModeChange('list')}
      >
        <Text
          style={[
            dynamicStyles.viewModeText,
            viewMode === 'list' && dynamicStyles.viewModeTextActive,
          ]}
        >
          List
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeaderControls = () => (
    <View style={dynamicStyles.headerControls}>
      {renderFilters()}
      {renderViewModeToggle()}
    </View>
  );

  const renderSectionHeader = ({ section }: { section: EventSection }) => (
    <View style={dynamicStyles.sectionHeader}>
      <Text style={dynamicStyles.sectionTitle}>{section.title}</Text>
      <View style={dynamicStyles.sectionDivider} />
    </View>
  );

  const renderFooter = () => {
    if (!isLoading || isRefreshing) return null;
    return (
      <View style={dynamicStyles.footerLoader}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  };

  const renderContent = () => {
    if (isLoading && !isRefreshing && filteredEvents.length === 0) {
      return <LoadingState />;
    }

    if (!isLoading && filteredEvents.length === 0) {
      return <EmptyState 
        emoji="📅"
        title="No Events"
        subtitle={emptyStateMessage}
      />;
    }

    return (
      <SectionList
        sections={sections}
        renderItem={({ item }) =>
          viewMode === 'card' ? renderEventCard(item) : renderEventListItem(item)
        }
        renderSectionHeader={renderSectionHeader}
        keyExtractor={item => item.id}
        contentContainerStyle={dynamicStyles.listContent}
        stickySectionHeadersEnabled={true}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={renderHeaderControls}
        ListFooterComponent={renderFooter}
      />
    );
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    headerControls: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      gap: 12,
    },
    filtersContainer: {
      flexDirection: 'row',
      gap: 8,
      flex: 1,
    },
    filterButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
    },
    filterButtonActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    filterButtonText: {
      fontSize: 14,
      color: theme.text,
      fontWeight: '500',
    },
    filterButtonTextActive: {
      color: theme.surface,
    },
    viewModeContainer: {
      flexDirection: 'row',
      backgroundColor: theme.background,
      borderRadius: 6,
      padding: 2,
    },
    viewModeButton: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    viewModeButtonActive: {
      backgroundColor: theme.primary,
    },
    viewModeText: {
      fontSize: 12,
      fontWeight: '500',
    },
    viewModeTextActive: {
      color: theme.surface,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    pickerModal: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      width: '80%',
      maxHeight: '70%',
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    pickerHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    pickerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
    },
    clearButton: {
      padding: 8,
    },
    clearButtonText: {
      color: theme.primary,
      fontSize: 14,
      fontWeight: '500',
    },
    pickerContent: {
      maxHeight: 300,
    },
    pickerItem: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    pickerItemSelected: {
      backgroundColor: theme.primary + '20',
    },
    pickerItemText: {
      fontSize: 16,
      color: theme.text,
    },
    pickerItemTextSelected: {
      color: theme.primary,
      fontWeight: '600',
    },
    listContent: {
      padding: 16,
    },
    sectionHeader: {
      backgroundColor: theme.surface,
      paddingVertical: 8,
      paddingHorizontal: 16,
      marginBottom: 12,
      marginTop: 8,
      borderRadius: 8,
      flexDirection: 'column',
      gap: 8,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
    },
    sectionDivider: {
      height: 2,
      backgroundColor: theme.border,
      width: '15%',
      borderRadius: 1,
    },
    footerLoader: {
      paddingVertical: 16,
      alignItems: 'center',
    },
    backButton: {
      padding: 8,
    },
    backButtonText: {
      color: theme.primary,
      fontSize: 14,
      fontWeight: '500',
    },
  });

  return (
    <View style={dynamicStyles.container}>
      {renderContent()}
      {renderPicker()}
    </View>
  );
};

export default EventsGroupedList;