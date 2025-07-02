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
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { BookClubEvent } from '../../types';
import { formatFullDate } from '../../utils/dateTimeUtils';
import { Button } from './Button';
import EmptyState from './EmptyState';

interface EventsGroupedListProps {
  events: BookClubEvent[];
  isLoading: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  viewMode: 'card' | 'list';
  onViewModeChange: (mode: 'card' | 'list') => void;
  renderEventCard: (event: BookClubEvent) => React.ReactNode;
  renderEventListItem: (event: BookClubEvent) => React.ReactNode;
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
  onRefresh,
  viewMode,
  onViewModeChange,
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
    clearFilterButton: {
      marginLeft: 8,
      backgroundColor: theme.primary,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    clearFilterText: {
      fontSize: 12,
      color: 'white',
      fontWeight: '500',
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
  });

  if (isLoading) {
    return (
      <View style={dynamicStyles.container}>
        <EmptyState
          emoji="🔄"
          title="Loading events..."
          subtitle="Please wait while we fetch the events."
        />
      </View>
    );
  }

  if (!events.length) {
    return (
      <View style={dynamicStyles.container}>
        <EmptyState
          emoji="📅"
          title="No Events"
          subtitle={emptyStateMessage}
        />
      </View>
    );
  }

  return (
    <View style={dynamicStyles.container}>
      {/* Header with View Mode Toggle */}
      <View style={dynamicStyles.header}>
        <Text style={[dynamicStyles.dropdownTitle, { fontSize: 18 }]}>Events</Text>
        <View style={dynamicStyles.viewToggle}>
          <TouchableOpacity
            style={[
              dynamicStyles.toggleButton,
              viewMode === 'card' && dynamicStyles.activeToggle,
            ]}
            onPress={() => onViewModeChange('card')}
          >
            <Text
              style={[
                dynamicStyles.toggleText,
                viewMode === 'card'
                  ? dynamicStyles.activeToggleText
                  : dynamicStyles.inactiveToggleText,
              ]}
            >
              Cards
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              dynamicStyles.toggleButton,
              viewMode === 'list' && dynamicStyles.activeToggle,
            ]}
            onPress={() => onViewModeChange('list')}
          >
            <Text
              style={[
                dynamicStyles.toggleText,
                viewMode === 'list'
                  ? dynamicStyles.activeToggleText
                  : dynamicStyles.inactiveToggleText,
              ]}
            >
              List
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Dropdown */}
      <View style={dynamicStyles.filterContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            style={dynamicStyles.filterButton}
            onPress={() => {
              setDropdownLevel('year');
              setShowDropdown(true);
            }}
          >
            <Text style={dynamicStyles.filterButtonText}>
              {getDropdownTitle()}
            </Text>
            <Text style={dynamicStyles.filterChevron}>▼</Text>
          </TouchableOpacity>
          
          {(selectedFilter.year || selectedFilter.month) && (
            <TouchableOpacity
              style={dynamicStyles.clearFilterButton}
              onPress={handleClearFilter}
            >
              <Text style={dynamicStyles.clearFilterText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Events List */}
      <ScrollView
        style={dynamicStyles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {filteredEvents.map(event => (
          <View key={event.id} style={dynamicStyles.eventSection}>
            {viewMode === 'card'
              ? renderEventCard(event)
              : renderEventListItem(event)}
          </View>
        ))}
        
        {filteredEvents.length === 0 && (
          <EmptyState
            emoji="🔍"
            title="No Events Found"
            subtitle={
              selectedFilter.year || selectedFilter.month
                ? `No events found for ${getDropdownTitle().toLowerCase()}`
                : emptyStateMessage
            }
          />
        )}
      </ScrollView>

      {/* Dropdown Modal */}
      <Modal
        visible={showDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <TouchableOpacity
          style={dynamicStyles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDropdown(false)}
        >
          <View style={dynamicStyles.dropdownModal}>
            <View style={dynamicStyles.dropdownHeader}>
              {dropdownLevel === 'month' && selectedFilter.year && (
                <TouchableOpacity
                  style={dynamicStyles.backButton}
                  onPress={handleBackToYears}
                >
                  <Text style={dynamicStyles.backButtonText}>← Back</Text>
                </TouchableOpacity>
              )}
              
              <Text style={dynamicStyles.dropdownTitle}>
                {dropdownLevel === 'year' ? 'Select Year' : `Select Month (${selectedFilter.year})`}
              </Text>
              
              <TouchableOpacity
                style={dynamicStyles.closeButton}
                onPress={() => setShowDropdown(false)}
              >
                <Text style={dynamicStyles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              style={dynamicStyles.dropdownList}
              data={dropdownLevel === 'year' ? availableYears : availableMonths}
              renderItem={renderDropdownItem}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default EventsGroupedList;