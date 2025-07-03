# 📚 Seattle Chinatown Book Club App

<div align="center">

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white)
![Expo](https://img.shields.io/badge/Expo-1C1E24?style=for-the-badge&logo=expo&logoColor=#D04A37)

**A comprehensive mobile application for the Seattle Chinatown Book Club community**

*Connecting AANHPI voices through literature and community events*

</div>

## 🌟 **Overview**

The Seattle Chinatown Book Club App is a production-ready React Native application designed for a growing community of 300+ members. Built with modern technologies and scalable architecture, it provides a complete platform for book club management, community interaction, and event coordination.


### **Accessibility & UX**
- **WCAG AA Compliance** - Color-blind friendly red color scheme with proper contrast ratios
- **508 Compliance** - Accessible color choices for government and enterprise use
- **Professional Design** - Removed decorative elements for cleaner, more professional appearance

### **Optimization Benefits**
- **🏗️ Maintainability:** Centralized utilities and components reduce technical debt
- **🎨 Consistency:** Uniform UI patterns and behaviors across the entire application
- **⚡ Performance:** Smaller bundle size and reduced redundant code execution
- **👩‍💻 Developer Experience:** Reusable components and utilities speed up development
- **👤 User Experience:** Consistent interactions and visual language throughout the app
- **🔒 Security:** Zero compromises - all functionality and security measures preserved

## ✨ **Key Features**

### 📅 **Event Management**
- **Create & Host Events** - Members can create book club events with rich details
- **Admin Approval System** - All member-created events require admin approval
- **RSVP System** - Going/Maybe/Not Going with real-time attendee counts
- **Event Comments** - Threaded discussions with @mentions, notifications, and image support
- **Calendar Integration** - Add events directly to device calendars
- **Image Support** - Upload event header images and comment images (up to 3 per comment)
- **Image Viewer** - Full-screen image viewer for event and comment images
- **Media Options** - Choose images from camera or gallery with compression

### 👥 **Social & User System**
- **Role-Based Access** - Admin and Member roles with different permissions
- **Rich Profiles** - Bio, hobbies, favorite books, profile pictures, social media links
- **Friend System** - Send/accept/decline friend requests with real-time updates
- **Profile Comment Walls** - Friends can comment on each other's profiles
- **@Mention System** - Tag users in comments with real-time notifications
- **User Discovery** - Search and view other member profiles
- **Friend Management** - Comprehensive friends screen with discovery and request management

### 🔐 **Account Recovery System**
- **Password Reset** - Email-based password recovery with Firebase Auth integration
- **Username Recovery** - Find accounts by display name with smart search
- **Email Validation** - Prevents sending reset emails to non-existent accounts
- **Security Features** - Rate limiting, secure reset links, and anti-abuse measures
- **Dual Recovery Methods** - Both email and username-based account recovery
- **User-Friendly Interface** - Clean tabbed interface with helpful guidance

### 📖 **Monthly Meeting Details**
- **Admin-Editable Books** - Complete monthly book selection management
- **Meeting Details Management** - In-person and virtual meeting information with admin controls
- **Zoom Integration** - Enhanced Zoom link handling with email, phone, and clipboard options
- **Book Cover Upload** - Upload and manage book cover images
- **Discussion Sheets** - Link to Google Docs for reading guides
- **Book Details** - Title, author, genre, pages, awards, selection reasoning

### 🔔 **Notification System**
- **Real-Time Notifications** - Instant updates for mentions, comments, events, friend requests
- **Social Notifications** - Friend request notifications, profile comment alerts, friend acceptance
- **RSVP Notifications** - Event hosts notified when users RSVP or change status
- **Push Notifications** - Cross-platform notification support
- **Notification Center** - In-app notification management with date grouping
- **Smart Batching** - Efficient notification delivery with read/unread status
- **Notification Badge** - Unread count indicator in navigation

### 🛡️ **Admin Panel**
- **Event Approval** - Review and approve/reject member events
- **User Management** - Manage user roles and permissions
- **Monthly Book Control** - Full CRUD operations for book selections
- **Meeting Details Management** - Control in-person and virtual meeting information
- **FAQ Management** - Streamlined FAQ system with auto-publishing
- **Content Moderation** - Admin oversight of community content

### 📧 **Community Engagement**
- **Email Newsletter Signup** - Direct integration with MailerLite for community updates
- **Social Media Integration** - Connect with Instagram, X (Twitter), and LinkedIn
- **Event Sharing** - Native sharing functionality for events across platforms
- **WhatsApp Community** - Integration with book club WhatsApp group

### 🎨 **User Experience**
- **Dark/Light Mode** - Complete theme system with automatic system detection
- **Theme Persistence** - User preferences saved and restored across sessions
- **Settings Management** - Comprehensive settings screen with theme, text size, and privacy controls
- **List/Card View Toggle** - Flexible event viewing options for different user preferences
- **Modern UI** - Clean, intuitive design with consistent styling
- **Responsive Design** - Optimized for all screen sizes
- **Loading States** - Smooth loading indicators throughout
- **Error Handling** - User-friendly error messages and recovery
- **Offline Resilience** - Graceful handling of network issues
- **Keyboard Optimization** - Smart keyboard handling with auto-scroll and position preservation
- **Social Media Integration** - Connect Instagram, X (Twitter), and LinkedIn profiles
- **Event Sharing** - Native sharing functionality for events

## 🏗️ **Technical Architecture**

### **Frontend Stack**
- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and build system
- **TypeScript** - Type-safe development with strict mode
- **NativeWind** - Tailwind CSS for React Native
- **Zustand** - Lightweight state management
- **React Navigation** - Navigation and routing
- **React Hook Form** - Form handling and validation
- **KeyboardAwareScrollView** - Enhanced keyboard handling for better UX
- **Expo Image Picker** - Native image selection with camera and gallery support
- **Expo Image Manipulator** - Image compression and resizing

### **UI/UX Features**
- **Theme System** - Complete dark/light mode with React Context
- **Settings Store** - Persistent user preferences with AsyncStorage
- **Dynamic Styling** - Theme-aware components with real-time switching
- **Keyboard Optimization** - Enhanced TextInput handling with proper navigation
- **View Toggles** - Flexible list/card views for content browsing
- **Responsive Components** - Adaptive layouts for all screen sizes
- **Image Optimization** - Automatic compression (800px max width, 80% quality)
- **Media Preview** - Thumbnail previews for uploaded images (120x120px comments, 80x80px replies)

### **Backend & Services**
- **Firebase Firestore** - Real-time NoSQL database with advanced security rules
- **Firebase Authentication** - User authentication and management
- **Firebase Storage** - Image and file storage with CDN
- **Firebase Analytics** - User behavior and app performance tracking
- **Expo Notifications** - Cross-platform push notifications
- **Firebase Composite Indexes** - Optimized queries for social features
- **Real-time Subscriptions** - Live updates for friends, comments, and notifications

### **Development Tools**
- **EAS Build** - Cloud-based build service
- **TypeScript Strict Mode** - Enhanced type checking
- **ESLint & Prettier** - Code quality and formatting
- **Git** - Version control with conventional commits

## 📱 **User Roles & Permissions**

### 👑 **Admin Users**
- ✅ All member capabilities
- ✅ Approve/reject member-created events
- ✅ Create auto-approved events
- ✅ Manage monthly book selections
- ✅ Upload book cover images
- ✅ Access admin panel and analytics
- ✅ User management capabilities

### 👤 **Member Users**
- ✅ Create events (pending admin approval)
- ✅ RSVP to events
- ✅ Comment on events with @mentions
- ✅ Customize profile (bio, hobbies, books, social media links)
- ✅ Upload profile pictures
- ✅ Send and receive friend requests
- ✅ Comment on friends' profile walls
- ✅ Search and discover other members
- ✅ View monthly book selections
- ✅ Receive real-time notifications
- ✅ Share events via native sharing

## 🔐 **Account Recovery System**

The SCBC app includes a comprehensive account recovery system to help users regain access to their accounts when they forget their password or username.

### **🔑 Password Recovery**

**How it works:**
1. User clicks "Forgot Password?" on the login screen
2. User enters their email address
3. System validates that the email exists in Firebase Auth
4. Password reset email is sent via Firebase's secure system
5. User follows the email instructions to reset their password

**Security Features:**
- ✅ **Email Validation** - Only sends reset emails to registered accounts
- ✅ **Firebase Integration** - Uses Firebase Auth's secure password reset system
- ✅ **Time-Limited Links** - Reset links expire automatically for security
- ✅ **Rate Limiting** - Firebase automatically prevents spam requests

### **👤 Username Recovery**

**How it works:**
1. User switches to the "Find Username" tab in account recovery
2. User enters their display name (exact or partial)
3. System searches Firestore for matching accounts
4. If accounts are found, user can send password reset emails directly
5. User receives reset email and can regain access to their account

**Search Features:**
- ✅ **Exact Matching** - Searches for exact display name matches first
- ✅ **Partial Matching** - Falls back to partial name matching for better UX
- ✅ **Multiple Results** - Handles cases where multiple accounts might match
- ✅ **Search Limits** - Results limited to 10 matches to prevent database abuse
- ✅ **Minimum Length** - Requires at least 2 characters for partial searches

### **🛡️ Security & Privacy**

**Data Protection:**
- No sensitive data is exposed in search results
- Only display names and email addresses are shown (data users already share publicly)
- Password reset emails are handled entirely by Firebase
- No plaintext passwords are ever stored or transmitted

**Anti-Abuse Measures:**
- Firebase's built-in rate limiting prevents spam
- Search results are limited to prevent database abuse
- No account enumeration attacks (email validation is done securely)
- Reset links expire automatically for security

### **📱 User Experience**

**Interface Features:**
- **Tabbed Design** - Clean separation between password and username recovery
- **Progress Indicators** - Loading states during API calls
- **Success Feedback** - Clear confirmation when reset emails are sent
- **Helpful Guidance** - Instructions and tips for users throughout the process
- **Easy Navigation** - Simple back-to-login functionality

**Accessibility:**
- Proper form validation and error messaging
- Keyboard navigation support
- Screen reader friendly labels and descriptions
- Touch-friendly button sizes and spacing

### **🔧 Technical Implementation**

**Auth Service Functions:**
```typescript
// Send password reset email
sendPasswordReset(email: string): Promise<void>

// Check if email exists in Firebase Auth
checkEmailExists(email: string): Promise<boolean>

// Find exact display name matches
findUserByDisplayName(displayName: string): Promise<string[]>

// Search for partial display name matches
searchUsersByDisplayName(partialName: string): Promise<UserMatch[]>
```

**Error Handling:**
- Comprehensive error messages for different failure scenarios
- Network error handling with retry options
- User-friendly error messages that don't reveal sensitive information
- Rate limiting protection with appropriate user feedback

**Files Modified:**
- `src/services/authService.ts` - Added recovery functions
- `src/screens/auth/AccountRecoveryScreen.tsx` - New recovery screen
- `src/navigation/AuthNavigator.tsx` - Added recovery route
- `src/screens/auth/LoginScreen.tsx` - Added "Forgot Password?" link
- `src/types/errors.ts` - Enhanced error handling for recovery scenarios

## 👥 **Social Features System**

The SCBC app includes a comprehensive social networking system that allows members to connect, interact, and build community relationships through friend connections and profile interactions.

### **🤝 Friend System**

**Core Features:**
- **Friend Requests** - Send, accept, decline, and cancel friend requests
- **Friend Discovery** - Search for other members by name or email
- **Real-time Updates** - Live notifications for friend request activities
- **Friend Management** - View and manage your friend connections

**How it works:**
1. **Discovery**: Search for members in the "Discover" tab
2. **Friend Requests**: Send requests to other members
3. **Notifications**: Receive real-time notifications for new requests
4. **Management**: Accept/decline incoming requests, cancel outgoing ones
5. **Connections**: Build your friend network within the book club

**Permission System:**
- ✅ **Search & Discovery** - All authenticated members can search for others
- ✅ **Friend Requests** - Any member can send requests to any other member
- ✅ **Privacy Controls** - Only friends can comment on profile walls
- ✅ **Mutual Connections** - Friend relationships are bidirectional

### **💬 Profile Comment Walls**

**Features:**
- **Friends-Only Commenting** - Only friends can comment on each other's profiles
- **Real-time Updates** - Live comment feeds with instant updates
- **@Mention Support** - Tag other users in profile comments
- **Nested Replies** - Reply to comments with threaded conversations
- **Comment Management** - Delete your own comments or comments on your profile
- **Rich Profiles** - Enhanced profiles with social media links and detailed information

**Comment Permissions:**
- ✅ **View Comments** - All authenticated users can view profile comments
- ✅ **Create Comments** - Only friends can comment on profiles
- ✅ **Edit Comments** - Users can edit their own comments
- ✅ **Delete Comments** - Users can delete their own comments or comments on their profile
- ✅ **Reply to Comments** - Friends can reply to existing comments

**User Experience:**
- **Keyboard Optimization** - Smart keyboard handling that preserves scroll position
- **Real-time Sync** - Comments appear instantly without page refresh
- **Mention Notifications** - Get notified when mentioned in profile comments
- **Comment Notifications** - Receive alerts for new comments on your profile

### **🔔 Enhanced Notification System**

**Social Notifications:**
- **Friend Requests** - Notifications when someone sends you a friend request
- **Friend Acceptance** - Alerts when someone accepts your friend request
- **Profile Comments** - Notifications for new comments on your profile
- **Comment Replies** - Alerts when someone replies to your profile comments
- **RSVP Updates** - Event hosts get notified when users RSVP or change status

**Notification Features:**
- **Date Grouping** - Notifications organized by Today, Yesterday, and specific dates
- **Read/Unread Status** - Mark notifications as read individually or in bulk
- **Notification Badge** - Unread count displayed in navigation
- **Rich Content** - Notifications include user avatars, names, and relevant context
- **Quick Actions** - Navigate directly to relevant content from notifications

### **🔍 User Discovery & Search**

**Search Capabilities:**
- **Name Search** - Find users by display name (exact and partial matching)
- **Real-time Results** - Search results update as you type
- **Search Filters** - Automatically filters out yourself and existing friends
- **Result Limits** - Limited to 10 results to prevent performance issues

**Discovery Features:**
- **Member Profiles** - View detailed profiles before sending friend requests
- **Social Links** - Connect with members on Instagram, X (Twitter), and LinkedIn
- **Friend Status** - See current relationship status (friend, request sent, etc.)
- **Quick Actions** - Send friend requests directly from search results

### **🔐 Privacy & Security**

**Data Protection:**
- **Friend-Only Interactions** - Profile comments restricted to friend connections
- **Secure Friend Requests** - Protected against spam and abuse
- **Privacy-First Search** - No sensitive information exposed in search results
- **Controlled Visibility** - Users control who can interact with their profiles

**Security Measures:**
- **Firebase Security Rules** - Comprehensive database-level permission controls
- **Authentication Required** - All social features require user authentication
- **Rate Limiting** - Search and friend request limits prevent abuse
- **Data Validation** - Client and server-side validation for all social interactions

### **🛠️ Technical Implementation**

**Firebase Collections:**
```typescript
// Friend Requests
interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
  updatedAt: Date;
}

// Friendships (bidirectional)
interface Friendship {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt: Date;
}

// Profile Comments
interface ProfileComment {
  id: string;
  profileUserId: string;
  authorId: string;
  content: string;
  mentions?: Mention[];
  parentCommentId?: string; // For replies
  isReply?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Key Services:**
- `src/services/friendService.ts` - Friend request and friendship management
- `src/services/profileCommentService.ts` - Profile comment operations
- `src/services/internalNotificationService.ts` - Enhanced notification system

**UI Components:**
- `src/components/friends/FriendRequestButton.tsx` - Dynamic friend action button
- `src/components/profile/ProfileCommentWall.tsx` - Profile comment interface
- `src/screens/friends/FriendsScreen.tsx` - Comprehensive friend management
- `src/screens/NotificationsScreen.tsx` - Enhanced notification center

**Firebase Security Rules:**
```javascript
// Friend Requests - users can read their own and create new ones
match /friendRequests/{requestId} {
  allow read: if request.auth != null && 
    (request.auth.uid == resource.data.fromUserId || 
     request.auth.uid == resource.data.toUserId);
  allow create: if request.auth != null && 
    request.auth.uid == request.resource.data.fromUserId;
  allow update: if request.auth != null && 
    request.auth.uid == resource.data.toUserId;
}

// Profile Comments - friends can comment on each other's profiles
match /profileComments/{commentId} {
  allow read: if request.auth != null;
  allow create: if request.auth != null && 
    request.auth.uid == request.resource.data.authorId;
  allow delete: if request.auth != null && 
    (request.auth.uid == resource.data.authorId || 
     request.auth.uid == resource.data.profileUserId);
}
```

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+ and npm
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (Mac) or Android Emulator
- Firebase project with Firestore, Auth, and Storage enabled

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SCBCApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Create .env file with Firebase configuration
   EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
   EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Set up Firebase Security Rules**
   
   **Firestore Rules:**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users - read/write own, read others for profiles/mentions
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
         allow read: if request.auth != null;
       }
       
       // Events rules
       match /events/{eventId} {
         allow read: if request.auth != null;
         allow create: if request.auth != null;
         allow update, delete: if request.auth != null && 
           (request.auth.uid == resource.data.createdBy || 
            get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
       }
       
       // RSVPs rules
       match /rsvps/{rsvpId} {
         allow read: if request.auth != null;
         allow create, update: if request.auth != null && request.auth.uid == request.resource.data.userId;
         allow delete: if request.auth != null && request.auth.uid == resource.data.userId;
       }
       
       // Comments rules
       match /comments/{commentId} {
         allow read: if request.auth != null;
         allow create: if request.auth != null;
         allow update, delete: if request.auth != null && 
           (request.auth.uid == resource.data.userId || 
            get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
       }
       
       // Notifications rules - users can read/write their own notifications
       match /notifications/{notificationId} {
         allow read: if request.auth != null && 
           (request.auth.uid == resource.data.userId || 
            request.auth.uid == resource.data.fromUserId);
         allow create: if request.auth != null;
         allow update: if request.auth != null && request.auth.uid == resource.data.userId;
         allow delete: if request.auth != null && request.auth.uid == resource.data.userId;
       }
       
       // Notification settings rules
       match /notificationSettings/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       
       // Friend requests - users can read their own incoming/outgoing requests
       match /friendRequests/{requestId} {
         allow read: if request.auth != null && 
           (request.auth.uid == resource.data.fromUserId || 
            request.auth.uid == resource.data.toUserId);
         allow create: if request.auth != null && 
           request.auth.uid == request.resource.data.fromUserId;
         allow update: if request.auth != null && 
           request.auth.uid == resource.data.toUserId && 
           request.resource.data.status in ['accepted', 'declined'];
         allow delete: if request.auth != null && 
           request.auth.uid == resource.data.fromUserId;
       }

       // Friendships - users can read their own friendships
       match /friendships/{friendshipId} {
         allow read: if request.auth != null && 
           (request.auth.uid == resource.data.user1Id || 
            request.auth.uid == resource.data.user2Id);
         allow create: if request.auth != null;
         allow delete: if request.auth != null && 
           (request.auth.uid == resource.data.user1Id || 
            request.auth.uid == resource.data.user2Id);
       }

       // Profile comments - friends can comment on each other's profiles
       match /profileComments/{commentId} {
         allow read: if request.auth != null;
         allow create: if request.auth != null && 
           request.auth.uid == request.resource.data.authorId;
         allow update: if request.auth != null && 
           request.auth.uid == resource.data.authorId;
         allow delete: if request.auth != null && 
           (request.auth.uid == resource.data.authorId || 
            request.auth.uid == resource.data.profileUserId);
       }
       
       // Monthly books rules
       match /monthlyBooks/{bookId} {
         allow read: if request.auth != null;
         allow write: if request.auth != null && 
           get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
       }
       
       // FAQs rules
       match /faqs/{faqId} {
         allow read: if request.auth != null;
         allow write: if request.auth != null && 
           get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
       }

       // WhatsApp community rules
       match /whatsapp_community/{communityId} {
         allow read: if request.auth != null;
         allow create, update, delete: if request.auth != null 
           && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
       }
     }
   }
   ```

   **Firebase Composite Indexes:**
   ```json
   {
     "indexes": [
       {
         "collectionGroup": "notifications",
         "queryScope": "COLLECTION",
         "fields": [
           {"fieldPath": "userId", "order": "ASCENDING"},
           {"fieldPath": "createdAt", "order": "DESCENDING"}
         ]
       },
       {
         "collectionGroup": "profileComments",
         "queryScope": "COLLECTION",
         "fields": [
           {"fieldPath": "profileUserId", "order": "ASCENDING"},
           {"fieldPath": "createdAt", "order": "DESCENDING"}
         ]
       }
     ]
   }
   ```

   **Deploy Firebase Rules and Indexes:**
   ```bash
   # Install Firebase CLI
   npm install -g firebase-tools
   
   # Login and initialize
   firebase login
   firebase init firestore --project your-project-id
   
   # Deploy rules and indexes
   firebase deploy --only firestore:rules
   firebase deploy --only firestore:indexes
   ```

   **Storage Rules:**
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /profile-pictures/{allPaths=**} {
         allow read: if true;
       }
       match /profile-pictures/{fileName} {
         allow write, delete: if request.auth != null 
           && fileName.matches('.*' + request.auth.uid + '.*');
       }
       match /event-headers/{allPaths=**} {
         allow read: if request.auth != null;
         allow write, delete: if request.auth != null;
       }
       match /monthlyBooks/{bookId}/{allPaths=**} {
         allow read: if request.auth != null;
         allow write, delete: if request.auth != null 
           && firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
       }
     }
   }
   ```

5. **Start the development server**
   ```bash
   npm start
   ```

### **Development Commands**

> **Note**: This app uses **Expo Development Build** when running `npm start` or `expo start`. This provides native functionality and proper Firebase integration while maintaining fast development iteration.

```bash
# Start development server (uses Expo Development Build)
npm start

