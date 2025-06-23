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

## 🆕 **Recent Updates (June 2025)**

### **Meeting Details Management**
- **In-Person & Virtual Meeting Details** - Admin-editable meeting information for monthly book discussions
- **Zoom Integration** - Enhanced Zoom link handling with email, phone, and clipboard options
- **Meeting Cards Interface** - Clean card-based design for displaying meeting information
- **Admin-Only Editing** - Role-based permissions for meeting details management

### **User Interface Improvements**
- **Navigation Updates** - Cleaner menu item names ("About Us", "Contact Us", "Leave Feedback")
- **Page Rename** - "Monthly Book" → "Monthly Meeting Details" for clarity
- **Emoji Removal** - Comprehensive removal of emojis throughout the application for professional appearance
- **Color Scheme Update** - Modern red color scheme (#dc2626) replacing purple/pink for better accessibility

### **Event System Enhancements**
- **Event Status Synchronization** - Fixed inconsistencies between "My Events" and "Upcoming Events"
- **Timezone Handling** - Proper PST timezone support across all event displays
- **Status Indicators** - Consistent "Event in Progress", "Upcoming Event", and "Past Event" statuses
- **View Styling** - Synchronized list view styling between event tabs

### **Admin Panel Streamlining**
- **FAQ Management** - Removed publish/draft complexity, all FAQs auto-published
- **Statistics Removal** - Cleaner interfaces with removal of statistical summary boxes
- **Notification Fixes** - Resolved TypeScript errors and improved notification handling

### **Accessibility & UX**
- **WCAG AA Compliance** - Color-blind friendly red color scheme with proper contrast ratios
- **508 Compliance** - Accessible color choices for government and enterprise use
- **Professional Design** - Removed decorative elements for cleaner, more professional appearance

### **Critical Bug Fixes**
- **Event Duration Calculation** - Fixed hardcoded 4-hour assumption to use actual event start/end times
- **Event Status Accuracy** - Events now correctly transition from "Event in Progress" to "Past Event" based on actual duration
- **Past Events Header Images** - Fixed missing header images in Past Events card view
- **Time String Parsing** - Enhanced error handling for malformed time data with graceful fallbacks
- **Event Filtering** - Resolved inconsistencies in event categorization across all tabs

## ✨ **Key Features**

### 📅 **Event Management**
- **Create & Host Events** - Members can create book club events with rich details
- **Admin Approval System** - All member-created events require admin approval
- **RSVP System** - Going/Maybe/Not Going with real-time attendee counts
- **Event Comments** - Threaded discussions with @mentions and notifications
- **Calendar Integration** - Add events directly to device calendars
- **Image Support** - Upload event header images

### 👥 **User System**
- **Role-Based Access** - Admin and Member roles with different permissions
- **Rich Profiles** - Bio, hobbies, favorite books, profile pictures
- **@Mention System** - Tag users in comments with real-time notifications
- **User Discovery** - Search and view other member profiles

### 📖 **Monthly Meeting Details**
- **Admin-Editable Books** - Complete monthly book selection management
- **Meeting Details Management** - In-person and virtual meeting information with admin controls
- **Zoom Integration** - Enhanced Zoom link handling with email, phone, and clipboard options
- **Book Cover Upload** - Upload and manage book cover images
- **Discussion Sheets** - Link to Google Docs for reading guides
- **Book Details** - Title, author, genre, pages, awards, selection reasoning

### 🔔 **Notification System**
- **Real-Time Notifications** - Instant updates for mentions, comments, events
- **Push Notifications** - Cross-platform notification support
- **Notification Center** - In-app notification management
- **Smart Batching** - Efficient notification delivery

### 🛡️ **Admin Panel**
- **Event Approval** - Review and approve/reject member events
- **User Management** - Manage user roles and permissions
- **Monthly Book Control** - Full CRUD operations for book selections
- **Meeting Details Management** - Control in-person and virtual meeting information
- **FAQ Management** - Streamlined FAQ system with auto-publishing
- **Content Moderation** - Admin oversight of community content

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

## 🏗️ **Technical Architecture**

### **Frontend Stack**
- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and build system
- **TypeScript** - Type-safe development
- **NativeWind** - Tailwind CSS for React Native
- **Zustand** - Lightweight state management
- **React Navigation** - Navigation and routing
- **React Hook Form** - Form handling and validation

### **UI/UX Features**
- **Theme System** - Complete dark/light mode with React Context
- **Settings Store** - Persistent user preferences with AsyncStorage
- **Dynamic Styling** - Theme-aware components with real-time switching
- **Keyboard Optimization** - Enhanced TextInput handling with proper navigation
- **View Toggles** - Flexible list/card views for content browsing
- **Responsive Components** - Adaptive layouts for all screen sizes

### **Backend & Services**
- **Firebase Firestore** - Real-time NoSQL database
- **Firebase Authentication** - User authentication and management
- **Firebase Storage** - Image and file storage with CDN
- **Firebase Analytics** - User behavior and app performance tracking
- **Expo Notifications** - Cross-platform push notifications

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
- ✅ Customize profile (bio, hobbies, books)
- ✅ Upload profile pictures
- ✅ View monthly book selections
- ✅ Receive real-time notifications

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
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
         allow read: if request.auth != null;
       }
       match /events/{eventId} {
         allow read: if request.auth != null;
         allow write: if request.auth != null;
       }
       match /rsvps/{rsvpId} {
         allow read: if request.auth != null;
         allow write: if request.auth != null;
       }
       match /comments/{commentId} {
         allow read: if request.auth != null;
         allow write: if request.auth != null;
       }
       match /monthlyBooks/{bookId} {
         allow read: if request.auth != null;
         allow create, update, delete: if request.auth != null 
           && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
       }
       match /faqs/{faqId} {
         allow read: if request.auth != null;
         allow create, update, delete: if request.auth != null 
           && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
       }
     }
   }
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
```

## 📁 **Project Structure**

```
src/
├── components/
│   ├── common/              # Reusable UI components
│   ├── events/              # Event-related components
│   ├── navigation/          # Navigation components
│   └── user/                # User/profile components
├── screens/
│   ├── admin/               # Admin panel screens
│   ├── auth/                # Authentication screens
│   ├── books/               # Monthly book screens
│   ├── events/              # Event management screens
│   ├── info/                # Information screens
│   ├── profile/             # User profile screens
│   └── settings/            # Settings and preferences screens
├── contexts/
│   └── ThemeContext.tsx     # Theme system and dark/light mode
├── services/
│   ├── authService.ts       # Authentication logic
│   ├── eventService.ts      # Event management
│   ├── monthlyBookService.ts # Book management
│   ├── notificationService.ts # Push notifications
│   └── userService.ts       # User operations
├── stores/
│   ├── authStore.ts         # Authentication state
│   ├── eventStore.ts        # Event state
│   └── settingsStore.ts     # User preferences and settings
├── types/
│   ├── index.ts             # Core type definitions
│   ├── mentions.ts          # @mention system types
│   └── settings.ts          # Settings and preferences types
├── navigation/              # Navigation configuration
├── hooks/                   # Custom React hooks
├── utils/                   # Utility functions
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