import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../stores/authStore';
import TopNavbar from '../../components/navigation/TopNavbar';
import { Button } from '../../components/common/Button';
import LoadingState from '../../components/common/LoadingState';
import { useTheme } from '../../contexts/ThemeContext';
import { getAllUsers, updateUserRole, getUserStats } from '../../services/userService';
import { User } from '../../types';

interface UserStats {
  totalUsers: number;
  adminCount: number;
  memberCount: number;
  recentSignups: number;
}

const UserManagementScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user: currentUser } = useAuthStore();
  const { theme } = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'admin' | 'member'>('all');

  const styles = createStyles(theme);

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, selectedFilter]);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const [usersData, statsData] = await Promise.all([
        getAllUsers({ limitCount: 1000 }), // Get more users for management
        getUserStats()
      ]);
      
      setUsers(usersData.users); // Extract the users array from the result
      setUserStats(statsData);
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load user data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadUserData();
    setIsRefreshing(false);
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by role
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(user => user.role === selectedFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.displayName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    }

    setFilteredUsers(filtered);
  };

  const handleRoleChange = async (userId: string, currentRole: 'admin' | 'member') => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    // Prevent user from demoting themselves
    if (userId === currentUser?.id && currentRole === 'admin') {
      Alert.alert('Warning', 'You cannot remove admin privileges from yourself.');
      return;
    }

    const newRole = currentRole === 'admin' ? 'member' : 'admin';
    const actionText = newRole === 'admin' ? 'promote to Admin' : 'demote to Member';

    Alert.alert(
      'Confirm Role Change',
      `Are you sure you want to ${actionText} ${targetUser.displayName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: newRole === 'admin' ? 'default' : 'destructive',
          onPress: () => updateRole(userId, newRole)
        }
      ]
    );
  };

  const updateRole = async (userId: string, newRole: 'admin' | 'member') => {
    try {
      await updateUserRole(userId, newRole);
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));

      // Update stats
      if (userStats) {
        const adjustment = newRole === 'admin' ? 1 : -1;
        setUserStats(prev => prev ? {
          ...prev,
          adminCount: prev.adminCount + adjustment,
          memberCount: prev.memberCount - adjustment
        } : null);
      }

      Alert.alert('Success', `User role updated to ${newRole}`);
    } catch (error) {
      console.error('Error updating user role:', error);
      Alert.alert('Error', 'Failed to update user role. Please try again.');
    }
  };

  const getRoleDisplayName = (role: 'admin' | 'member') => {
    return role === 'admin' ? 'Admin' : 'Member';
  };

  const getRoleBadgeStyle = (role: 'admin' | 'member') => {
    return role === 'admin' ? styles.adminBadge : styles.memberBadge;
  };

  const getRoleTextStyle = (role: 'admin' | 'member') => {
    return role === 'admin' ? styles.adminBadgeText : styles.memberBadgeText;
  };

  const UserCard: React.FC<{ user: User }> = ({ user }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <View style={styles.userHeader}>
          <Text style={styles.userName}>{user.displayName}</Text>
          <View style={getRoleBadgeStyle(user.role)}>
            <Text style={getRoleTextStyle(user.role)}>
              {getRoleDisplayName(user.role)}
            </Text>
          </View>
        </View>
        <Text style={styles.userEmail}>{user.email}</Text>
        <Text style={styles.userDate}>
          Joined {user.createdAt.toLocaleDateString()}
        </Text>
      </View>
      
      <Button
        title={user.role === 'admin' ? '↓ Demote' : '↑ Promote'}
        onPress={() => handleRoleChange(user.id, user.role)}
        disabled={user.id === currentUser?.id && user.role === 'admin'}
        variant={user.role === 'admin' ? 'warning' : 'success'}
        size="small"
      />
    </View>
  );

  const FilterButton: React.FC<{
    filter: 'all' | 'admin' | 'member';
    label: string;
    count: number;
  }> = ({ filter, label, count }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === filter && styles.filterButtonActive
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text style={[
        styles.filterButtonText,
        selectedFilter === filter && styles.filterButtonTextActive
      ]}>
        {label} ({count})
      </Text>
    </TouchableOpacity>
  );

  if (isLoading && !users.length) {
    return (
      <View style={styles.container}>
        <TopNavbar title="User Management" />
        <LoadingState text="Loading users..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopNavbar title="User Management" />
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Section */}
        {userStats && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>User Statistics</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{userStats.totalUsers}</Text>
                <Text style={styles.statLabel}>Total Users</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{userStats.adminCount}</Text>
                <Text style={styles.statLabel}>Admins</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{userStats.memberCount}</Text>
                <Text style={styles.statLabel}>Members</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{userStats.recentSignups}</Text>
                <Text style={styles.statLabel}>New (7 days)</Text>
              </View>
            </View>
          </View>
        )}

        {/* Search and Filter Section */}
        <View style={styles.controlsSection}>
          <Text style={styles.sectionTitle}>Manage Users</Text>
          
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or email..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          <View style={styles.filterButtons}>
            <FilterButton
              filter="all"
              label="All"
              count={users.length}
            />
            <FilterButton
              filter="admin"
              label="Admins"
              count={userStats?.adminCount || 0}
            />
            <FilterButton
              filter="member"
              label="Members"
              count={userStats?.memberCount || 0}
            />
          </View>
        </View>

        {/* Users List */}
        <View style={styles.usersSection}>
          {filteredUsers.length > 0 ? (
            filteredUsers.map(user => (
              <UserCard key={user.id} user={user} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                {searchQuery.trim() ? 'No users found matching your search.' : 'No users found.'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 16,
  },
  statsSection: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: 80,
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    textAlign: 'center',
  },
  controlsSection: {
    marginBottom: 24,
  },
  searchInput: {
    backgroundColor: theme.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: theme.text,
    borderWidth: 1,
    borderColor: theme.border,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    backgroundColor: theme.surface,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  filterButtonActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
  },
  filterButtonTextActive: {
    color: 'white',
  },
  usersSection: {
    gap: 12,
  },
  userCard: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.border,
  },
  userInfo: {
    flex: 1,
    marginRight: 12,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginRight: 8,
    flex: 1,
  },
  adminBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  memberBadge: {
    backgroundColor: '#6b7280',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  adminBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  memberBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  userEmail: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 2,
  },
  userDate: {
    fontSize: 12,
    color: theme.textSecondary,
  },

  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
  },
});

export default UserManagementScreen; 