# Start with specific platform
npm run ios
npm run android

# Build for production
eas build --platform all

# Submit to app stores
eas submit --platform all

# Firebase deployment commands
firebase deploy --only firestore:rules    # Deploy security rules
firebase deploy --only firestore:indexes  # Deploy composite indexes
firebase deploy --only firestore         # Deploy both rules and indexes
```

### **New Dependencies Added**
```bash
# Social features and enhanced UX
npm install react-native-keyboard-aware-scroll-view

# Firebase CLI for rules and index management
npm install -g firebase-tools
```

## 📁 **Project Structure**

```
src/
├── components/
│   ├── common/              # Reusable UI components
│   │   ├── Button.tsx       # Enhanced button with variants & sizes
│   │   ├── EmptyState.tsx   # Standardized empty state component  
│   │   ├── LoadingState.tsx # Standardized loading component
│   │   ├── NotificationBadge.tsx # Unread notification count badge
│   │   └── ...              # Other common components
│   ├── events/              # Event-related components
│   ├── friends/             # Friend system components
│   │   └── FriendRequestButton.tsx # Dynamic friend action button
│   ├── navigation/          # Navigation components
│   ├── profile/             # Profile components
│   │   └── ProfileCommentWall.tsx # Profile comment interface
│   └── user/                # User/profile components
├── screens/
│   ├── admin/               # Admin panel screens
│   ├── auth/                # Authentication screens
│   ├── books/               # Monthly book screens
│   ├── events/              # Event management screens
│   ├── friends/             # Friend management screens
│   │   └── FriendsScreen.tsx # Comprehensive friend management
│   ├── info/                # Information screens
│   ├── profile/             # User profile screens
│   ├── settings/            # Settings and preferences screens
│   └── NotificationsScreen.tsx # Enhanced notification center
├── contexts/
│   └── ThemeContext.tsx     # Theme system and dark/light mode
├── services/
│   ├── authService.ts       # Authentication logic
│   ├── eventService.ts      # Event management
│   ├── friendService.ts     # Friend request and friendship management
│   ├── internalNotificationService.ts # In-app notification system
│   ├── monthlyBookService.ts # Book management
│   ├── notificationService.ts # Push notifications
│   ├── profileCommentService.ts # Profile comment operations
│   └── userService.ts       # User operations
├── stores/
│   ├── authStore.ts         # Authentication state
│   ├── eventStore.ts        # Event state
│   └── settingsStore.ts     # User preferences and settings
├── styles/
│   └── commonStyles.ts      # Reusable style patterns & components
├── types/
│   ├── index.ts             # Core type definitions
│   ├── mentions.ts          # @mention system types
│   └── settings.ts          # Settings and preferences types
├── navigation/              # Navigation configuration
├── hooks/                   # Custom React hooks
├── utils/
│   ├── dateTimeUtils.ts     # Centralized date/time formatting
│   └── ...                  # Other utility functions
└── config/                  # App configuration
```

## 🔧 **Configuration**

### **Key Configuration Files**
- `src/config/constants.ts` - App-wide constants and limits
- `src/config/firebase.ts` - Firebase initialization
- `app.json` - Expo configuration
- `eas.json` - Build configuration

### **Development & Documentation Files**
- `BUGS_TO_FIX.md` - Bug tracking and issue management
- `DEVELOPMENT_NOTES.md` - Development context and decisions
- `PRODUCTION_CHECKLIST.md` - Pre-deployment checklist
- `FEATURES_DEMO.md` - Feature demonstrations and guides

### **Environment Variables**
All sensitive configuration is managed through environment variables. See `.env.example` for required variables.

## 🧪 **Testing**

```bash
# Run unit tests (when implemented)
npm test

