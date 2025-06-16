import React from 'react';
import { View, StyleSheet } from 'react-native';
import Skeleton from './Skeleton';

interface ListItemSkeletonProps {
  showAvatar?: boolean;
  showSubtitle?: boolean;
  showBadge?: boolean;
}

const ListItemSkeleton: React.FC<ListItemSkeletonProps> = ({ 
  showAvatar = true, 
  showSubtitle = true,
  showBadge = false 
}) => {
  return (
    <View style={styles.container}>
      {showAvatar && (
        <Skeleton height={40} width={40} borderRadius={20} />
      )}
      
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Skeleton height={16} width="70%" />
          {showBadge && (
            <Skeleton height={20} width={60} borderRadius={10} />
          )}
        </View>
        
        {showSubtitle && (
          <Skeleton height={14} width="50%" style={styles.subtitle} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    gap: 12,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subtitle: {
    marginTop: 6,
  },
});

export default ListItemSkeleton; 