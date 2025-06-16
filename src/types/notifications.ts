export type NotificationType = 
  | 'mention'
  | 'event_update'
  | 'event_approved'
  | 'event_rejected'
  | 'rsvp_update'
  | 'comment_reply'
  | 'admin_message';

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
  adminMessages: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
} 