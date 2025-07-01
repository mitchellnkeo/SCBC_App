import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  ScrollView,
  RefreshControl,
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
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});

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

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
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
    yearHeader: {
      backgroundColor: theme.surface,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    yearText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
    },
    monthHeader: {
      backgroundColor: theme.background,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    monthText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.textSecondary,
    },
    content: {
      flex: 1,
      paddingHorizontal: 16,
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
    chevron: {
      fontSize: 16,
      marginLeft: 8,
      color: theme.textSecondary,
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
      {/* View Mode Toggle */}
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.yearText}>Events</Text>
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

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {Object.keys(groupedEvents)
          .sort((a, b) => Number(b) - Number(a)) // Sort years in descending order
          .map(year => (
            <View key={year}>
              <TouchableOpacity
                style={dynamicStyles.yearHeader}
                onPress={() => toggleSection(`${year}`)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={dynamicStyles.yearText}>{year}</Text>
                  <Text style={dynamicStyles.chevron}>
                    {expandedSections[year] ? '▼' : '▶'}
                  </Text>
                </View>
              </TouchableOpacity>

              {expandedSections[year] &&
                Object.keys(groupedEvents[year])
                  .sort((a, b) => {
                    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                                  'July', 'August', 'September', 'October', 'November', 'December'];
                    return months.indexOf(b) - months.indexOf(a);
                  })
                  .map(month => (
                    <View key={`${year}-${month}`}>
                      <TouchableOpacity
                        style={dynamicStyles.monthHeader}
                        onPress={() => toggleSection(`${year}-${month}`)}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={dynamicStyles.monthText}>{month}</Text>
                          <Text style={dynamicStyles.chevron}>
                            {expandedSections[`${year}-${month}`] ? '▼' : '▶'}
                          </Text>
                        </View>
                      </TouchableOpacity>

                      {expandedSections[`${year}-${month}`] && (
                        <View style={dynamicStyles.content}>
                          {groupedEvents[year][month].map(event => (
                            <View key={event.id}>
                              {viewMode === 'card'
                                ? renderEventCard(event)
                                : renderEventListItem(event)}
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  ))}
            </View>
          ))}
      </ScrollView>
    </View>
  );
};

export default EventsGroupedList; 