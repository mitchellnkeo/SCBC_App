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
  }, [searchQuery]);

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
      const results = await searchUsers(searchQuery.trim(), 10);
      // Filter out self and current friends
      const filteredResults = results.filter(
        (result) => result.id !== user?.id && !friends.some((friend) => friend.id === result.id)
      );
      setSearchResults(filteredResults);
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
});

export default FriendsScreen; 