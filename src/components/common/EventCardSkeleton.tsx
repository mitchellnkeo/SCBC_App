import React from 'react';
import { View, StyleSheet } from 'react-native';
import Skeleton from './Skeleton';

const EventCardSkeleton: React.FC = () => {
  return (
    <View style={styles.card}>
      {/* Header image skeleton */}
      <Skeleton height={150} borderRadius={12} style={styles.headerImage} />
      
      <View style={styles.content}>
        {/* Title skeleton */}
        <Skeleton height={24} width="80%" style={styles.title} />
        
        {/* Date and time skeleton */}
        <View style={styles.dateTimeRow}>
          <Skeleton height={16} width={100} />
          <Skeleton height={16} width={80} />
        </View>
        
        {/* Location skeleton */}
        <Skeleton height={16} width="60%" style={styles.location} />
        
        {/* Host info skeleton */}
        <View style={styles.hostInfo}>
          <Skeleton height={32} width={32} borderRadius={16} />
          <View style={styles.hostText}>
            <Skeleton height={14} width={80} />
            <Skeleton height={12} width={60} style={styles.hostSubtext} />
          </View>
        </View>
        
        {/* Status skeleton */}
        <View style={styles.statusRow}>
          <Skeleton height={8} width={8} borderRadius={4} />
          <Skeleton height={12} width={70} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerImage: {
    marginBottom: 0,
  },
  content: {
    padding: 16,
  },
  title: {
    marginBottom: 12,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  location: {
    marginBottom: 12,
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  hostText: {
    flex: 1,
  },
  hostSubtext: {
    marginTop: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});

export default EventCardSkeleton; 