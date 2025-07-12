export type NotificationType = 
  | 'mention'
  | 'event_update'
  | 'event_approved'
  | 'event_rejected'
  | 'rsvp_update'
  | 'comment_reply'
  | 'friend_request'
  | 'friend_request_accepted'
  | 'profile_comment'
  | 'profile_comment_reply'
  | 'admin_message'
  | 'new_report'
  | 'report_resolved'
  | 'announcement';

export interface Notification {
  id: string;
  userId: string; // recipient
  type: NotificationType;
  title: string;
  message: string;
  data?: any; // Additional data specific to notification type
  isRead: boolean;
  eventId?: string; // Associated event if applicable
  fromUserId?: string; // User who triggered the notification
  fromUserName?: string;
  fromUserProfilePicture?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationData {
  // For mentions
  mention?: {
    commentId: string;
    eventTitle: string;
    mentionText: string;
  };
  
  // For event updates
  eventUpdate?: {
    eventTitle: string;
    changes: string[];
  };
  
  // For event approval/rejection
  eventApproval?: {
    eventTitle: string;
    status: 'approved' | 'rejected';
  };
  
  // For RSVP updates
  rsvpUpdate?: {
    eventTitle: string;
    status: 'going' | 'maybe' | 'not-going';
  };
  
  // For comment replies
  commentReply?: {
    commentId: string;
    eventTitle: string;
    replyText: string;
  };
  
  // For friend requests
  friendRequest?: {
    requestId: string;
    fromUserName: string;
  };
  
  // For friend request acceptance
  friendshipAccepted?: {
    friendName: string;
  };
  
  // For profile comments
  profileComment?: {
    commentId: string;
    profileUserName: string;
  };
  
  // For profile comment replies
  profileCommentReply?: {
    commentId: string;
    parentCommentId: string;
    profileUserName: string;
  };
  
  // For admin messages
  adminMessage?: {
    messageText: string;
  };
  
  // For new reports (admin notification)
  newReport?: {
    reportId: string;
    reportType: string;
    contentPreview: string;
    reporterName: string;
  };
  
  // For report resolution (reporter notification)
  reportResolved?: {
    reportId: string;
    reportType: string;
    contentPreview: string;
    resolution: string;
  };
  
  // For announcements
  announcement?: {
    announcementId: string;
    content: string;
    adminName: string;
  };
}

export interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: NotificationData;
  eventId?: string;
  fromUserId?: string;
  fromUserName?: string;
  fromUserProfilePicture?: string;
}

export interface NotificationStats {
  totalUnread: number;
  unreadByType: Record<NotificationType, number>;
}

export interface NotificationSettings {
  userId: string;
  mentions: boolean;
  eventUpdates: boolean;
  eventApprovals: boolean;
  rsvpUpdates: boolean;
  commentReplies: boolean;
  friendRequests: boolean;
  friendRequestAccepted: boolean;
  profileComments: boolean;
  profileCommentReplies: boolean;
  adminMessages: boolean;
  newReports: boolean;
  reportResolutions: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
} 