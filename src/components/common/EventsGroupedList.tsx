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

interface FilterOption {
  id: string;
  label: string;
  year?: string;
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
  const [selectedFilter, setSelectedFilter] = useState<{ year: string | null; month: string | null }>({
    year: null,
    month: null
  });
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownLevel, setDropdownLevel] = useState<'year' | 'month'>('year');

  // Group events by year and month
  const groupedEvents = useMemo(() => {
    const grouped: GroupedEvents = {};
    
    events.forEach(event => {
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

    // Sort events within each month by date
    Object.keys(grouped).forEach(year => {
      Object.keys(grouped[year]).forEach(month => {
        grouped[year][month].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      });
    });

    return grouped;
  }, [events]);

  // Get filtered events based on selection
  const filteredEvents = useMemo(() => {
    if (!selectedFilter.year) {
      return events; // Show all events if no year selected
    }
    
    if (!selectedFilter.month) {
      // Show all events for the selected year
      return events.filter(event => {
        const eventYear = new Date(event.date).getFullYear().toString();
        return eventYear === selectedFilter.year;
      });
    }
    
    // Show events for specific year and month
    return events.filter(event => {
      const date = new Date(event.date);
      const eventYear = date.getFullYear().toString();
      const eventMonth = date.toLocaleString('en-US', { month: 'long' });
      return eventYear === selectedFilter.year && eventMonth === selectedFilter.month;
    });
  }, [events, selectedFilter]);

  // Get available years and months for dropdown
  const availableYears = useMemo(() => {
    return Object.keys(groupedEvents).sort((a, b) => Number(b) - Number(a));
  }, [groupedEvents]);

  const availableMonths = useMemo(() => {
    if (!selectedFilter.year || !groupedEvents[selectedFilter.year]) {
      return [];
    }
    
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];
    
    return Object.keys(groupedEvents[selectedFilter.year])
      .sort((a, b) => months.indexOf(b) - months.indexOf(a));
  }, [groupedEvents, selectedFilter.year]);

  const handleYearSelect = (year: string) => {
    setSelectedFilter({ year, month: null });
    setDropdownLevel('month');
  };

  const handleMonthSelect = (month: string) => {
    setSelectedFilter(prev => ({ ...prev, month }));
    setShowDropdown(false);
  };

  const handleBackToYears = () => {
    setDropdownLevel('year');
  };

  const handleClearFilter = () => {
    setSelectedFilter({ year: null, month: null });
    setShowDropdown(false);
  };

  const getDropdownTitle = () => {
    if (!selectedFilter.year) {
      return 'All Events';
    }
    if (!selectedFilter.month) {
      return `${selectedFilter.year} - All Months`;
    }
    return `${selectedFilter.year} - ${selectedFilter.month}`;
  };

  const renderDropdownItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={dynamicStyles.dropdownItem}
      onPress={() => {
        if (dropdownLevel === 'year') {
          handleYearSelect(item);
        } else {
          handleMonthSelect(item);
        }
      }}
    >
      <Text style={dynamicStyles.dropdownItemText}>{item}</Text>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!isLoading || isRefreshing) return null;
    return (
      <View style={dynamicStyles.footerLoader}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  };

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

  const renderContent = () => {
    if (isLoading && !isRefreshing && events.length === 0) {
      return <LoadingState />;
    }

    if (!isLoading && events.length === 0) {
      return <EmptyState 
        emoji="📅"
        title="No Events"
        subtitle={emptyStateMessage}
      />;
    }

    return (
      <FlatList
        data={events}
        renderItem={({ item }) =>
          viewMode === 'card' ? renderEventCard(item) : renderEventListItem(item)
        }
        keyExtractor={item => item.id}
        contentContainerStyle={dynamicStyles.listContent}
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
        ListHeaderComponent={renderViewModeToggle}
        ListFooterComponent={renderFooter}
      />
    );
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    filterContainer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    filterButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    filterButtonText: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.text,
      flex: 1,
    },
    filterChevron: {
      fontSize: 16,
      color: theme.textSecondary,
      marginLeft: 8,
    },

    content: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 16,
    },
    viewToggle: {
      flexDirection: 'row',
      backgroundColor: theme.background,
      borderRadius: 8,
      padding: 2,
    },
    toggleButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
    },
    activeToggle: {
      backgroundColor: theme.primary,
    },
    toggleText: {
      fontSize: 14,
      fontWeight: '500',
    },
    activeToggleText: {
      color: theme.surface,
    },
    inactiveToggleText: {
      color: theme.textSecondary,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    dropdownModal: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      margin: 20,
      maxHeight: '70%',
      minWidth: 300,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    dropdownHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    dropdownTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      flex: 1,
    },
    backButton: {
      padding: 8,
      borderRadius: 6,
      backgroundColor: theme.background,
    },
    backButtonText: {
      fontSize: 14,
      color: theme.primary,
      fontWeight: '500',
    },
    closeButton: {
      padding: 8,
      borderRadius: 6,
      backgroundColor: theme.background,
    },
    closeButtonText: {
      fontSize: 16,
      color: theme.textSecondary,
      fontWeight: '500',
    },
    dropdownList: {
      maxHeight: 400,
    },
    dropdownItem: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    dropdownItemText: {
      fontSize: 16,
      color: theme.text,
    },
    eventSection: {
      marginBottom: 16,
    },
    sectionDate: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.textSecondary,
      marginBottom: 8,
      paddingHorizontal: 4,
    },
    listContent: {
      padding: 16,
    },
    viewModeContainer: {
      flexDirection: 'row',
      marginBottom: 16,
      backgroundColor: theme.surface,
      borderRadius: 8,
      padding: 4,
    },
    viewModeButton: {
      flex: 1,
      paddingVertical: 8,
      alignItems: 'center',
      borderRadius: 6,
    },
    viewModeButtonActive: {
      backgroundColor: theme.primary,
    },
    viewModeText: {
      color: theme.textSecondary,
      fontSize: 14,
      fontWeight: '600',
    },
    viewModeTextActive: {
      color: 'white',
    },
    footerLoader: {
      paddingVertical: 16,
      alignItems: 'center',
    },
  });

  return <View style={dynamicStyles.container}>{renderContent()}</View>;
};

export default EventsGroupedList;