import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuthStore } from '../../stores/authStore';
import {
  getPendingFriendRequests,
  getSentFriendRequests,
  getUserFriends,
  acceptFriendRequest,
  declineFriendRequest,
  cancelFriendRequest,
  removeFriend,
  subscribeToFriendRequests,
  subscribeToUserFriends,
  searchUsers,
} from '../../services';
import { FriendRequest, User } from '../../types';
import { handleError } from '../../utils/errorHandler';
import { formatTimeAgo } from '../../utils/dateTimeUtils';
import ProfilePicture from '../../components/common/ProfilePicture';
import ClickableUser from '../../components/common/ClickableUser';
import FriendRequestButton from '../../components/friends/FriendRequestButton';
import EmptyState from '../../components/common/EmptyState';
import TopNavbar from '../../components/navigation/TopNavbar';

type TabType = 'requests' | 'friends' | 'discover';

const FriendsScreen: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('requests');
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    hasProfilePicture: false,
    isActive: false, // Active in last 30 days
    sortBy: 'relevance' as 'relevance' | 'name' | 'recent',
  });

  const styles = createStyles(theme);

  useEffect(() => {
    if (!user) return;

    loadData();

    // Set up real-time subscriptions
    const unsubscribeRequests = subscribeToFriendRequests(user.id, (requests) => {
      setIncomingRequests(requests);
    });

    const unsubscribeFriends = subscribeToUserFriends(user.id, (userFriends) => {
      setFriends(userFriends);
    });

    return () => {
      unsubscribeRequests();
      unsubscribeFriends();
    };
  }, [user?.id]);

  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, searchFilters]);

  const loadData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const [incoming, sent, userFriends] = await Promise.all([
        getPendingFriendRequests(user.id),
        getSentFriendRequests(user.id),
        getUserFriends(user.id),
      ]);

      setIncomingRequests(incoming);
      setSentRequests(sent);
      setFriends(userFriends);
    } catch (error) {
      handleError(error, { showAlert: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setIsSearching(true);
      const results = await searchUsers(searchQuery.trim(), { limitCount: 20 }); // Get more results for filtering
      
      // Filter out self and current friends
      let filteredResults = results.users.filter(
        (result) => result.id !== user?.id && !friends.some((friend) => friend.id === result.id)
      );

      // Apply additional filters
      if (searchFilters.hasProfilePicture) {
        filteredResults = filteredResults.filter(user => user.profilePicture);
      }

      if (searchFilters.isActive) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        filteredResults = filteredResults.filter(user => 
          user.lastActiveAt && new Date(user.lastActiveAt) > thirtyDaysAgo
        );
      }

      // Apply sorting
      switch (searchFilters.sortBy) {
        case 'name':
          filteredResults.sort((a, b) => a.displayName.localeCompare(b.displayName));
          break;
        case 'recent':
          filteredResults.sort((a, b) => {
            const aDate = a.lastActiveAt ? new Date(a.lastActiveAt) : new Date(0);
            const bDate = b.lastActiveAt ? new Date(b.lastActiveAt) : new Date(0);
            return bDate.getTime() - aDate.getTime();
          });
          break;
        // 'relevance' is default from search results
      }

      // Limit final results
      setSearchResults(filteredResults.slice(0, 10));
    } catch (error) {
      handleError(error, { showAlert: true });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAcceptRequest = async (request: FriendRequest) => {
    try {
      await acceptFriendRequest(request.id);
    } catch (error) {
      handleError(error, { showAlert: true });
    }
  };

  const handleDeclineRequest = async (request: FriendRequest) => {
    Alert.alert(
      'Decline Friend Request',
      `Decline friend request from ${request.fromUserName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            try {
              await declineFriendRequest(request.id);
            } catch (error) {
              handleError(error, { showAlert: true });
            }
          },
        },
      ]
    );
  };

  const handleCancelRequest = async (request: FriendRequest) => {
    Alert.alert(
      'Cancel Friend Request',
      `Cancel friend request to ${request.toUserName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Cancel Request',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelFriendRequest(request.id);
            } catch (error) {
              handleError(error, { showAlert: true });
            }
          },
        },
      ]
    );
  };

  const renderIncomingRequestItem = ({ item: request }: { item: FriendRequest }) => (
    <View style={styles.requestItem}>
      <ClickableUser
        userId={request.fromUserId}
        displayName={request.fromUserName}
        profilePicture={request.fromUserProfilePicture}
        showAvatar
        avatarSize="medium"
      />
      <View style={styles.requestContent}>
        <Text style={styles.requestText}>
          <Text style={styles.requestUserName}>{request.fromUserName}</Text>
          <Text style={styles.requestMessage}> sent you a friend request</Text>
        </Text>
        <Text style={styles.requestTime}>{formatTimeAgo(request.createdAt)}</Text>
        <View style={styles.requestActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => handleAcceptRequest(request)}
          >
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.declineButton]}
            onPress={() => handleDeclineRequest(request)}
          >
            <Text style={styles.declineButtonText}>Decline</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderSentRequestItem = ({ item: request }: { item: FriendRequest }) => (
    <View style={styles.requestItem}>
      <ClickableUser
        userId={request.toUserId}
        displayName={request.toUserName}
        profilePicture={request.toUserProfilePicture}
        showAvatar
        avatarSize="medium"
      />
      <View style={styles.requestContent}>
        <Text style={styles.requestText}>
          <Text style={styles.requestMessage}>Friend request sent to </Text>
          <Text style={styles.requestUserName}>{request.toUserName}</Text>
        </Text>
        <Text style={styles.requestTime}>{formatTimeAgo(request.createdAt)}</Text>
        <TouchableOpacity
          style={[styles.actionButton, styles.cancelButton]}
          onPress={() => handleCancelRequest(request)}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFriendItem = ({ item: friend }: { item: User }) => (
    <View style={styles.friendItem}>
      <ClickableUser
        userId={friend.id}
        displayName={friend.displayName}
        profilePicture={friend.profilePicture}
        showAvatar
        avatarSize="medium"
      />
      <View style={styles.friendContent}>
        <Text style={styles.friendName}>{friend.displayName}</Text>
        {friend.email && <Text style={styles.friendEmail}>{friend.email}</Text>}
      </View>
    </View>
  );

  const renderDiscoverItem = ({ item: user }: { item: User }) => (
    <View style={styles.discoverItem}>
      <ClickableUser
        userId={user.id}
        displayName={user.displayName}
        profilePicture={user.profilePicture}
        showAvatar
        avatarSize="medium"
      />
      <View style={styles.discoverContent}>
        <Text style={styles.discoverName}>{user.displayName}</Text>
        {user.email && <Text style={styles.discoverEmail}>{user.email}</Text>}
        {user.lastActiveAt && (
          <Text style={styles.discoverActivity}>
            Active {formatTimeAgo(user.lastActiveAt)}
          </Text>
        )}
      </View>
      <FriendRequestButton
        targetUserId={user.id}
        targetUserName={user.displayName}
        targetUserProfilePicture={user.profilePicture}
        style={styles.discoverButton}
      />
    </View>
  );

  const renderRequestsTab = () => {
    const hasIncoming = incomingRequests.length > 0;
    const hasSent = sentRequests.length > 0;

    if (!hasIncoming && !hasSent) {
      return (
        <EmptyState
          emoji="👥"
          title="No Friend Requests"
          subtitle="You don't have any pending friend requests."
        />
      );
    }

    return (
      <View style={styles.requestsContainer}>
        {hasIncoming && (
          <View style={styles.requestSection}>
            <Text style={styles.sectionTitle}>
              Incoming Requests ({incomingRequests.length})
            </Text>
            <FlatList
              data={incomingRequests}
              renderItem={renderIncomingRequestItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        {hasSent && (
          <View style={styles.requestSection}>
            <Text style={styles.sectionTitle}>
              Sent Requests ({sentRequests.length})
            </Text>
            <FlatList
              data={sentRequests}
              renderItem={renderSentRequestItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}
      </View>
    );
  };

  const renderFriendsTab = () => {
    if (friends.length === 0) {
      return (
        <EmptyState
          emoji="🤝"
          title="No Friends Yet"
          subtitle="Start adding friends to build your book club community!"
        />
      );
    }

    return (
      <FlatList
        data={friends}
        renderItem={renderFriendItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  const renderDiscoverTab = () => (
    <View style={styles.discoverContainer}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for book club members..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Text style={styles.filterButtonText}>Filters</Text>
        </TouchableOpacity>
      </View>

      {searchQuery.trim() ? (
        searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
            renderItem={renderDiscoverItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        ) : isSearching ? (
          <Text style={styles.searchingText}>Searching...</Text>
        ) : (
          <EmptyState
            emoji="🔍"
            title="No Results"
            subtitle={`No members found for "${searchQuery}"`}
          />
        )
      ) : (
        <EmptyState
          emoji="🔍"
          title="Discover Friends"
          subtitle="Search for other book club members to add as friends."
        />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TopNavbar title="Friends" />

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
          onPress={() => setActiveTab('requests')}
        >
          <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>
            Requests
          </Text>
          {incomingRequests.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{incomingRequests.length}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
          onPress={() => setActiveTab('friends')}
        >
          <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
            Friends ({friends.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'discover' && styles.activeTab]}
          onPress={() => setActiveTab('discover')}
        >
          <Text style={[styles.tabText, activeTab === 'discover' && styles.activeTabText]}>
            Discover
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'requests' && renderRequestsTab()}
        {activeTab === 'friends' && renderFriendsTab()}
        {activeTab === 'discover' && renderDiscoverTab()}
      </View>

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFilters(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Search Filters</Text>
            <TouchableOpacity 
              onPress={() => {
                setSearchFilters({
                  hasProfilePicture: false,
                  isActive: false,
                  sortBy: 'relevance',
                });
              }}
            >
              <Text style={styles.modalResetText}>Reset</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            {/* Profile Picture Filter */}
            <TouchableOpacity
              style={styles.filterOption}
              onPress={() => setSearchFilters(prev => ({ ...prev, hasProfilePicture: !prev.hasProfilePicture }))}
            >
              <Text style={styles.filterLabel}>Has Profile Picture</Text>
              <View style={[styles.checkbox, searchFilters.hasProfilePicture && styles.checkboxChecked]}>
                {searchFilters.hasProfilePicture && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </TouchableOpacity>

            {/* Active Users Filter */}
            <TouchableOpacity
              style={styles.filterOption}
              onPress={() => setSearchFilters(prev => ({ ...prev, isActive: !prev.isActive }))}
            >
              <Text style={styles.filterLabel}>Active in Last 30 Days</Text>
              <View style={[styles.checkbox, searchFilters.isActive && styles.checkboxChecked]}>
                {searchFilters.isActive && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </TouchableOpacity>

            {/* Sort Options */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Sort By</Text>
              {[
                { key: 'relevance', label: 'Relevance' },
                { key: 'name', label: 'Name' },
                { key: 'recent', label: 'Recently Active' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={styles.sortOption}
                  onPress={() => setSearchFilters(prev => ({ ...prev, sortBy: option.key as any }))}
                >
                  <Text style={styles.sortLabel}>{option.label}</Text>
                  <View style={[styles.radio, searchFilters.sortBy === option.key && styles.radioSelected]}>
                    {searchFilters.sortBy === option.key && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'relative',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: theme.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textSecondary,
  },
  activeTabText: {
    color: theme.primary,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: theme.error,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  requestsContainer: {
    flex: 1,
    padding: 16,
  },
  requestSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 12,
  },
  requestItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: theme.card,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'flex-start',
  },
  requestContent: {
    flex: 1,
    marginLeft: 12,
  },
  requestText: {
    fontSize: 14,
    color: theme.text,
    marginBottom: 4,
  },
  requestUserName: {
    fontWeight: '600',
  },
  requestMessage: {
    color: theme.textSecondary,
  },
  requestTime: {
    fontSize: 12,
    color: theme.textTertiary,
    marginBottom: 12,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButton: {
    backgroundColor: theme.success || theme.primary,
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  declineButton: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  declineButtonText: {
    color: theme.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  cancelButton: {
    backgroundColor: theme.error,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  friendItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: theme.card,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
  },
  friendContent: {
    flex: 1,
    marginLeft: 12,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 2,
  },
  friendEmail: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  discoverContainer: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: theme.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  searchInput: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.text,
  },
  searchingText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: theme.textSecondary,
  },
  discoverItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: theme.card,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
  },
  discoverContent: {
    flex: 1,
    marginLeft: 12,
  },
  discoverName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 2,
  },
  discoverEmail: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  discoverButton: {
    marginLeft: 12,
  },
  discoverActivity: {
    fontSize: 12,
    color: theme.textTertiary,
    marginTop: 2,
  },
  filterButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  filterButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: theme.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.card,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
  },
  modalCancelText: {
    fontSize: 16,
    color: theme.textSecondary,
  },
  modalResetText: {
    fontSize: 16,
    color: theme.primary,
    fontWeight: '500',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  filterLabel: {
    fontSize: 16,
    color: theme.text,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: theme.border,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  filterSection: {
    marginTop: 24,
  },
  filterSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 16,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  sortLabel: {
    fontSize: 16,
    color: theme.text,
  },
  radio: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: theme.border,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: theme.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    backgroundColor: theme.primary,
    borderRadius: 5,
  },
  modalFooter: {
    padding: 16,
    backgroundColor: theme.card,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  applyButton: {
    backgroundColor: theme.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FriendsScreen; 