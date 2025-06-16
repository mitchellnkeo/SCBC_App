export interface Mention {
  id: string;
  userId: string;
  userName: string;
  userProfilePicture?: string;
  startIndex: number;
  endIndex: number;
  displayName: string; // e.g., "@johnsmith"
}

export interface CommentWithMentions {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userProfilePicture?: string;
  content: string;
  mentions: Mention[];
  parentCommentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSuggestion {
  id: string;
  displayName: string;
  profilePicture?: string;
  matchScore: number; // for sorting relevance
}

export interface MentionSuggestion {
  users: UserSuggestion[];
  query: string;
  position: number; // cursor position in text
}

export type MentionInputProps = {
  value: string;
  onChangeText: (text: string, mentions: Mention[]) => void;
  placeholder?: string;
  maxLength?: number;
  multiline?: boolean;
  style?: any;
  onSubmit?: () => void;
  users: UserSuggestion[]; // available users for suggestions
}; 