# Run E2E tests (when implemented)
npm run test:e2e

# Type checking
npx tsc --noEmit
```

## 📦 **Deployment**

### **Build Process**
1. **Development Build**
   ```bash
   eas build --profile development
   ```

2. **Preview Build**
   ```bash
   eas build --profile preview
   ```

3. **Production Build**
   ```bash
   eas build --profile production
   ```

### **App Store Submission**
```bash
# iOS App Store
eas submit --platform ios

# Google Play Store
eas submit --platform android
```

## 🔒 **Security**

- **Firebase Security Rules** - Comprehensive database and storage protection
- **Role-Based Access Control** - Admin/member permission system
- **Input Validation** - Client and server-side validation
- **Environment Variables** - Secure configuration management
- **Authentication** - Firebase Auth with email/password

## 📊 **Performance**

- **Optimized Queries** - Efficient Firestore queries with pagination
- **Image Optimization** - Compressed uploads and CDN delivery
- **Real-time Updates** - Efficient WebSocket connections
- **Caching Strategy** - Smart caching for improved performance
- **Bundle Size** - Optimized for fast app startup

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- Seattle Chinatown Book Club community
- AANHPI literary community
- Open source contributors
- Firebase and Expo teams

## 📞 **Support**

For support, email seattlechinatownbookclub@gmail.com or create an issue in this repository.

---

<div align="center">

**Built with ❤️ for the Seattle Chinatown Book Club community**

*Connecting readers, celebrating AANHPI voices, building community*

</div>