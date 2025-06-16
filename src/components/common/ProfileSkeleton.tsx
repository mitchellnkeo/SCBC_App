import React from 'react';
import { View, StyleSheet } from 'react-native';
import Skeleton from './Skeleton';

const ProfileSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Title skeleton */}
      <Skeleton height={28} width={150} style={styles.title} />
      <Skeleton height={16} width={250} style={styles.subtitle} />
      
      {/* User card skeleton */}
      <View style={styles.userCard}>
        <View style={styles.userHeader}>
          {/* Profile picture skeleton */}
          <Skeleton height={80} width={80} borderRadius={40} />
          
          <View style={styles.userDetails}>
            {/* Name skeleton */}
            <Skeleton height={20} width={120} style={styles.userName} />
            {/* Email skeleton */}
            <Skeleton height={16} width={200} style={styles.userEmail} />
            {/* Role badge skeleton */}
            <Skeleton height={20} width={60} borderRadius={10} style={styles.roleBadge} />
          </View>
        </View>
        
        {/* Bio section skeleton */}
        <View style={styles.bioSection}>
          <Skeleton height={18} width={80} style={styles.sectionTitle} />
          <Skeleton height={16} width="100%" style={styles.bioLine} />
          <Skeleton height={16} width="85%" style={styles.bioLine} />
          <Skeleton height={16} width="60%" />
        </View>
        
        {/* Hobbies section skeleton */}
        <View style={styles.interestsSection}>
          <Skeleton height={18} width={120} style={styles.sectionTitle} />
          <View style={styles.tagsContainer}>
            {[1, 2, 3, 4].map((index) => (
              <Skeleton 
                key={index} 
                height={28} 
                width={index === 1 ? 80 : index === 2 ? 100 : index === 3 ? 70 : 90} 
                borderRadius={14} 
                style={styles.tag} 
              />
            ))}
          </View>
        </View>
        
        {/* Favorite books section skeleton */}
        <View style={styles.booksSection}>
          <Skeleton height={18} width={140} style={styles.sectionTitle} />
          <View style={styles.tagsContainer}>
            {[1, 2, 3].map((index) => (
              <Skeleton 
                key={index} 
                height={28} 
                width={index === 1 ? 120 : index === 2 ? 110 : 90} 
                borderRadius={14} 
                style={styles.tag} 
              />
            ))}
          </View>
        </View>
      </View>
      
      {/* Actions section skeleton */}
      <View style={styles.actionsSection}>
        <Skeleton height={18} width={100} style={styles.sectionTitle} />
        
        {/* Action items skeleton */}
        {[1, 2].map((index) => (
          <View key={index} style={styles.actionItem}>
            <View style={styles.actionContent}>
              <Skeleton height={16} width={150} />
              <Skeleton height={14} width={200} style={styles.actionSubtext} />
            </View>
          </View>
        ))}
      </View>
      
      {/* Logout button skeleton */}
      <View style={styles.logoutSection}>
        <Skeleton height={48} width="100%" borderRadius={12} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 24,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 24,
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  userHeader: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 16,
  },
  userDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    marginBottom: 8,
  },
  userEmail: {
    marginBottom: 12,
  },
  roleBadge: {
    alignSelf: 'flex-start',
  },
  bioSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  bioLine: {
    marginBottom: 8,
  },
  interestsSection: {
    marginBottom: 20,
  },
  booksSection: {
    marginBottom: 0,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    marginBottom: 8,
  },
  actionsSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  actionContent: {
    flex: 1,
  },
  actionSubtext: {
    marginTop: 4,
  },
  logoutSection: {
    marginTop: 'auto',
    paddingTop: 20,
  },
});

export default ProfileSkeleton; 