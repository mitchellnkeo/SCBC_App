import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Skeleton from './Skeleton';

const { width: screenWidth } = Dimensions.get('window');

const EventDetailsSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Header image skeleton */}
      <Skeleton height={250} width={screenWidth} borderRadius={0} />
      
      <View style={styles.content}>
        {/* Title skeleton */}
        <Skeleton height={32} width="90%" style={styles.title} />
        
        {/* Date and time row */}
        <View style={styles.infoRow}>
          <Skeleton height={20} width={120} />
          <Skeleton height={20} width={80} />
        </View>
        
        {/* Location skeleton */}
        <View style={styles.locationSection}>
          <Skeleton height={18} width={100} style={styles.sectionTitle} />
          <Skeleton height={16} width="70%" />
        </View>
        
        {/* Host info skeleton */}
        <View style={styles.hostSection}>
          <Skeleton height={18} width={80} style={styles.sectionTitle} />
          <View style={styles.hostInfo}>
            <Skeleton height={40} width={40} borderRadius={20} />
            <Skeleton height={16} width={120} />
          </View>
        </View>
        
        {/* Description skeleton */}
        <View style={styles.descriptionSection}>
          <Skeleton height={18} width={100} style={styles.sectionTitle} />
          <Skeleton height={16} width="100%" style={styles.descriptionLine} />
          <Skeleton height={16} width="90%" style={styles.descriptionLine} />
          <Skeleton height={16} width="75%" style={styles.descriptionLine} />
        </View>
        
        {/* RSVP section skeleton */}
        <View style={styles.rsvpSection}>
          <Skeleton height={18} width={120} style={styles.sectionTitle} />
          <View style={styles.rsvpButtons}>
            <Skeleton height={40} width={80} borderRadius={20} />
            <Skeleton height={40} width={80} borderRadius={20} />
            <Skeleton height={40} width={100} borderRadius={20} />
          </View>
          <Skeleton height={16} width="60%" style={styles.rsvpCount} />
        </View>
        
        {/* Comments section skeleton */}
        <View style={styles.commentsSection}>
          <Skeleton height={18} width={100} style={styles.sectionTitle} />
          {[1, 2, 3].map((index) => (
            <View key={index} style={styles.commentItem}>
              <Skeleton height={32} width={32} borderRadius={16} />
              <View style={styles.commentContent}>
                <Skeleton height={14} width={100} />
                <Skeleton height={16} width="90%" style={styles.commentText} />
                <Skeleton height={16} width="70%" />
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 24,
  },
  title: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  locationSection: {
    marginBottom: 20,
  },
  hostSection: {
    marginBottom: 20,
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  descriptionSection: {
    marginBottom: 24,
  },
  descriptionLine: {
    marginBottom: 8,
  },
  rsvpSection: {
    marginBottom: 24,
  },
  rsvpButtons: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 12,
  },
  rsvpCount: {
    marginTop: 8,
  },
  commentsSection: {
    marginBottom: 24,
  },
  commentItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  commentContent: {
    flex: 1,
  },
  commentText: {
    marginVertical: 6,
  },
  sectionTitle: {
    marginBottom: 8,
  },
});

export default EventDetailsSkeleton; 